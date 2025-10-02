import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Photo } from '../App';
import { PhotoThumbnail } from './PhotoThumbnail';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CameraCapture } from './CameraCapture';
import { resizeImage } from '../utils/imageUtils';
import { dataURLtoBlob } from '../utils/dataUtils';
import { Spinner } from './icons/Spinner';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { formatDateGroup } from '../utils/formatters';

interface PhotoManagerProps {
    photos: Photo[];
    onSave: (photo: Photo) => Promise<void>;
    onUpdate: (photo: Photo) => Promise<void>;
    onDelete: (photo: Photo) => Promise<void>;
}

// --- Sub-components ---

const InputField: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-2 text-white" />
    </div>
);
const TextareaField: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-2 resize-y text-white" />
    </div>
);

const PhotoDetailModal: React.FC<{
    photo: Photo;
    onUpdate: (updatedPhoto: Photo) => Promise<void>;
    onDelete: (photo: Photo) => Promise<void>;
    onClose: () => void;
}> = ({ photo: initialPhoto, onUpdate, onDelete, onClose }) => {
    const [photo, setPhoto] = useState(initialPhoto);
    const [isSaving, setIsSaving] = useState(false);
    const imageUrl = useMemo(() => URL.createObjectURL(photo.imageBlob), [photo.imageBlob]);

    useEffect(() => { setPhoto(initialPhoto); }, [initialPhoto]);
    
    useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate(photo);
        setIsSaving(false);
        onClose();
    };
    
    const handleDelete = async () => {
        await onDelete(photo);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-card-bg)] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--theme-text-primary)] truncate">{photo.name}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)] hover:text-white"><XIcon /></button>
                </header>
                
                <div className="flex-grow flex flex-col md:flex-row overflow-y-auto">
                    <div className="w-full md:w-2/3 h-64 md:h-auto bg-black/20 flex items-center justify-center flex-shrink-0 p-4">
                        <img src={imageUrl} alt={photo.name} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                    </div>
                    <div className="w-full md:w-1/3 p-6 space-y-4 border-l-0 md:border-l border-[var(--theme-border)]">
                        <InputField label="Name" value={photo.name} onChange={(val) => setPhoto({...photo, name: val})} />
                        <InputField label="Folder" value={photo.folder} onChange={(val) => setPhoto({...photo, folder: val})} />
                        <InputField label="Tags (comma-separated)" value={photo.tags.join(', ')} onChange={(val) => setPhoto({...photo, tags: val.split(',').map(t => t.trim())})} />
                        <TextareaField label="Notes" value={photo.notes} onChange={(val) => setPhoto({...photo, notes: val})} />
                    </div>
                </div>

                <footer className="flex-shrink-0 p-4 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/50 flex justify-between items-center">
                    <button onClick={handleDelete} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 flex items-center gap-2"><TrashIcon /> Delete Photo</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-[var(--theme-green)] hover:opacity-90 text-black font-bold py-2 px-6 rounded-md disabled:bg-[var(--theme-border)]">
                        {isSaving ? <Spinner className="h-5 w-5" /> : 'Save & Close'}
                    </button>
                </footer>
            </div>
        </div>
    );
};


// --- Main Component ---

