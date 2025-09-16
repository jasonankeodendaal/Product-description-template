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
import { PlusIcon } from './icons/PlusIcon';
import { LibraryIcon } from './icons/LibraryIcon';
import { PhotosIcon } from './icons/PhotosIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PhotoThumbnail } from './PhotoThumbnail';

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

// Sub-component for the Photo Editor Modal
const PhotoEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    initialPhoto: Photo | null;
    newImagePreviewUrl?: string | null;
    onSave: (photo: Photo) => Promise<void>;
    onDelete: (photo: Photo) => Promise<void>;
}> = ({ isOpen, onClose, initialPhoto, newImagePreviewUrl, onSave, onDelete }) => {
    const [formState, setFormState] = useState({ name: '', notes: '', folder: 'General', tags: '' });
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (initialPhoto) {
            setFormState({
                name: initialPhoto.name,
                notes: initialPhoto.notes,
                folder: initialPhoto.folder || 'General',
                tags: (initialPhoto.tags || []).join(', '),
            });
            const url = URL.createObjectURL(initialPhoto.imageBlob);
            setImagePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (newImagePreviewUrl) {
             const now = new Date();
             setFormState({
                name: `New Photo ${now.toLocaleDateString()}`,
                notes: '',
                folder: 'General',
                tags: ''
            });
            setImagePreviewUrl(newImagePreviewUrl);
        }
    }, [initialPhoto, newImagePreviewUrl]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Animation duration
    }, [onClose]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!imagePreviewUrl) return;
        
        let blobToSave: Blob;
        if (initialPhoto && imagePreviewUrl.startsWith('blob:')) {
            blobToSave = initialPhoto.imageBlob;
        } else {
            blobToSave = dataURLtoBlob(imagePreviewUrl);
        }

        const photoData: Photo = {
            id: initialPhoto?.id || crypto.randomUUID(),
            date: initialPhoto?.date || new Date().toISOString(),
            name: formState.name.trim() || 'Untitled Photo',
            notes: formState.notes,
            folder: formState.folder.trim() || 'General',
            imageBlob: blobToSave,
            imageMimeType: blobToSave.type,
            tags: formState.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        await onSave(photoData);
        handleClose();
    };

    const handleDelete = async () => {
        if (!initialPhoto) return;
        if (window.confirm(`Delete "${initialPhoto.name}"? This cannot be undone.`)) {
            await onDelete(initialPhoto);
            handleClose();
        }
    };
    
    const tags = useMemo(() => formState.tags.split(',').map(t => t.trim()).filter(Boolean), [formState.tags]);
    const animationClass = isClosing ? 'creator-modal-animate-out' : 'creator-modal-animate-in';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center" onClick={handleClose}>
            <div className={`bg-[var(--theme-card-bg)] w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] rounded-t-2xl md:rounded-xl shadow-2xl flex flex-col ${animationClass}`} onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--theme-yellow)]">{initialPhoto ? 'Edit Photo' : 'New Photo'}</h2>
                    <button onClick={handleClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
                </header>
                <main className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
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
                        <label htmlFor="photo-notes" className="text-sm text-[var(--theme-text-secondary)]">Notes / Caption</label>
                        <textarea id="photo-notes" value={formState.notes} onChange={e => setFormState(s => ({...s, notes: e.target.value}))} rows={3} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 resize-y text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"></textarea>
                    </div>
                     <div>
                        <label htmlFor="photo-tags" className="text-sm text-[var(--theme-text-secondary)]">Tags (comma-separated)</label>
                        <input id="photo-tags" type="text" value={formState.tags} onChange={e => setFormState(s => ({...s, tags: e.target.value}))} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"/>
                         {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {tags.map(tag => <span key={tag} className="bg-[var(--theme-blue)]/20 text-[var(--theme-blue)] text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                            </div>
                         )}
                    </div>
                </main>
                <footer className="p-4 border-t border-[var(--theme-border)] flex justify-between items-center flex-shrink-0 bg-black/10">
                    <div>{initialPhoto && <button onClick={handleDelete} className="group text-[var(--theme-red)] hover:underline flex items-center gap-2 p-2"><TrashIcon/> Delete</button>}</div>
                    <button onClick={handleSave} style={{backgroundColor: 'var(--theme-green)'}} className="group text-white font-bold py-2 px-4 rounded-md hover:opacity-90 flex items-center gap-2"><SaveIcon /> Save Photo</button>
                </footer>
            </div>
        </div>
    );
};

const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`group flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-md transition-colors ${isActive ? 'text-[var(--theme-blue)]' : 'text-[var(--theme-text-secondary)] hover:text-white'}`}>
        <div className="w-6 h-6">{icon}</div>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);


