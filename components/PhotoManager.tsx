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

    useEffect(() => {
        setPhoto(initialPhoto);
    }, [initialPhoto]);

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
                <div className="w-full lg:w-1/2 h-64 lg:h-auto bg-black/20 flex items-center justify-center flex-shrink-0">
                    <img src={URL.createObjectURL(photo.imageBlob)} alt={photo.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="w-full lg:w-1/2 p-4 space-y-4">
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
    
    useEffect(() => {
        // If the selected photo gets deleted from the main list, deselect it.
        if (selectedPhoto && !photos.find(p => p.id === selectedPhoto.id)) {
            setSelectedPhoto(null);
        }
    }, [photos, selectedPhoto]);

    const filteredPhotos = useMemo(() => {
        const sorted = [...photos].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
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
                } catch (error) {
                    console.error("Failed to process image:", error);
                    alert(`Failed to process ${file.name}.`);
                }
            }
        } finally {
            setIsUploading(false);
            setUploadCount(0);
        }
    }, [onSave]);
    
    const handleDeletePhoto = useCallback(async (photo: Photo) => {
        if (window.confirm(`Are you sure you want to delete "${photo.name}"?`)) {
            await onDelete(photo);
        }
    }, [onDelete]);

    return (
        <div className="flex-1 flex flex-col bg-transparent backdrop-blur-2xl">
            {isCameraOpen && (
                <CameraCapture 
                    onClose={() => setIsCameraOpen(false)} 
                    onCapture={async (dataUrl) => {
                        setIsCameraOpen(false);
                        setIsUploading(true);
                        setUploadCount(1);
                        try {
                            const resizedDataUrl = await resizeImage(dataURLtoBlob(dataUrl));
                            const imageBlob = dataURLtoBlob(resizedDataUrl);
                            const newPhoto: Photo = {
                                id: crypto.randomUUID(),
                                name: `Capture ${new Date().toLocaleString()}`,
                                notes: '',
                                date: new Date().toISOString(),
                                folder: '_uncategorized',
                                imageBlob,
                                imageMimeType: imageBlob.type,
                                tags: ['camera-capture'],
                            };
                            await onSave(newPhoto);
                        } catch(e) {
                            console.error("Failed to save captured photo:", e);
                            alert("Failed to save captured photo.");
                        } finally {
                            setIsUploading(false);
                            setUploadCount(0);
                        }
                    }}
                />
            )}
           
            <div className="flex-grow flex overflow-hidden">
                {/* Photo List/Grid Pane */}
                <aside className={`w-full lg:w-1/3 lg:max-w-sm flex flex-col border-r border-transparent lg:border-[var(--theme-border)] ${selectedPhoto ? 'hidden lg:flex' : 'flex'}`}>
                     <header className="p-4 flex-shrink-0 border-b border-white/10">
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search photos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/60 border border-[var(--theme-border)] rounded-lg pl-10 pr-4 py-2.5 placeholder-slate-400 focus:ring-2 focus:ring-[var(--theme-green)] focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                    </header>
                    <div className="flex-grow overflow-y-auto no-scrollbar pb-24 lg:pb-2">
                        <div className="p-4 flex items-center justify-end gap-2">
                                <label 
                                    htmlFor="photo-upload" 
                                    className={`font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2 transition-colors ${
                                        isUploading 
                                            ? 'bg-[var(--theme-border)] text-[var(--theme-text-secondary)]/50 cursor-not-allowed'
                                            : 'cursor-pointer bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)]'
                                    }`}
                                >
                                    <input type="file" id="photo-upload" className="sr-only" onChange={(e) => handleFileUpload(e.target.files)} multiple accept="image/*" disabled={isUploading} />
                                    {isUploading ? <Spinner className="h-5 w-5" /> : <UploadIcon />}
                                    <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
                                </label>
                                <button 
                                    onClick={() => setIsCameraOpen(true)}
                                    disabled={isUploading}
                                    className="bg-[var(--theme-green)] text-black font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center justify-center gap-2 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)]/50 disabled:cursor-not-allowed"
                                >
                                    <CameraIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">Capture</span>
                                </button>
                        </div>
                         <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 p-2">
                            {isUploading && Array.from({ length: uploadCount }).map((_, index) => (
                                <div key={`skeleton-${index}`} className="aspect-square bg-[var(--theme-card-bg)]/50 rounded-md animate-pulse"></div>
                            ))}
                            {filteredPhotos.map(photo => (
                                <PhotoThumbnail key={photo.id} photo={photo} onSelect={setSelectedPhoto} onDelete={handleDeletePhoto} />
                            ))}
                        </div>
                    </div>
                </aside>

                 {/* Photo Detail Pane */}
                <main className={`flex-1 flex-col ${selectedPhoto ? 'flex' : 'hidden lg:flex'}`}>
                    {selectedPhoto ? (
                        <PhotoDetailView
                            photo={selectedPhoto}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onBack={() => setSelectedPhoto(null)}
                        />
                    ) : (
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
        </div>
    );
};


const InputField: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label>
        <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-2"
        />
    </div>
);
const TextareaField: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label>
        <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-2 resize-y"
        />
    </div>
);
