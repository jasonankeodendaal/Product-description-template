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
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface PhotoManagerProps {
    photos: Photo[];
    onSave: (photo: Photo) => Promise<void>;
    onUpdate: (photo: Photo) => Promise<void>;
    onDelete: (photo: Photo) => Promise<void>;
}

const PhotoDetailView: React.FC<{
    photo: Photo;
    onUpdate: (updatedPhoto: Photo) => Promise<void>;
    onDelete: (photo: Photo) => Promise<void>;
    onBack: () => void;
}> = ({ photo: initialPhoto, onUpdate, onDelete, onBack }) => {
    const [photo, setPhoto] = useState(initialPhoto);
    const [isSaving, setIsSaving] = useState(false);
    const imageUrl = useMemo(() => URL.createObjectURL(photo.imageBlob), [photo.imageBlob]);

    useEffect(() => {
        setPhoto(initialPhoto);
    }, [initialPhoto]);
    
    useEffect(() => {
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate(photo);
        setIsSaving(false);
    };
    
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${photo.name}"?`)) {
            await onDelete(photo);
            onBack(); // Go back to list after delete
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--theme-card-bg)]">
            <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white">
                        <ChevronLeftIcon />
                    </button>
                    <h2 className="text-lg font-bold text-[var(--theme-text-primary)] truncate">{photo.name}</h2>
                </div>
                 <button onClick={handleDelete} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)] flex-shrink-0 ml-2"><TrashIcon /></button>
            </header>
            
            <div className="flex-grow flex flex-col lg:flex-row overflow-y-auto">
                <div className="w-full lg:w-2/3 h-64 lg:h-auto bg-black/20 flex items-center justify-center flex-shrink-0 p-4">
                    <img src={imageUrl} alt={photo.name} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                </div>
                <div className="w-full lg:w-1/3 p-4 space-y-4 border-l-0 lg:border-l border-[var(--theme-border)]">
                    <InputField label="Name" value={photo.name} onChange={(val) => setPhoto({...photo, name: val})} />
                    <InputField label="Folder" value={photo.folder} onChange={(val) => setPhoto({...photo, folder: val})} />
                    <InputField label="Tags (comma-separated)" value={photo.tags.join(', ')} onChange={(val) => setPhoto({...photo, tags: val.split(',').map(t => t.trim())})} />
                    <TextareaField label="Notes" value={photo.notes} onChange={(val) => setPhoto({...photo, notes: val})} />
                </div>
            </div>

            <footer className="flex-shrink-0 p-4 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/50">
                <button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 bg-[var(--theme-green)] hover:opacity-90 text-black font-bold py-2 px-4 rounded-md disabled:bg-[var(--theme-border)]">
                    {isSaving ? <><Spinner className="h-5 w-5" /> Saving...</> : 'Save Changes'}
                </button>
            </footer>
        </div>
    );
};


