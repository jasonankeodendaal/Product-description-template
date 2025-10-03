import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SaveIcon } from './icons/SaveIcon';
import { ParsedProductData, Photo, Video } from '../App';
import { UploadIcon } from './icons/UploadIcon';
import { dataURLtoBlob } from '../utils/dataUtils';
import { resizeImage, squareImageAndGetBlob } from '../utils/imageUtils';
import { CropIcon } from './icons/CropIcon';
import { XIcon } from './icons/XIcon';
import { Spinner } from './icons/Spinner';
import { generateVideoThumbnail } from '../utils/videoUtils';
import { PlayIcon } from './icons/PlayIcon';
import { VideoIcon } from './icons/VideoIcon';


// Define GroundingChunk locally to remove dependency on @google/genai types on the client
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GenerationResult {
    text: string;
    sources?: GroundingChunk[];
}

interface OutputPanelProps {
  output: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
  onSaveToFolder: (item: ParsedProductData, structuredData: Record<string, string>) => Promise<void>;
  // FIX: Add 'ftp' to syncMode to match the type in SiteSettings, resolving a type error.
  syncMode?: 'local' | 'folder' | 'api' | 'ftp';
  photos: Photo[];
  onSavePhoto: (photo: Photo) => Promise<void>;
  onUpdatePhoto: (photo: Photo) => Promise<void>;
  onDeletePhoto: (photo: Photo) => Promise<void>;
  onEditImage: (photo: Photo) => void;
  videos: Video[];
  onSaveVideo: (video: Video) => Promise<void>;
  onDeleteVideo: (video: Video) => Promise<void>;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 font-sans text-sm leading-relaxed animate-pulse">
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Brand:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-1/3 mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">SKU:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-1/2 mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Name:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-3/4 mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Short Description:</p>
            <div className="h-5 bg-[var(--theme-border)]/20 rounded w-full mt-1"></div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Description:</p>
            <div className="space-y-2 mt-1">
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-full"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-full"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-5/6"></div>
            </div>
        </div>
        <div>
            <p className="font-bold text-[var(--theme-text-secondary)]/50">Key Features:</p>
            <div className="space-y-2 mt-1">
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-4/5"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-4/5"></div>
                <div className="h-5 bg-[var(--theme-border)]/20 rounded w-4/5"></div>
            </div>
        </div>
    </div>
);

const SECTIONS = [
    'Brand', 'SKU', 'Name', 'Short Description', 'What’s in the Box',
    'Description', 'Key Features', 'Material Used',
    'Product Dimensions (CM) & Weight (KG)', 'Buying This Product Means',
    'Key Specifications', 'Terms & Conditions'
];

const parseOutputToStructuredData = (text: string): Record<string, string> => {
    const data: Record<string, string> = {};
    SECTIONS.forEach(s => data[s] = '');
    const lines = text.split('\n');
    let currentSection: string | null = null;
    let contentBuffer: string[] = [];
    const sectionHeaders = SECTIONS.map(s => s + ':');

    for (const line of lines) {
        if (sectionHeaders.includes(line.trim())) {
            if (currentSection) {
                data[currentSection] = contentBuffer.join('\n').trim();
            }
            currentSection = line.trim().slice(0, -1);
            contentBuffer = [];
        } else if (currentSection) {
            contentBuffer.push(line);
        }
    }

    if (currentSection) {
        data[currentSection] = contentBuffer.join('\n').trim();
    }
    
    return data;
};

const LinkedPhotoThumbnail: React.FC<{ photo: Photo; onOpenSquarer: (photo: Photo) => void; onDelete: (photo: Photo) => void; }> = ({ photo, onOpenSquarer, onDelete }) => {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        const objectUrl = URL.createObjectURL(photo.imageBlob);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [photo.imageBlob]);

    return (
        <div className="w-full aspect-square bg-black/20 rounded-md overflow-hidden group relative">
            {url ? <img src={url} alt={photo.name} className="w-full h-full object-cover" /> : <div className="animate-pulse bg-white/10 w-full h-full"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                <button
                    onClick={() => onOpenSquarer(photo)}
                    className="w-full flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-md p-1.5 text-xs font-semibold"
                    title="Square Image"
                >
                    <CropIcon />
                    <span>Square</span>
                </button>
            </div>
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(photo);
                }}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white/80 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Photo"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

