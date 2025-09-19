
import React, { useState, useMemo, useCallback } from 'react';
import { Photo } from '../App';
import { PhotoThumbnail } from './PhotoThumbnail';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SearchIcon } from './icons/SearchIcon';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CameraCapture } from './CameraCapture';
import { resizeImage } from '../utils/imageUtils';
import { dataURLtoBlob } from '../utils/dataUtils';
import { Spinner } from './icons/Spinner';

interface PhotoManagerProps {
    photos: Photo[];
    onSave: (photo: Photo) => Promise<void>;
    onUpdate: (photo: Photo) => Promise<void>;
    onDelete: (photo: Photo) => Promise<void>;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, onSave, onUpdate, onDelete }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);

    const filteredPhotos = useMemo(() => {
        return photos.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [photos, searchTerm]);

    const handleUpdateAndClose = useCallback(async (updatedPhoto: Photo) => {
        await onUpdate(updatedPhoto);
        setSelectedPhoto(null);
    }, [onUpdate]);

    const handleDeleteAndClose = useCallback(async (photo: Photo) => {
        if (window.confirm(`Are you sure you want to delete "${photo.name}"?`)) {
            await onDelete(photo);
            setSelectedPhoto(null);
        }
    }, [onDelete]);
    
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
    
    return (
        <div className="container mx-auto p-4 h-full flex flex-col">
            {isCameraOpen && (
                <CameraCapture 
                    onClose={() => setIsCameraOpen(false)} 
                    onCapture={async (dataUrl) => {
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
                            setIsCameraOpen(false);
                            setIsUploading(false);
                            setUploadCount(0);
                        }
                    }}
                />
            )}
            {selectedPhoto && (
                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-down" onClick={() => setSelectedPhoto(null)}>
                    <div className="bg-[var(--theme-card-bg)] w-full max-w-5xl h-[90vh] rounded-lg shadow-xl border border-[var(--theme-border)] flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black/20 flex items-center justify-center">
                            <img src={URL.createObjectURL(selectedPhoto.imageBlob)} alt={selectedPhoto.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="w-full md:w-1/3 flex flex-col p-4">
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                               <h2 className="text-xl font-bold text-[var(--theme-green)]">Edit Details</h2>
                               <button onClick={() => setSelectedPhoto(null)}><XIcon/></button>
                            </div>
                            <div className="space-y-4 overflow-y-auto flex-grow">
                                <InputField label="Name" value={selectedPhoto.name} onChange={(val) => setSelectedPhoto({...selectedPhoto, name: val})} />
                                <InputField label="Folder" value={selectedPhoto.folder} onChange={(val) => setSelectedPhoto({...selectedPhoto, folder: val})} />
                                <InputField label="Tags (comma-separated)" value={selectedPhoto.tags.join(', ')} onChange={(val) => setSelectedPhoto({...selectedPhoto, tags: val.split(',').map(t => t.trim())})} />
                                <TextareaField label="Notes" value={selectedPhoto.notes} onChange={(val) => setSelectedPhoto({...selectedPhoto, notes: val})} />
                            </div>
                            <div className="mt-auto pt-4 border-t border-[var(--theme-border)] flex-shrink-0 flex items-center gap-2">
                                <button onClick={() => handleDeleteAndClose(selectedPhoto)} className="w-full flex items-center justify-center gap-2 bg-[var(--theme-red)]/80 hover:bg-[var(--theme-red)] text-white font-bold py-2 px-4 rounded-md">
                                    <TrashIcon /> Delete
                                </button>
                                <button onClick={() => handleUpdateAndClose(selectedPhoto)} className="w-full flex items-center justify-center gap-2 bg-[var(--theme-green)] hover:opacity-90 text-black font-bold py-2 px-4 rounded-md">
                                    Save & Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[var(--theme-green)]">Photo Library</h1>
                <div className="flex items-center gap-2">
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
                        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    </label>
                    <button 
                        onClick={() => setIsCameraOpen(true)}
                        disabled={isUploading}
                        className="bg-[var(--theme-green)] text-black font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center justify-center gap-2 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)]/50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                        {isUploading ? <Spinner className="h-5 w-5"/> : <CameraIcon className="h-5 w-5" />}
                        <span>{isUploading ? '' : 'Capture'}</span>
                    </button>
                </div>
            </div>

            <div className="relative my-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon />
                </div>
                <input 
                    type="text"
                    placeholder="Search by name, tag, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-md pl-10 pr-4 py-2"
                />
            </div>

            <div className="flex-grow overflow-y-auto -mx-2 pb-24 lg:pb-2">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-2">
                    {isUploading && Array.from({ length: uploadCount }).map((_, index) => (
                        <div key={`skeleton-${index}`} className="aspect-square bg-[var(--theme-card-bg)]/50 rounded-md animate-pulse"></div>
                    ))}
                    {filteredPhotos.map(photo => (
                        <PhotoThumbnail key={photo.id} photo={photo} onSelect={setSelectedPhoto} />
                    ))}
                </div>
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