export const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, onSave, onUpdate, onDelete }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewGroup, setViewGroup] = useState<'date' | 'folder'>('date');
    
    useEffect(() => {
        if (selectedPhoto && !photos.find(p => p.id === selectedPhoto.id)) {
            setSelectedPhoto(null);
        }
    }, [photos, selectedPhoto]);

    const groupedPhotos = useMemo(() => {
        const sorted = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const filtered = sorted.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.folder.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (viewGroup === 'date') {
            return filtered.reduce((acc, photo) => {
                const group = formatDateGroup(photo.date);
                if (!acc[group]) acc[group] = [];
                acc[group].push(photo);
                return acc;
            }, {} as Record<string, Photo[]>);
        } else { // 'folder'
            return filtered.reduce((acc, photo) => {
                const folder = photo.folder || '_uncategorized';
                if (!acc[folder]) acc[folder] = [];
                acc[folder].push(photo);
                return acc;
            }, {} as Record<string, Photo[]>);
        }
    }, [photos, searchTerm, viewGroup]);

    const sortedGroupKeys = useMemo(() => {
        const keys = Object.keys(groupedPhotos);
        if (viewGroup === 'date') {
            const groupOrder = ["Today", "Yesterday", "This Week", "Last Week", "This Month"];
            return keys.sort((a, b) => {
                const aIndex = groupOrder.indexOf(a);
                const bIndex = groupOrder.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return b.localeCompare(a); // Sort month-year strings descending
            });
        }
        return keys.sort(); // Sort folder names alphabetically
    }, [groupedPhotos, viewGroup]);

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        setUploadCount(files.length);
        try {
            for (const file of Array.from(files)) {
                try {
                    const resizedDataUrl = await resizeImage(file);
                    const imageBlob = dataURLtoBlob(resizedDataUrl);
                    const newPhoto: Photo = { id: crypto.randomUUID(), name: file.name.split('.').slice(0, -1).join('.') || `Image ${Date.now()}`, notes: '', date: new Date().toISOString(), folder: '_uncategorized', imageBlob, imageMimeType: imageBlob.type, tags: [] };
                    await onSave(newPhoto);
                } catch (error) { console.error("Failed to process image:", error); alert(`Failed to process ${file.name}.`); }
            }
        } finally { setIsUploading(false); setUploadCount(0); }
    }, [onSave]);
    
    const handleDeletePhoto = useCallback(async (photo: Photo) => {
        await onDelete(photo);
    }, [onDelete]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const handleDeleteSelected = async () => {
        const photosToDelete = photos.filter(p => selectedIds.has(p.id));
        await Promise.all(photosToDelete.map(p => onDelete(p)));
        setSelectedIds(new Set());
        setSelectionMode(false);
    };

    // FIX: Refactored to use Object.keys().flatMap() to avoid type inference issues with Object.values().flat() which can result in `unknown[]`.
    const allVisiblePhotoIds = useMemo(() => Object.keys(groupedPhotos).flatMap(key => groupedPhotos[key].map(p => p.id)), [groupedPhotos]);
    const handleSelectAll = () => setSelectedIds(new Set(allVisiblePhotoIds));
    const allSelected = allVisiblePhotoIds.length > 0 && selectedIds.size === allVisiblePhotoIds.length;
    const handleToggleSelectAll = () => allSelected ? setSelectedIds(new Set()) : handleSelectAll();

    return (
        <div className="flex-1 flex flex-col bg-[#0D1117] overflow-hidden">
            {isCameraOpen && <CameraCapture onClose={() => setIsCameraOpen(false)} onCapture={async (dataUrl) => {
                setIsCameraOpen(false);
                setIsUploading(true); setUploadCount(1);
                try {
                    const imageBlob = await resizeImage(dataURLtoBlob(dataUrl)).then(dataURLtoBlob);
                    await onSave({ id: crypto.randomUUID(), name: `Capture ${new Date().toLocaleString()}`, notes: '', date: new Date().toISOString(), folder: '_uncategorized', imageBlob, imageMimeType: imageBlob.type, tags: ['camera-capture']});
                } catch(e) { console.error("Failed to save captured photo:", e); alert("Failed to save captured photo."); } 
                finally { setIsUploading(false); setUploadCount(0); }
            }}/>}
            {selectedPhoto && <PhotoDetailModal photo={selectedPhoto} onUpdate={onUpdate} onDelete={handleDeletePhoto} onClose={() => setSelectedPhoto(null)} />}
           
            <header className="photo-manager-header">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-[var(--theme-text-secondary)]" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search photos..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="photo-search-input"
                    />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-full">
                        <button onClick={() => setViewGroup('date')} className={`px-3 py-1 text-xs font-semibold rounded-full ${viewGroup === 'date' ? 'bg-orange-500 text-black' : 'text-gray-300'}`}>Date</button>
                        <button onClick={() => setViewGroup('folder')} className={`px-3 py-1 text-xs font-semibold rounded-full ${viewGroup === 'folder' ? 'bg-orange-500 text-black' : 'text-gray-300'}`}>Folder</button>
                    </div>
                    <button 
                        onClick={() => { setSelectionMode(p => !p); setSelectedIds(new Set()); }} 
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectionMode ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/80'}`}
                    >
                        {selectionMode ? 'Cancel' : 'Select'}
                    </button>
                </div>
            </header>
            
            <main className="flex-grow overflow-y-auto no-scrollbar pb-36 lg:pb-2">
                {allVisiblePhotoIds.length === 0 && !isUploading ? (
                    <div className="empty-library-container">
                        <PhotoIcon className="empty-library-icon" />
                        <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">Your photo library is empty</h3>
                        <p className="text-sm mt-1">Use the camera or upload buttons to add your first photo.</p>
                    </div>
                ) : (
                    sortedGroupKeys.map(group => (
                        <section key={group}>
                            <h3 className="folder-grid-header">{group.replace(/_/g, ' ')} ({groupedPhotos[group].length})</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 px-4">
                                {isUploading && (group === 'Today' || group === '_uncategorized') && Array.from({ length: uploadCount }).map((_, i) => <div key={`skel-${i}`} className="aspect-square bg-[var(--theme-card-bg)]/50 rounded-md animate-pulse"></div>)}
                                {groupedPhotos[group].map(photo => <PhotoThumbnail key={photo.id} photo={photo} onSelect={setSelectedPhoto} onDelete={handleDeletePhoto} isSelected={selectedIds.has(photo.id)} isSelectionActive={selectionMode} onToggleSelection={toggleSelection}/>)}
                            </div>
                        </section>
                    ))
                )}
            </main>

            {/* Main Action FABs */}
            {!selectionMode && (
                <div className="fixed bottom-24 lg:bottom-6 right-4 z-30 flex flex-col items-end gap-3">
                    <label className="bg-sky-500 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-sky-600 transition-colors">
                        <input type="file" className="sr-only" onChange={(e) => handleFileUpload(e.target.files)} multiple accept="image/*" disabled={isUploading} />
                        {isUploading ? <Spinner className="h-6 w-6" /> : <UploadIcon />}
                    </label>
                    <button onClick={() => setIsCameraOpen(true)} className="bg-orange-500 text-black rounded-full p-4 shadow-lg hover:bg-orange-600 transition-colors">
                        <CameraIcon />
                    </button>
                </div>
            )}
            
            {/* Selection Action Bar */}
            {selectionMode && (
                <div className="fixed bottom-24 lg:bottom-0 left-0 right-0 z-50 bg-slate-800/80 backdrop-blur-md p-3 flex items-center justify-center gap-4 animate-fade-in-down border-t border-white/10">
                    <button onClick={handleToggleSelectAll} className="flex items-center gap-2 text-sm font-semibold text-white">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${allSelected ? 'bg-green-500 border-green-400' : 'border-white/50'}`}>
                            {allSelected && <CheckIcon className="w-4 h-4 text-black" />}
                        </div>
                        <span>{selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}</span>
                    </button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button onClick={handleDeleteSelected} disabled={selectedIds.size === 0} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
                        <TrashIcon /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};