export const PhotoManager: React.FC<PhotoManagerProps> = ({ onClose, photos, onSave, onDelete }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'library' | 'all'>('library');
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);


    const filteredPhotos = useMemo(() => {
        if (!debouncedSearchQuery) return photos;
        const lowerQuery = debouncedSearchQuery.toLowerCase();
        return photos.filter(photo =>
            photo.name.toLowerCase().includes(lowerQuery) ||
            photo.notes.toLowerCase().includes(lowerQuery) ||
            (photo.tags || []).some(t => t.toLowerCase().includes(lowerQuery)) ||
            photo.folder.toLowerCase().includes(lowerQuery)
        );
    }, [photos, debouncedSearchQuery]);

    const folders = useMemo<Folder[]>(() => {
        if (activeView !== 'library') return [];
        const folderMap = new Map<string, Photo[]>();
        
        filteredPhotos.forEach(photo => {
            const folderName = photo.folder || 'General';
            if (!folderMap.has(folderName)) folderMap.set(folderName, []);
            folderMap.get(folderName)!.push(photo);
        });

        return Array.from(folderMap.entries())
            .map(([name, photos]) => ({ name, photos: photos.sort((a,b) => b.date.localeCompare(a.date)) }))
            .sort((a,b) => a.name.localeCompare(b.name));

    }, [filteredPhotos, activeView]);
    
    const allPhotosSorted = useMemo(() => {
        if (activeView !== 'all') return [];
        return [...filteredPhotos].sort((a,b) => b.date.localeCompare(a.date));
    }, [filteredPhotos, activeView]);


    const handleSelectPhoto = (photo: Photo) => {
        setSelectedPhoto(photo);
        setNewImagePreview(null);
        setIsEditorOpen(true);
    };

    const handleFileSelect = async (file: File) => {
        const dataUrl = await resizeImage(file);
        setSelectedPhoto(null);
        setNewImagePreview(dataUrl);
        setIsEditorOpen(true);
    };
    
    const handleCameraCapture = (dataUrl: string) => {
        setIsCameraOpen(false);
        setSelectedPhoto(null);
        setNewImagePreview(dataUrl);
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setSelectedPhoto(null);
        setNewImagePreview(null);
    };

    return (
        <>
            {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
            
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0" aria-modal="true" role="dialog">
                <div className="bg-[var(--theme-dark-bg)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col overflow-hidden">
                    {/* Fixed Header */}
                    <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                         <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Photo Manager</h2>
                        <div className="w-1/2 max-w-xs relative group">
                            <input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-full py-2 pl-10 pr-4 text-sm text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"/>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
                        </div>
                        <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
                    </header>
                    
                    {/* Scrollable Main Content */}
                    <main className="flex-grow overflow-y-auto pb-24 bg-[var(--theme-bg)]/30">
                        {photos.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                 <PhotosIcon />
                                 <p className="mt-2 text-[var(--theme-text-secondary)]">Your photo library is empty.</p>
                                 <p className="text-sm text-[var(--theme-text-secondary)]/70">Use the '+' button to add your first photo.</p>
                            </div>
                        ) : activeView === 'library' ? (
                            folders.map(folder => (
                               <div key={folder.name} className="pt-2">
                                   <h3 className="font-semibold text-sm text-[var(--theme-text-secondary)] px-3 py-1 flex items-center gap-2"><FolderIcon /> {folder.name}</h3>
                                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1 p-2">
                                        {folder.photos.map(photo => (
                                            <PhotoThumbnail key={photo.id} photo={photo} onSelect={handleSelectPhoto} />
                                        ))}
                                   </div>
                               </div>
                            ))
                        ) : (
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1 p-2">
                                {allPhotosSorted.map(photo => (
                                    <PhotoThumbnail key={photo.id} photo={photo} onSelect={handleSelectPhoto} />
                                ))}
                            </div>
                        )}
                    </main>

                    {/* Fixed Bottom Navigation */}
                    <footer className="absolute bottom-0 left-0 right-0 h-20 bg-[var(--theme-card-bg)]/80 backdrop-blur-sm border-t border-[var(--theme-border)] flex items-center justify-around px-2 flex-shrink-0">
                         <input type="file" ref={fileInputRef} className="sr-only" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} accept="image/*"/>
                         <NavButton icon={<LibraryIcon />} label="Library" isActive={activeView === 'library'} onClick={() => setActiveView('library')} />
                         <div className="relative">
                            {isAddMenuOpen && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-[var(--theme-bg)] rounded-lg shadow-lg border border-[var(--theme-border)] text-sm animate-fade-in-down">
                                    <button onClick={() => {setIsCameraOpen(true); setIsAddMenuOpen(false);}} className="group w-full flex items-center gap-3 p-3 hover:bg-[var(--theme-dark-bg)] rounded-t-lg"><CameraIcon /> Camera</button>
                                    <button onClick={() => {fileInputRef.current?.click(); setIsAddMenuOpen(false);}} className="group w-full flex items-center gap-3 p-3 hover:bg-[var(--theme-dark-bg)] rounded-b-lg"><UploadIcon /> Upload</button>
                                </div>
                            )}
                            <button onClick={() => setIsAddMenuOpen(p => !p)} className={`group w-14 h-14 bg-[var(--theme-blue)] text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-200 ${isAddMenuOpen ? 'rotate-45' : ''}`}>
                                <PlusIcon />
                            </button>
                        </div>
                         <NavButton icon={<PhotosIcon />} label="All Photos" isActive={activeView === 'all'} onClick={() => setActiveView('all')} />
                    </footer>
                </div>
            </div>
            
            <PhotoEditorModal 
                isOpen={isEditorOpen} 
                onClose={closeEditor} 
                initialPhoto={selectedPhoto}
                newImagePreviewUrl={newImagePreview}
                onSave={onSave}
                onDelete={onDelete}
            />
        </>
    );
};