const ImageSquarerModal: React.FC<{
    photo: Photo;
    onSquare: (size: number) => Promise<void>;
    onClose: () => void;
}> = ({ photo, onSquare, onClose }) => {
    const [isSquaring, setIsSquaring] = useState(false);
    const imageUrl = useMemo(() => URL.createObjectURL(photo.imageBlob), [photo.imageBlob]);

    const handleSquareClick = async (size: number) => {
        setIsSquaring(true);
        await onSquare(size);
        // The parent component will close the modal upon completion.
    };
    
    useEffect(() => {
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">Square Image</h3>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
                        <XIcon />
                    </button>
                </header>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-40 h-40 flex-shrink-0 bg-black/20 rounded-md overflow-hidden">
                            <img src={imageUrl} alt={photo.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow space-y-3">
                            <p className="text-[var(--theme-text-secondary)] text-sm">Choose a size to create a high-quality, centered square image with a white background.</p>
                             <div className="grid grid-cols-3 gap-3">
                                {[500, 800, 1000].map(size => (
                                     <button 
                                        key={size}
                                        onClick={() => handleSquareClick(size)}
                                        disabled={isSquaring}
                                        className="py-3 px-2 rounded-md font-semibold text-center transition-all border-2 bg-transparent border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-orange)]/50 hover:text-white disabled:opacity-50"
                                    >
                                        {size}x{size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {isSquaring && (
                        <div className="absolute inset-0 bg-[var(--theme-card-bg)]/80 rounded-xl flex flex-col items-center justify-center gap-2">
                           <Spinner className="h-6 w-6 text-[var(--theme-orange)]" />
                           <p className="text-[var(--theme-text-primary)]">Processing...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoPlayerModal: React.FC<{ video: Video; onClose: () => void }> = ({ video, onClose }) => {
    const videoUrl = useMemo(() => URL.createObjectURL(video.videoBlob), [video.videoBlob]);
    useEffect(() => () => URL.revokeObjectURL(videoUrl), [videoUrl]);
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-black w-full max-w-4xl rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
                <video src={videoUrl} controls autoPlay className="w-full max-h-[80vh] rounded-t-xl" />
                <div className="p-4 bg-[var(--theme-card-bg)] rounded-b-xl flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white truncate">{video.name}</h3>
                    <button onClick={onClose} className="text-sm bg-orange-500 text-black font-bold py-1 px-3 rounded-md">Close</button>
                </div>
            </div>
        </div>
    );
};

const LinkedVideoThumbnail: React.FC<{ video: Video; onOpenPlayer: (video: Video) => void; onDelete: (video: Video) => void; }> = ({ video, onOpenPlayer, onDelete }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        generateVideoThumbnail(video.videoBlob)
            .then(url => { if (isMounted) setThumbUrl(url); })
            .catch(err => console.error("Could not generate video thumbnail for", video.name, err));
        return () => { isMounted = false; };
    }, [video.videoBlob, video.name]);

    return (
        <div className="w-full aspect-square bg-black/20 rounded-md overflow-hidden group relative">
            {thumbUrl ? (
                <img src={thumbUrl} alt={`${video.name} thumbnail`} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <VideoIcon className="w-8 h-8"/>
                </div>
            )}
            <div 
                onClick={() => onOpenPlayer(video)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
                <PlayIcon className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(video);
                }}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white/80 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Video"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


export const OutputPanel: React.FC<OutputPanelProps> = React.memo(({ output, isLoading, error, onSaveToFolder, syncMode, photos, onSavePhoto, onUpdatePhoto, onDeletePhoto, videos, onSaveVideo, onDeleteVideo }) => {
    const [editableOutput, setEditableOutput] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [squaringPhoto, setSquaringPhoto] = useState<Photo | null>(null);
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const hasOutput = editableOutput.trim().length > 0;

    useEffect(() => {
        setEditableOutput(output?.text || '');
    }, [output]);

    const structuredData = useMemo(() => {
        if (!editableOutput) return null;
        return parseOutputToStructuredData(editableOutput);
    }, [editableOutput]);
    
    const sanitize = (str: string) => (str || '').replace(/[^a-zA-Z0-9-_\.]/g, '_').trim();
    
    const getProductFolderPath = useCallback(() => {
        if (!structuredData) return null;
        const brand = structuredData['Brand'] || 'Unbranded';
        const sku = structuredData['SKU'] || '';
        
        // Strictly require an SKU to create a unique folder path for variants.
        if (!sku.trim()) {
            return null;
        }

        return `Generated_Content/${sanitize(brand)}/${sanitize(sku)}`;
    }, [structuredData]);


    const linkedPhotos = useMemo(() => {
        const folderPath = getProductFolderPath();
        if (!folderPath) return [];
        return photos.filter(p => p.folder === folderPath);
    }, [photos, getProductFolderPath]);
    
    const linkedVideos = useMemo(() => {
        const folderPath = getProductFolderPath();
        if (!folderPath) return [];
        return videos.filter(v => v.folder === folderPath);
    }, [videos, getProductFolderPath]);


    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = useCallback(() => {
        if (!editableOutput) return;
        navigator.clipboard.writeText(editableOutput);
        setIsCopied(true);
    }, [editableOutput]);
    
    const handleSave = useCallback(async () => {
        if (!editableOutput) return;

        const currentStructuredData = parseOutputToStructuredData(editableOutput);
        if (!currentStructuredData) return;

        setSaveState('saving');
        
        const item: ParsedProductData = {
            brand: currentStructuredData['Brand'] || 'Unbranded',
            sku: currentStructuredData['SKU'] || '',
            name: currentStructuredData['Name'] || 'Unnamed Product',
            fullText: editableOutput,
        };

        try {
            await onSaveToFolder(item, currentStructuredData);
            setSaveState('saved');
            setTimeout(() => setSaveState('idle'), 2500);
        } catch (e) {
            setSaveState('idle'); // Error is alerted in App.tsx, just reset button state
        }
    }, [editableOutput, onSaveToFolder]);

    const handleImageUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0 || !structuredData) return;
        const folderPath = getProductFolderPath();
        if (!folderPath) {
            alert("Cannot link images: Product SKU is missing from the generated description. Please ensure an SKU is present to properly organize variants.");
            return;
        }

        setIsUploading(true);
        let addedInBatch = 0;
        for (const file of Array.from(files)) {
            try {
                const sanitizedSku = sanitize(structuredData['SKU'] || '');
                if (!sanitizedSku) { // Redundant check, but good for safety
                     alert("Cannot link images: Product SKU is missing.");
                     continue;
                }

                // Count existing media for this SKU
                const existingPhotoCount = photos.filter(p => p.folder === folderPath).length;
                const existingVideoCount = videos.filter(v => v.folder === folderPath).length;
                const totalExistingCount = existingPhotoCount + existingVideoCount;

                // The new name includes the count of existing media + items added in this batch.
                const newPhotoName = `${sanitizedSku} - ${totalExistingCount + addedInBatch + 1}`;
                addedInBatch++;
                
                const imageBlob = await squareImageAndGetBlob(file, 800);
                
                const newPhoto: Photo = {
                    id: crypto.randomUUID(),
                    name: newPhotoName,
                    notes: `Linked to product in folder: ${folderPath}`,
                    date: new Date().toISOString(),
                    folder: folderPath,
                    imageBlob,
                    imageMimeType: 'image/jpeg', // squareImageAndGetBlob returns jpeg
                    tags: [structuredData['Brand'] || '', structuredData['SKU'] || ''].filter(Boolean) as string[],
                };
                await onSavePhoto(newPhoto);
            } catch (error) {
                console.error("Failed to process image:", error);
                alert(`Failed to process ${file.name}. It might be corrupted or an unsupported format.`);
            }
        }
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = '';

    }, [structuredData, onSavePhoto, getProductFolderPath, photos, videos]);
    
    const handleVideoUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0 || !structuredData) return;
        const folderPath = getProductFolderPath();
        if (!folderPath) {
            alert("Cannot link videos: Product SKU is missing from the generated description. Please ensure an SKU is present to properly organize variants.");
            return;
        }
        
        setIsUploadingVideo(true);
        let addedInBatch = 0;
        for (const file of Array.from(files)) {
             try {
                const sanitizedSku = sanitize(structuredData['SKU'] || '');
                if (!sanitizedSku) {
                     alert("Cannot link videos: Product SKU is missing.");
                     continue;
                }

                // Count existing media for this SKU
                const existingPhotoCount = photos.filter(p => p.folder === folderPath).length;
                const existingVideoCount = videos.filter(v => v.folder === folderPath).length;
                const totalExistingCount = existingPhotoCount + existingVideoCount;

                const newVideoName = `${sanitizedSku} - ${totalExistingCount + addedInBatch + 1}`;
                addedInBatch++;

                const newVideo: Video = {
                    id: crypto.randomUUID(),
                    name: newVideoName,
                    notes: `Linked to product in folder: ${folderPath}`,
                    date: new Date().toISOString(),
                    folder: folderPath,
                    videoBlob: file,
                    videoMimeType: file.type,
                    tags: [structuredData['Brand'] || '', structuredData['SKU'] || ''].filter(Boolean) as string[],
                };
                await onSaveVideo(newVideo);
            } catch (error) {
                console.error("Failed to process video:", error);
                alert(`Failed to process ${file.name}.`);
            }
        }
        setIsUploadingVideo(false);
        if(videoInputRef.current) videoInputRef.current.value = '';
    }, [structuredData, onSaveVideo, getProductFolderPath, photos, videos]);


    const handleSquareImage = async (photo: Photo, size: number) => {
        try {
            const squaredBlob = await squareImageAndGetBlob(photo.imageBlob, size);
            const updatedPhoto: Photo = {
                ...photo,
                name: photo.name.startsWith('squared_') ? photo.name : `squared_${photo.name}`,
                imageBlob: squaredBlob,
                imageMimeType: 'image/jpeg',
            };
            await onUpdatePhoto(updatedPhoto);
        } catch (err) {
            alert('Failed to square image.');
            console.error(err);
        } finally {
            setSquaringPhoto(null);
        }
    };

    const isFolderMode = syncMode === 'folder';

    const getSaveButtonContent = () => {
        switch(saveState) {
            case 'saving':
                return (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                );
            case 'saved':
                return <><CheckIcon /> Saved!</>;
            default:
                return <><SaveIcon /> Add to Folder</>;
        }
    };

  return (
    <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)] relative flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[var(--theme-orange)]">Generated Description</h2>
        {hasOutput && !isLoading && (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-dark-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm"
                    aria-label="Copy Description"
                >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    {isCopied ? 'Copied!' : 'Copy Text'}
                </button>
                 <button
                    onClick={handleSave}
                    disabled={!isFolderMode || saveState !== 'idle'}
                    title={!isFolderMode ? "Connect a local folder to enable saving" : ""}
                    style={{ backgroundColor: 'var(--theme-orange)'}}
                    className="flex items-center gap-2 hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)]/50 disabled:cursor-not-allowed text-black font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm min-w-[140px] justify-center"
                    aria-label="Add to Folder"
                >
                    {getSaveButtonContent()}
                </button>
            </div>
        )}
      </div>

      <div className="bg-[var(--theme-bg)]/80 border border-[var(--theme-border)] rounded-md flex-grow min-h-[300px] text-[var(--theme-text-primary)] overflow-y-auto flex flex-col">
        <div className="flex-grow">
            {error ? (
                <div className="text-[var(--theme-red)] p-4 rounded-md bg-[var(--theme-red)]/10 border border-[var(--theme-red)]/30" role="alert">{error}</div>
            ) : isLoading && !hasOutput ? (
                <SkeletonLoader />
            ) : hasOutput ? (
                <textarea
                    value={editableOutput}
                    onChange={(e) => setEditableOutput(e.target.value)}
                    className="w-full h-full bg-transparent p-4 font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[var(--theme-orange)] rounded-md"
                />
            ) : (
                <div className="h-full flex items-center justify-center text-[var(--theme-text-secondary)]/70">
                    Your generated product description will appear here.
                </div>
            )}
        </div>
      </div>

      {structuredData && getProductFolderPath() && (
        <>
            <div className="mt-4 pt-4 border-t border-[var(--theme-border)]/50">
                <h3 className="text-lg font-semibold text-[var(--theme-orange)] mb-3">Linked Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {linkedPhotos.map(photo => <LinkedPhotoThumbnail key={photo.id} photo={photo} onOpenSquarer={setSquaringPhoto} onDelete={onDeletePhoto} />)}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="sr-only"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        accept="image/*"
                        multiple
                        disabled={isUploading}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="aspect-square border-2 border-dashed border-[var(--theme-border)] rounded-md flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]/50 hover:border-solid hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? ( <Spinner className="h-5 w-5" /> ) : ( <> <UploadIcon /> <span className="text-xs mt-1">Add</span> </>)}
                    </button>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--theme-border)]/50">
                <h3 className="text-lg font-semibold text-[var(--theme-orange)] mb-3">Linked Videos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {linkedVideos.map(video => <LinkedVideoThumbnail key={video.id} video={video} onOpenPlayer={setPlayingVideo} onDelete={onDeleteVideo} />)}
                    <input
                        type="file"
                        ref={videoInputRef}
                        className="sr-only"
                        onChange={(e) => handleVideoUpload(e.target.files)}
                        accept="video/*"
                        multiple
                        disabled={isUploadingVideo}
                    />
                    <button
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isUploadingVideo}
                        className="aspect-square border-2 border-dashed border-[var(--theme-border)] rounded-md flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]/50 hover:border-solid hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploadingVideo ? ( <Spinner className="h-5 w-5" /> ) : ( <> <VideoIcon /> <span className="text-xs mt-1">Add</span> </>)}
                    </button>
                </div>
            </div>
        </>
      )}
      {squaringPhoto && (
        <ImageSquarerModal 
            photo={squaringPhoto}
            onClose={() => setSquaringPhoto(null)}
            onSquare={(size) => handleSquareImage(squaringPhoto, size)}
        />
      )}
       {playingVideo && (
        <VideoPlayerModal 
            video={playingVideo}
            onClose={() => setPlayingVideo(null)}
        />
      )}
    </div>
  );
});