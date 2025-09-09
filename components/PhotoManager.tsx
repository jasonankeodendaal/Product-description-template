
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Photo } from '../App';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { useDebounce } from '../hooks/useDebounce';
import { resizeImage } from '../utils/imageUtils';
import { CameraCapture } from './CameraCapture';
import { FolderIcon } from './icons/FolderIcon';
import { TrashIcon } from './icons/TrashIcon';
import { dataURLtoBlob } from '../utils/dataUtils';
import { SaveIcon } from './icons/SaveIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface PhotoManagerProps {
  onClose: () => void;
  photos: Photo[];
  onSave: (photo: Photo) => Promise<void>;
  onDelete: (photo: Photo) => Promise<void>;
}

interface Folder {
    name: string;
    photos: Photo[];
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ onClose, photos, onSave, onDelete }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formState, setFormState] = useState({ name: '', notes: '', folder: 'General' });
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const folders = useMemo<Folder[]>(() => {
        const folderMap = new Map<string, Photo[]>();
        const lowerQuery = debouncedSearchQuery.toLowerCase();

        photos.forEach(photo => {
            if (debouncedSearchQuery && !photo.name.toLowerCase().includes(lowerQuery) && !photo.notes.toLowerCase().includes(lowerQuery)) {
                return;
            }
            const folderName = photo.folder || 'General';
            if (!folderMap.has(folderName)) folderMap.set(folderName, []);
            folderMap.get(folderName)!.push(photo);
        });

        return Array.from(folderMap.entries())
            .map(([name, photos]) => ({ name, photos: photos.sort((a,b) => b.date.localeCompare(a.date)) }))
            .sort((a,b) => a.name.localeCompare(b.name));

    }, [photos, debouncedSearchQuery]);

    useEffect(() => {
        if (selectedPhoto) {
            setFormState({
                name: selectedPhoto.name,
                notes: selectedPhoto.notes,
                folder: selectedPhoto.folder || 'General',
            });
            const url = URL.createObjectURL(selectedPhoto.imageBlob);
            setImagePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setFormState({ name: '', notes: '', folder: 'General' });
            setImagePreviewUrl(null);
        }
    }, [selectedPhoto]);

    const handleFileSelect = async (file: File) => {
        const dataUrl = await resizeImage(file);
        const now = new Date();
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.'));
        
        setSelectedPhoto(null);
        setImagePreviewUrl(dataUrl);
        setFormState({
            name: `${cleanName} ${now.toLocaleDateString()}`,
            notes: '',
            folder: 'General'
        });
    };
    
    const handleCameraCapture = (dataUrl: string) => {
        const now = new Date();
        setSelectedPhoto(null);
        setImagePreviewUrl(dataUrl);
        setFormState({
            name: `Capture ${now.toLocaleString()}`,
            notes: '',
            folder: 'General'
        });
        setIsCameraOpen(false);
    };

    const handleSave = async () => {
        if (!imagePreviewUrl) return;
        
        let blobToSave: Blob;
        if (selectedPhoto && imagePreviewUrl.startsWith('blob:')) {
            blobToSave = selectedPhoto.imageBlob;
        } else {
            blobToSave = dataURLtoBlob(imagePreviewUrl);
        }

        const photoData: Photo = {
            id: selectedPhoto?.id || crypto.randomUUID(),
            date: selectedPhoto?.date || new Date().toISOString(),
            name: formState.name.trim() || 'Untitled Photo',
            notes: formState.notes,
            folder: formState.folder.trim() || 'General',
            imageBlob: blobToSave,
            imageMimeType: blobToSave.type,
        };
        await onSave(photoData);
        setSelectedPhoto(photoData);
    };

    const handleDelete = async () => {
        if (!selectedPhoto) return;
        if (window.confirm(`Delete "${selectedPhoto.name}"? This cannot be undone.`)) {
            await onDelete(selectedPhoto);
            setSelectedPhoto(null);
        }
    }

    return (
        <>
            {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
                <div className="bg-[var(--theme-card-bg)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col">
                    <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Photo Manager</h2>
                            <p className="text-sm text-[var(--theme-text-secondary)]">Organize, annotate, and capture images.</p>
                        </div>
                        <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
                    </header>
                    <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                        {/* Left Panel: Folders and Photos */}
                        <div className="w-full md:w-1/2 lg:w-2/5 border-b md:border-r md:border-b-0 border-[var(--theme-border)] flex flex-col h-1/2 md:h-full">
                            <div className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 space-y-3">
                                 <input type="search" placeholder="Search photos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md py-2 px-3 text-sm text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"/>
                            </div>
                            <div className="overflow-y-auto flex-grow p-2">
                               {folders.map(folder => (
                                   <div key={folder.name} className="mb-2">
                                       <h3 className="font-semibold text-sm text-[var(--theme-text-secondary)] px-3 py-1 flex items-center gap-2"><FolderIcon /> {folder.name}</h3>
                                       <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 p-2">
                                            {folder.photos.map(photo => {
                                                const url = URL.createObjectURL(photo.imageBlob);
                                                return (
                                                    <button key={photo.id} onClick={() => { URL.revokeObjectURL(url); setSelectedPhoto(photo); }} className={`aspect-square bg-black/20 rounded-md overflow-hidden group relative focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ring-[var(--theme-blue)] ${selectedPhoto?.id === photo.id ? 'ring-2' : ''}`}>
                                                        <img src={url} alt={photo.name} className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                                                            <p className="text-white text-xs truncate">{photo.name}</p>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                       </div>
                                   </div>
                               ))}
                            </div>
                        </div>

                        {/* Right Panel: Editor */}
                        <div className="w-full md:w-1/2 lg:w-3/5 p-6 flex flex-col overflow-y-auto">
                            { (selectedPhoto || imagePreviewUrl) ? (
                                <>
                                <div className="flex-grow space-y-4">
                                    <div className="w-full aspect-[4/3] bg-[var(--theme-bg)] rounded-lg flex items-center justify-center overflow-hidden">
                                        {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />}
                                    </div>
                                    <div>
                                        <label htmlFor="photo-name" className="text-sm text-[var(--theme-text-secondary)]">Name</label>
                                        <input id="photo-name" type="text" value={formState.name} onChange={e => setFormState(s => ({...s, name: e.target.value}))} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"/>
                                    </div>
                                     <div>
                                        <label htmlFor="photo-folder" className="text-sm text-[var(--theme-text-secondary)]">Folder</label>
                                        <input id="photo-folder" type="text" value={formState.folder} onChange={e => setFormState(s => ({...s, folder: e.target.value}))} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"/>
                                    </div>
                                    <div>
                                        <label htmlFor="photo-notes" className="text-sm text-[var(--theme-text-secondary)]">Notes</label>
                                        <textarea id="photo-notes" value={formState.notes} onChange={e => setFormState(s => ({...s, notes: e.target.value}))} rows={4} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 resize-y text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"></textarea>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 flex justify-between items-center flex-shrink-0">
                                    <div>{selectedPhoto && <button onClick={handleDelete} className="text-[var(--theme-red)] hover:underline flex items-center gap-2 p-2"><TrashIcon/> Delete</button>}</div>
                                    <button onClick={handleSave} style={{backgroundColor: 'var(--theme-green)'}} className="text-white font-bold py-2 px-4 rounded-md hover:opacity-90 flex items-center gap-2"><SaveIcon /> Save Photo</button>
                                </div>
                                </>
                            ) : (
                                <div className="text-center flex-grow flex flex-col items-center justify-center gap-4">
                                    <PhotoIcon />
                                    <p className="text-[var(--theme-text-secondary)]/70">Select a photo or add a new one.</p>
                                     <div className="flex items-center gap-2">
                                         <input type="file" ref={fileInputRef} className="sr-only" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} accept="image/*"/>
                                         <button onClick={() => fileInputRef.current?.click()} className="text-sm flex items-center gap-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-dark-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-4 rounded-md">
                                            <UploadIcon /> Upload
                                         </button>
                                          <button onClick={() => setIsCameraOpen(true)} className="text-sm flex items-center gap-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-dark-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-4 rounded-md">
                                            <CameraIcon /> Camera
                                         </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};