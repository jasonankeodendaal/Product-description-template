import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';

// Declare JSZip to inform TypeScript about the global variable from the CDN.
declare var JSZip: any;

interface ImageToolProps {
  onClose: () => void;
}

const TARGET_SIZE = 800;

interface ProcessedImage {
  id: string;
  file: File;
  originalName: string;
  squaredDataUrl: string | null;
  newName: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  error?: string;
}

const processImageOnCanvas = (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context.');

                canvas.width = TARGET_SIZE;
                canvas.height = TARGET_SIZE;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

                const { width: imgWidth, height: imgHeight } = img;
                const imgAspectRatio = imgWidth / imgHeight;
                
                let sx = 0, sy = 0, sWidth = imgWidth, sHeight = imgHeight;

                if (imgAspectRatio > 1) { // Wider than tall
                    sWidth = imgHeight;
                    sx = (imgWidth - sWidth) / 2;
                } else if (imgAspectRatio < 1) { // Taller than wide
                    sHeight = imgWidth;
                    sy = (imgHeight - sHeight) / 2;
                }

                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, TARGET_SIZE, TARGET_SIZE);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject('Could not load image file.');
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject('Failed to read file.');
        reader.readAsDataURL(imageFile);
    });
};


export const ImageTool: React.FC<ImageToolProps> = ({ onClose }) => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ProcessedImage[] = Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => {
          const nameParts = file.name.split('.');
          nameParts.pop();
          const nameWithoutExt = nameParts.join('.');
          return {
            id: crypto.randomUUID(),
            file,
            originalName: file.name,
            squaredDataUrl: null,
            newName: `${nameWithoutExt}_${TARGET_SIZE}x${TARGET_SIZE}`,
            status: 'queued',
          };
        });
      setImages(prev => [...prev, ...newImages]);
    }
    // Reset file input to allow re-uploading the same files
    if (event.target) event.target.value = '';
  };

  const processQueue = useCallback(async () => {
    const nextImage = images.find(img => img.status === 'queued');
    if (!nextImage || isProcessing) return;

    setIsProcessing(true);
    setImages(prev => prev.map(img => img.id === nextImage.id ? { ...img, status: 'processing' } : img));

    try {
      const dataUrl = await processImageOnCanvas(nextImage.file);
      setImages(prev => prev.map(img => img.id === nextImage.id ? { ...img, status: 'done', squaredDataUrl: dataUrl } : img));
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setImages(prev => prev.map(img => img.id === nextImage.id ? { ...img, status: 'error', error: errorMessage } : img));
    } finally {
        setIsProcessing(false);
    }
  }, [images, isProcessing]);

  useEffect(() => {
    processQueue();
  }, [images, processQueue]);
  
  const handleRename = (id: string, newName: string) => {
      setImages(prev => prev.map(img => img.id === id ? { ...img, newName } : img));
  };
  
  const handleDownload = (dataUrl: string, fileName: string, format: 'png' | 'jpeg') => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleClearAll = () => setImages([]);


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full h-full md:max-w-5xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Multi-Image Squarer</h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">Upload, rename, and batch-download squared images ({TARGET_SIZE}x{TARGET_SIZE}).</p>
          </div>
          <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
            <XIcon />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-hidden">
            {images.length === 0 ? (
                <div className="h-full border-2 border-dashed border-[var(--theme-border)] rounded-lg flex flex-col items-center justify-center">
                    <UploadIcon />
                    <p className="mt-2 text-[var(--theme-text-secondary)]">Drag & drop images here or</p>
                    <button onClick={() => fileInputRef.current?.click()} className="mt-2 bg-[var(--theme-blue)] text-white font-bold py-2 px-4 rounded-md hover:opacity-90">
                        Select Files
                    </button>
                    <input id="image-upload" type="file" ref={fileInputRef} className="sr-only" onChange={handleImageUpload} accept="image/*" multiple />
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <UploadIcon /> Add More Images
                        </button>
                         <input id="image-upload-more" type="file" ref={fileInputRef} className="sr-only" onChange={handleImageUpload} accept="image/*" multiple />
                        <div>
                             <button onClick={handleClearAll} className="text-sm font-semibold text-[var(--theme-red)] hover:underline">Clear All</button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map(img => (
                            <div key={img.id} className="bg-[var(--theme-bg)]/50 rounded-lg p-3 border border-[var(--theme-border)] flex flex-col gap-3">
                               <div className="w-full aspect-square bg-black/20 rounded flex items-center justify-center">
                                    {img.status === 'done' && img.squaredDataUrl && (
                                        <img src={img.squaredDataUrl} alt={img.newName} className="max-w-full max-h-full object-contain" />
                                    )}
                                    {img.status === 'processing' && <div className="text-[var(--theme-text-secondary)] text-sm animate-pulse">Processing...</div>}
                                    {img.status === 'queued' && <div className="text-[var(--theme-text-secondary)]/50 text-sm">Queued</div>}
                                    {img.status === 'error' && <div className="text-[var(--theme-red)] text-sm p-2 text-center">{img.error}</div>}
                                </div>
                                <input 
                                    type="text"
                                    value={img.newName}
                                    onChange={(e) => handleRename(img.id, e.target.value)}
                                    className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded p-1.5 text-sm text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"
                                    aria-label="Rename image"
                                />
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <button 
                                        onClick={() => img.squaredDataUrl && handleDownload(img.squaredDataUrl, img.newName, 'png')}
                                        disabled={img.status !== 'done'}
                                        className="bg-[var(--theme-blue)] text-white font-semibold py-1.5 rounded hover:opacity-90 disabled:bg-[var(--theme-border)]"
                                    >PNG</button>
                                     <button 
                                        onClick={() => img.squaredDataUrl && handleDownload(img.squaredDataUrl, img.newName, 'jpeg')}
                                        disabled={img.status !== 'done'}
                                        className="bg-[var(--theme-blue)] text-white font-semibold py-1.5 rounded hover:opacity-90 disabled:bg-[var(--theme-border)]"
                                    >JPG</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};