export const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, onSave, onUpdate, onDelete }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    useEffect(() => {
        if (selectedPhoto && !photos.find(p => p.id === selectedPhoto.id)) {
            setSelectedPhoto(null);
        }
    }, [photos, selectedPhoto]);

    const photosByFolder = useMemo(() => {
        const sorted = [...photos].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const filtered = sorted.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.folder.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        // FIX: Explicitly typing the accumulator ('acc') in the reduce function ensures correct type inference for 'photosByFolder', resolving downstream errors where properties like '.map' or '.id' were not found.
        return filtered.reduce((acc: Record<string, Photo[]>, photo) => {
            const folder = photo.folder || '_uncategorized';
            if (!acc[folder]) acc[folder] = [];
            acc[folder].push(photo);
            return acc;
        }, {});
    }, [photos, searchTerm]);

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        setUploadCount(files.length);
        try {
            for (const file of Array.from(files)) {
                try {
                    const resizedDataUrl = await resizeImage(file);
                    const imageBlob = dataURLtoBlob(resizedDataUrl);
                    const newPhoto: Photo = {
                        id: crypto.randomUUID(),
                        name: file.name.split('.').slice(0, -1).join('.') || `Image ${Date.now()}`,
                        notes: '',
                        date: new Date().toISOString(),
                        folder: '_uncategorized',
                        imageBlob,
                        imageMimeType: imageBlob.type,
                        tags: [],
                    };
                    await onSave(newPhoto);
                } catch (error) { console.error("Failed to process image:", error); alert(`Failed to process ${file.name}.`); }
            }
        } finally { setIsUploading(false); setUploadCount(0); }
    }, [onSave]);
    
    const handleDeletePhoto = useCallback(async (photo: Photo) => {
        if (window.confirm(`Are you sure you want to delete "${photo.name}"?`)) { await onDelete(photo); }
    }, [onDelete]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected photos?`)) {
            const photosToDelete = photos.filter(p => selectedIds.has(p.id));
            await Promise.all(photosToDelete.map(p => onDelete(p)));
            setSelectedIds(new Set());
            setSelectionMode(false);
        }
    };
    
    const handleSelectAll = () => {
        const allVisibleIds = Object.values(photosByFolder).flat().map(p => p.id);
        setSelectedIds(new Set(allVisibleIds));
    };


    return (
        <div className="flex-1 flex flex-col bg-transparent backdrop-blur-2xl">
            {isCameraOpen && <CameraCapture onClose={() => setIsCameraOpen(false)} onCapture={async (dataUrl) => {
                setIsCameraOpen(false);
                setIsUploading(true); setUploadCount(1);
                try {
                    const resizedDataUrl = await resizeImage(dataURLtoBlob(dataUrl));
                    const imageBlob = dataURLtoBlob(resizedDataUrl);
                    await onSave({ id: crypto.randomUUID(), name: `Capture ${new Date().toLocaleString()}`, notes: '', date: new Date().toISOString(), folder: '_uncategorized', imageBlob, imageMimeType: imageBlob.type, tags: ['camera-capture']});
                } catch(e) { console.error("Failed to save captured photo:", e); alert("Failed to save captured photo."); } 
                finally { setIsUploading(false); setUploadCount(0); }
            }}/>}
           
            <div className="flex-grow flex overflow-hidden">
                <aside className={`w-full lg:w-1/3 lg:max-w-sm flex flex-col border-r border-transparent lg:border-[var(--theme-border)] ${selectedPhoto ? 'hidden lg:flex' : 'flex'}`}>
                     <header className="p-4 flex-shrink-0 border-b border-white/10 space-y-3">
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Search photos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/60 border border-[var(--theme-border)] rounded-lg pl-10 pr-4 py-2.5"/>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="photo-upload" className={`font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2 transition-colors ${ isUploading ? 'bg-[var(--theme-border)] text-[var(--theme-text-secondary)]/50 cursor-not-allowed' : 'cursor-pointer bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)]'}`}>
                                    <input type="file" id="photo-upload" className="sr-only" onChange={(e) => handleFileUpload(e.target.files)} multiple accept="image/*" disabled={isUploading} />
                                    {isUploading ? <Spinner className="h-5 w-5" /> : <UploadIcon />} <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
                                </label>
                                <button onClick={() => setIsCameraOpen(true)} disabled={isUploading} className="bg-[var(--theme-green)] text-black font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50">
                                    <CameraIcon className="h-5 w-5" /> <span className="hidden sm:inline">Capture</span>
                                </button>
                            </div>
                            <button onClick={() => { setSelectionMode(p => !p); setSelectedIds(new Set()); }} className={`font-semibold py-2 px-3 rounded-md text-sm ${selectionMode ? 'bg-green-500/20 text-green-400' : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]'}`}>Select</button>
                        </div>
                    </header>
                    <div className="flex-grow overflow-y-auto no-scrollbar pb-24 lg:pb-2">
                        {Object.entries(photosByFolder).map(([folder, folderPhotos]) => (
                            <section key={folder} className="p-2">
                                <h3 className="font-bold text-sm text-gray-400 px-2 py-1 uppercase tracking-wider">{folder.replace(/_/g, ' ')}</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 mt-1">
                                    {isUploading && folder === '_uncategorized' && Array.from({ length: uploadCount }).map((_, i) => <div key={`skel-${i}`} className="aspect-square bg-[var(--theme-card-bg)]/50 rounded-md animate-pulse"></div>)}
                                    {folderPhotos.map(photo => <PhotoThumbnail key={photo.id} photo={photo} onSelect={setSelectedPhoto} onDelete={handleDeletePhoto} isSelected={selectedIds.has(photo.id)} isSelectionActive={selectionMode} onToggleSelection={toggleSelection}/>)}
                                </div>
                            </section>
                        ))}
                    </div>
                </aside>
                <main className={`flex-1 flex-col ${selectedPhoto ? 'flex' : 'hidden lg:flex'}`}>
                    {selectedPhoto ? <PhotoDetailView photo={selectedPhoto} onUpdate={onUpdate} onDelete={onDelete} onBack={() => setSelectedPhoto(null)} /> : (
                        <div className="hidden lg:flex w-full h-full items-center justify-center text-center text-[var(--theme-text-secondary)] p-8">
                            <div>
                                <PhotoIcon />
                                <h2 className="mt-4 text-xl font-semibold text-[var(--theme-text-primary)]">Your Photo Details</h2>
                                <p className="mt-1 max-w-sm">Select a photo from the library on the left to view its details, make edits, or delete it.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {selectionMode && selectedIds.size > 0 && (
                <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl p-3 flex items-center gap-4 animate-fade-in-down border border-white/10">
                    <span className="font-semibold text-white">{selectedIds.size} selected</span>
                    <button onClick={handleSelectAll} className="text-sm text-green-400 hover:underline">Select All</button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button onClick={handleDeleteSelected} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"><TrashIcon /> Delete</button>
                    <button onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }} className="p-1 -mr-1 text-gray-400 hover:text-white"><XIcon /></button>
                </div>
            )}
        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (<div><label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-2"/></div>);
const TextareaField: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (<div><label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-2 resize-y"/></div>);
