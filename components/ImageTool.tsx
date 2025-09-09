import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CropIcon } from './icons/CropIcon';

// Declare JSZip to inform TypeScript about the global variable from the CDN.
declare var JSZip: any;

interface ImageToolProps {
  onClose: () => void;
}

interface ProcessedImage {
  id: string;
  file: File;
  originalName: string;
  squaredDataUrl: string | null;
  newName: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  error?: string;
}

interface CropData {
    relX: number;
    relY: number;
    relSize: number;
}

const ImageCropModal: React.FC<{
    originalImageSrc: string;
    onSave: (cropData: CropData) => void;
    onCancel: () => void;
}> = ({ originalImageSrc, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [crop, setCrop] = useState<{ x: number; y: number; size: number } | null>(null);
    const [interaction, setInteraction] = useState<'drawing' | 'moving' | 'resizing' | null>(null);
    const [startPos, setStartPos] = useState<{ x: number; y: number; crop: typeof crop } | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvasRef.current!.width / rect.width),
            y: (e.clientY - rect.top) * (canvasRef.current!.height / rect.height),
        };
    };
    
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (crop) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(crop.x, crop.y, crop.size, crop.size);
            ctx.clip();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.restore();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(crop.x, crop.y, crop.size, crop.size);
            
            // Resize handle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(crop.x + crop.size - 8, crop.y + crop.size - 8, 16, 16);
        }
    }, [crop]);
    
    useEffect(() => {
        const img = imageRef.current;
        img.src = originalImageSrc;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const MAX_DIM = 500;
                const { naturalWidth: w, naturalHeight: h } = img;
                let cW = w, cH = h;
                if (w > h) { if (w > MAX_DIM) { cH = h * (MAX_DIM / w); cW = MAX_DIM; } } 
                else { if (h > MAX_DIM) { cW = w * (MAX_DIM / h); cH = MAX_DIM; } }
                
                canvas.width = cW;
                canvas.height = cH;
                setCanvasSize({ width: cW, height: cH });

                const initialSize = Math.min(cW, cH) * 0.8;
                setCrop({
                    x: (cW - initialSize) / 2,
                    y: (cH - initialSize) / 2,
                    size: initialSize
                });
            }
        };
        return () => { URL.revokeObjectURL(originalImageSrc); };
    }, [originalImageSrc]);

    useEffect(() => { draw(); }, [crop, canvasSize, draw]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        if (!crop) {
            setInteraction('drawing');
            setCrop({ x: pos.x, y: pos.y, size: 0 });
        } else {
            const handleX = crop.x + crop.size - 8;
            const handleY = crop.y + crop.size - 8;
            if (pos.x >= handleX && pos.y >= handleY) {
                setInteraction('resizing');
            } else if (pos.x > crop.x && pos.x < crop.x + crop.size && pos.y > crop.y && pos.y < crop.y + crop.size) {
                setInteraction('moving');
            } else {
                 setInteraction('drawing');
                 setCrop({ x: pos.x, y: pos.y, size: 0 });
            }
        }
        setStartPos({ x: pos.x, y: pos.y, crop });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!interaction || !startPos) return;
        const pos = getMousePos(e);
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;

        if (interaction === 'drawing') {
            const size = Math.min(Math.abs(dx), Math.abs(dy));
            const newX = startPos.x + (dx < 0 ? -size : 0);
            const newY = startPos.y + (dy < 0 ? -size : 0);
            setCrop({ x: newX, y: newY, size });
        } else if (interaction === 'moving' && startPos.crop) {
            let newX = startPos.crop.x + dx;
            let newY = startPos.crop.y + dy;
            newX = Math.max(0, Math.min(newX, canvasSize.width - startPos.crop.size));
            newY = Math.max(0, Math.min(newY, canvasSize.height - startPos.crop.size));
            setCrop({ ...startPos.crop, x: newX, y: newY });
        } else if (interaction === 'resizing' && startPos.crop) {
            const newSize = Math.max(startPos.crop.size + dx, startPos.crop.size + dy);
            const clampedSize = Math.min(newSize, canvasSize.width - startPos.crop.x, canvasSize.height - startPos.crop.y, Math.min(canvasSize.width, canvasSize.height));
            setCrop({ ...startPos.crop, size: Math.max(20, clampedSize) });
        }
    };

    const handleMouseUp = () => setInteraction(null);

    const handleSave = () => {
        if (!crop || crop.size === 0) return;
        onSave({
            relX: crop.x / canvasSize.width,
            relY: crop.y / canvasSize.height,
            relSize: crop.size / canvasSize.width,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
            <div className="bg-[var(--theme-card-bg)] p-4 rounded-lg shadow-xl border border-[var(--theme-border)]">
                <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="rounded-md cursor-crosshair max-w-[80vw] max-h-[70vh]"></canvas>
                <div className="mt-4 flex justify-end gap-3">
                    <button onClick={onCancel} className="text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-white px-4 py-2">Cancel</button>
                    <button onClick={handleSave} className="bg-[var(--theme-blue)] text-white font-bold py-2 px-4 rounded-md hover:opacity-90">Save Crop</button>
                </div>
            </div>
        </div>
    );
};


const processImageOnCanvas = (imageFile: File, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context.');

                canvas.width = size;
                canvas.height = size;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);

                const { width: imgWidth, height: imgHeight } = img;
                
                let dWidth, dHeight;
                if (imgWidth > imgHeight) {
                    dWidth = size;
                    dHeight = (imgHeight / imgWidth) * size;
                } else {
                    dHeight = size;
                    dWidth = (imgWidth / imgHeight) * size;
                }

                const dx = (size - dWidth) / 2;
                const dy = (size - dHeight) / 2;

                ctx.drawImage(img, dx, dy, dWidth, dHeight);
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
  const [isConverting, setIsConverting] = useState<string | null>(null);
  const [targetSize, setTargetSize] = useState<number>(800);
  const [croppingImage, setCroppingImage] = useState<ProcessedImage | null>(null);
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
            newName: `${nameWithoutExt}_${targetSize}x${targetSize}`,
            status: 'queued',
          };
        });
      setImages(prev => [...prev, ...newImages]);
    }
    if (event.target) event.target.value = '';
  };

  const processQueue = useCallback(async () => {
    const nextImage = images.find(img => img.status === 'queued');
    if (!nextImage || isProcessing) return;

    setIsProcessing(true);
    setImages(prev => prev.map(img => img.id === nextImage.id ? { ...img, status: 'processing' } : img));

    try {
      const dataUrl = await processImageOnCanvas(nextImage.file, targetSize);
      setImages(prev => prev.map(img => img.id === nextImage.id ? { ...img, status: 'done', squaredDataUrl: dataUrl } : img));
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setImages(prev => prev.map(img => img.id === nextImage.id ? { ...img, status: 'error', error: errorMessage } : img));
    } finally {
        setIsProcessing(false);
    }
  }, [images, isProcessing, targetSize]);

  useEffect(() => {
    processQueue();
  }, [images, processQueue]);
  
  const handleRename = (id: string, newName: string) => {
      setImages(prev => prev.map(img => img.id === id ? { ...img, newName } : img));
  };
  
  const handleDownload = useCallback(async (img: ProcessedImage, format: 'png' | 'jpeg') => {
    if (!img.squaredDataUrl) return;

    const downloadLink = document.createElement('a');

    if (format === 'png') {
        downloadLink.href = img.squaredDataUrl;
        downloadLink.download = `${img.newName}.png`;
    } else {
        setIsConverting(img.id);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Canvas context is not available for conversion.");
            
            const image = new Image();
            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error('Failed to load image for conversion.'));
                image.src = img.squaredDataUrl!;
            });

            canvas.width = image.width;
            canvas.height = image.height;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);

            const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            downloadLink.href = jpgDataUrl;
            downloadLink.download = `${img.newName}.jpg`;
        } catch (error) {
            console.error("Failed to convert image to JPG:", error);
            alert(`Could not convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsConverting(null);
            return;
        } finally {
            setIsConverting(null);
        }
    }
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }, []);
  
    const handleCropSave = useCallback(async (id: string, file: File, cropData: CropData) => {
        try {
            const img = new Image();
            const originalUrl = URL.createObjectURL(file);
            img.src = originalUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            URL.revokeObjectURL(originalUrl);

            const sourceX = img.naturalWidth * cropData.relX;
            const sourceY = img.naturalHeight * cropData.relY;
            const sourceSize = img.naturalWidth * cropData.relSize;

            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetSize, targetSize);

            ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);
            
            const newDataUrl = canvas.toDataURL('image/png');
            setImages(prev => prev.map(img => img.id === id ? { ...img, squaredDataUrl: newDataUrl } : img));
        } catch (error) {
            console.error("Error cropping image:", error);
            alert("Failed to apply crop.");
        } finally {
            setCroppingImage(null);
        }
    }, [targetSize]);
  
  const handleClearAll = () => setImages([]);


  return (
    <>
    {croppingImage && (
        <ImageCropModal 
            originalImageSrc={URL.createObjectURL(croppingImage.file)}
            onSave={(cropData) => handleCropSave(croppingImage.id, croppingImage.file, cropData)}
            onCancel={() => setCroppingImage(null)}
        />
    )}
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full h-full md:max-w-5xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Image Squarer & HQ Converter</h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">Upload, resize, crop, and batch-download squared, high-quality images.</p>
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
                    <div className="flex-shrink-0 mb-4 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => fileInputRef.current?.click()} className="bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                                <UploadIcon /> Add More Images
                            </button>
                            <div className="flex items-center gap-2">
                                <label htmlFor="size-input" className="text-sm font-medium text-[var(--theme-text-secondary)]">Square Size:</label>
                                <input
                                    id="size-input"
                                    type="number"
                                    value={targetSize}
                                    onChange={(e) => setTargetSize(Math.max(50, parseInt(e.target.value, 10) || 800))}
                                    className="w-24 bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-1.5 text-sm text-[var(--theme-dark-bg)]"
                                    step="50"
                                />
                                <span className="text-sm text-[var(--theme-text-secondary)]">px</span>
                            </div>
                        </div>
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
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <button 
                                        onClick={() => handleDownload(img, 'png')}
                                        disabled={img.status !== 'done' || !!isConverting}
                                        className="bg-[var(--theme-blue)]/80 text-white font-semibold py-1.5 rounded hover:opacity-90 disabled:bg-[var(--theme-border)]"
                                    >PNG</button>
                                     <button 
                                        onClick={() => handleDownload(img, 'jpeg')}
                                        disabled={img.status !== 'done' || !!isConverting}
                                        className="bg-[var(--theme-blue)]/80 text-white font-semibold py-1.5 rounded hover:opacity-90 disabled:bg-[var(--theme-border)]"
                                    >
                                        {isConverting === img.id ? '...' : 'JPG'}
                                    </button>
                                    <button 
                                        onClick={() => setCroppingImage(img)}
                                        disabled={img.status !== 'done'}
                                        className="bg-[var(--theme-yellow)] text-black font-semibold py-1.5 rounded hover:opacity-90 disabled:bg-[var(--theme-border)] flex items-center justify-center"
                                    >
                                        <CropIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
    </>
  );
};