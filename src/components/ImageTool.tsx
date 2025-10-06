import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { squareImageAndGetBlob } from '../utils/imageUtils';
import { XIcon } from './icons/XIcon';
import { Spinner } from './icons/Spinner';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { waitForGlobal } from '../utils/dataUtils';
import type { Photo, View } from '../types';

interface ImageToolProps {
  initialImage: Photo | null;
  onClearInitialImage: () => void;
  onNavigate: (view: View) => void;
}

interface ImageItem {
  id: string;
  file: File;
  imageElement: HTMLImageElement;
}

const drawPreviewOnCanvas = (canvas: HTMLCanvasElement, image: HTMLImageElement, size: number = 500) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const ratio = image.naturalWidth / image.naturalHeight;
    let destWidth, destHeight;

    if (ratio > 1) { // Landscape image
        destWidth = size;
        destHeight = size / ratio;
    } else { // Portrait or square image
        destHeight = size;
        destWidth = size * ratio;
    }

    const destX = (size - destWidth) / 2;
    const destY = (size - destHeight) / 2;

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, destX, destY, destWidth, destHeight);
}

export const ImageTool: React.FC<ImageToolProps> = ({ initialImage, onClearInitialImage, onNavigate }) => {
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [outputSize, setOutputSize] = useState<number>(1000);
    const [isZipping, setIsZipping] = useState(false);
    const [zipProgress, setZipProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback((files: FileList | null) => {
        if (files && files.length > 0) {
            const filePromises = Array.from(files).map(file => {
                return new Promise<ImageItem>((resolve, reject) => {
                    if (!file.type.startsWith('image/')) return reject(new Error('Unsupported file type.'));
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => resolve({ id: crypto.randomUUID(), file, imageElement: img });
                        img.onerror = reject;
                        img.src = event.target?.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(newItems => {
                setImageItems(prev => [...prev, ...newItems]);
                if (!selectedImageId) {
                    setSelectedImageId(newItems[0]?.id || null);
                }
            }).catch(err => {
                console.error("Error loading images:", err);
                alert("One or more files could not be loaded. Please make sure they are valid image files.");
            });
        }
    }, [selectedImageId]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        if(e.target) e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };
    
    useEffect(() => {
        if (initialImage) {
            const img = new Image();
            const objectUrl = URL.createObjectURL(initialImage.imageBlob);
            img.onload = () => {
                const file = new File([initialImage.imageBlob], initialImage.name, { type: initialImage.imageMimeType });
                const newItem: ImageItem = { id: crypto.randomUUID(), file, imageElement: img };
                setImageItems([newItem]);
                setSelectedImageId(newItem.id);
                URL.revokeObjectURL(objectUrl);
            };
            img.src = objectUrl;
            onClearInitialImage(); 
        }
    }, [initialImage, onClearInitialImage]);

    const selectedImage = useMemo(() => imageItems.find(item => item.id === selectedImageId), [imageItems, selectedImageId]);

    useEffect(() => {
        const canvas = previewCanvasRef.current;
        if (canvas) {
            if (selectedImage) {
                drawPreviewOnCanvas(canvas, selectedImage.imageElement, 500);
            } else {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [selectedImage]);

    const handleRemoveImage = (e: React.MouseEvent, idToRemove: string) => {
        e.stopPropagation();
        setImageItems(prev => {
            const newItems = prev.filter(item => item.id !== idToRemove);
            if (selectedImageId === idToRemove) {
                setSelectedImageId(newItems[0]?.id || null);
            }
            return newItems;
        });
    };
    
    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear all images from the queue?")) {
            setImageItems([]);
            setSelectedImageId(null);
        }
    };

    const handleDownloadZip = useCallback(async () => {
        if (imageItems.length === 0) return;

        setIsZipping(true);
        setZipProgress(0);
        try {
            const JSZip = await waitForGlobal<any>('JSZip');
            const zip = new JSZip();
            for (let i = 0; i < imageItems.length; i++) {
                const item = imageItems[i];
                const blob = await squareImageAndGetBlob(item.file, outputSize, 1.0);
                const originalName = item.file.name.split('.').slice(0, -1).join('.');
                const fileName = `squared_${originalName || item.id}.jpg`;
                zip.file(fileName, blob);
                setZipProgress(Math.round(((i + 1) / imageItems.length) * 100));
            }
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `squared_images_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error("Failed to create zip:", err);
            alert(`An error occurred while creating the zip file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsZipping(false);
        }
    }, [imageItems, outputSize]);

    return (
        <div className="w-full p-4 lg:py-8 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-y-auto">
            <header className="mb-8">
                 <button 
                    onClick={() => onNavigate('home')}
                    className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors mb-4"
                >
                    <ChevronLeftIcon />
                    Back to Home
                </button>
                <h1 className="text-3xl font-bold text-[var(--theme-orange)]">HQ Image Squarer</h1>
                <p className="text-[var(--theme-text-secondary)] mt-2">Create broadcast-quality, perfectly square images. Upload multiple photos and download them all in a zip.</p>
            </header>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Controls & Queue */}
                <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl rounded-lg shadow-lg border border-[var(--theme-border)] flex flex-col h-[70vh]">
                    {imageItems.length === 0 ? (
                         <div className="flex-grow flex flex-col p-6" onDragEnter={handleDragEvents} onDragLeave={handleDragEvents} onDragOver={handleDragEvents} onDrop={handleDrop}>
                            <h2 className="text-xl font-semibold mb-4 text-center">Upload Image(s)</h2>
                             <input ref={fileInputRef} type="file" id="image-upload" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                             <div className="flex-grow flex border-2 border-dashed border-[var(--theme-border)] rounded-md cursor-pointer hover:bg-[var(--theme-bg)] transition-all" onClick={() => fileInputRef.current?.click()}>
                                <div className={`w-full flex flex-col items-center justify-center p-8 transition-colors ${isDragging ? 'bg-[var(--theme-orange)]/10' : ''}`}>
                                    <UploadIcon />
                                    <span className="mt-2 text-sm font-semibold">Click to upload or drag & drop</span>
                                    <span className="text-xs text-[var(--theme-text-secondary)]">Batch processing is supported</span>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <>
                            <header className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Image Queue ({imageItems.length})</h2>
                                <div className="flex items-center gap-2">
                                     <button onClick={handleClearAll} title="Clear All Images" className="text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]">Clear All</button>
                                </div>
                            </header>

                            <div className="flex-grow overflow-y-auto p-4 no-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {imageItems.map(item => (
                                        <div key={item.id} className="relative group aspect-square">
                                            <button 
                                                onClick={() => setSelectedImageId(item.id)}
                                                className={`w-full h-full rounded-md overflow-hidden transition-all ${selectedImageId === item.id ? 'ring-2 ring-[var(--theme-orange)] ring-offset-2 ring-offset-[var(--theme-card-bg)]' : ''}`}
                                            >
                                                <img src={item.imageElement.src} alt={item.file.name} className="w-full h-full object-cover"/>
                                            </button>
                                            <button onClick={(e) => handleRemoveImage(e, item.id)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white/80 hover:bg-red-500 hover:text-white transition-colors">
                                                <XIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <footer className="p-4 border-t border-[var(--theme-border)] bg-black/20 flex-shrink-0 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Output Size</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[500, 800, 1000].map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => setOutputSize(size)}
                                                className={`py-3 px-2 rounded-md font-semibold text-center transition-all border-2 ${
                                                    outputSize === size 
                                                        ? 'bg-[var(--theme-orange)] text-black border-[var(--theme-orange)]' 
                                                        : 'bg-transparent border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-orange)]/50 hover:text-white'
                                                }`}
                                            >
                                                {size} x {size} px
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadZip}
                                    disabled={isZipping}
                                    className="w-full flex items-center justify-center gap-2 bg-[var(--theme-orange)] text-black font-bold py-3 px-4 rounded-md hover:opacity-90 transition-colors disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed"
                                >
                                    {isZipping ? <Spinner /> : <DownloadIcon />}
                                    {isZipping ? `Processing... (${zipProgress}%)` : `Download All as .zip`}
                                </button>
                            </footer>
                        </>
                    )}
                </div>

                {/* Right Column: Preview Panel */}
                <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)] flex items-center justify-center min-h-[300px] md:h-[70vh]">
                    <div className="relative bg-[var(--theme-bg)] w-full aspect-square max-w-[500px] mx-auto rounded-md">
                        <canvas ref={previewCanvasRef} className="w-full h-full rounded-md" />
                        {!selectedImage && (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[var(--theme-text-secondary)]">
                                Preview will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
