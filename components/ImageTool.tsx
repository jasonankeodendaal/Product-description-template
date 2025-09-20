

import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';

const CROP_BOX_SIZE = 400; // The size of the crop UI in pixels

export const ImageTool: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
    const [fileName, setFileName] = useState<string>('squared-image.jpg');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const imageStartPos = useRef({ x: 0, y: 0 });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setSourceImage(img);
                    setFileName(`squared_${file.name.split('.')[0]}.jpg`);
                    // Reset and center image on load
                    const aspect = img.width / img.height;
                    let initialZoom, initialPos;
                    if (aspect > 1) { // Landscape
                        initialZoom = CROP_BOX_SIZE / img.height;
                        const scaledWidth = img.width * initialZoom;
                        initialPos = { x: (CROP_BOX_SIZE - scaledWidth) / 2, y: 0 };
                    } else { // Portrait or square
                        initialZoom = CROP_BOX_SIZE / img.width;
                        const scaledHeight = img.height * initialZoom;
                        initialPos = { x: 0, y: (CROP_BOX_SIZE - scaledHeight) / 2 };
                    }
                    setZoom(initialZoom);
                    setPosition(initialPos);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        imageStartPos.current = { ...position };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition({
            x: imageStartPos.current.x + dx,
            y: imageStartPos.current.y + dy,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDownload = useCallback(() => {
        if (!sourceImage || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const finalSize = Math.min(sourceImage.width, sourceImage.height);
        canvas.width = finalSize;
        canvas.height = finalSize;
        
        const sourceX = -position.x / zoom;
        const sourceY = -position.y / zoom;
        const sourceSize = CROP_BOX_SIZE / zoom;
        
        ctx.drawImage(sourceImage, sourceX, sourceY, sourceSize, sourceSize, 0, 0, finalSize, finalSize);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [sourceImage, position, zoom, fileName]);

    return (
        <div className="container mx-auto p-4 lg:py-8 h-full flex flex-col overflow-y-auto">
            <h1 className="text-3xl font-bold text-[var(--theme-green)]">Image Squarer Tool</h1>
            <p className="text-[var(--theme-text-secondary)] mt-2">Upload an image to crop it into a perfect square. Drag to position and use the slider to zoom.</p>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-start">
                {/* Control Panel */}
                <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)]">
                    <h2 className="text-xl font-semibold mb-4">1. Upload Image</h2>
                    <input type="file" id="image-upload" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    <label htmlFor="image-upload" className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--theme-border)] rounded-md cursor-pointer hover:bg-[var(--theme-bg)] transition-colors">
                        <UploadIcon />
                        <span className="mt-2 text-sm font-semibold">{sourceImage ? 'Choose another image' : 'Click to upload'}</span>
                        <span className="text-xs text-[var(--theme-text-secondary)]">or drag and drop</span>
                    </label>

                    {sourceImage && (
                        <>
                            <h2 className="text-xl font-semibold mt-6 mb-4">2. Adjust Crop</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="zoom" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Zoom</label>
                                    <input
                                        id="zoom"
                                        type="range"
                                        min={0.1}
                                        max={5}
                                        step={0.01}
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <button onClick={() => setPosition({ x: 0, y: 0 })} className="text-sm text-[var(--theme-green)] hover:underline">Reset Position</button>
                            </div>
                            
                             <h2 className="text-xl font-semibold mt-6 mb-4">3. Download</h2>
                             <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 bg-[var(--theme-green)] text-black font-bold py-3 px-4 rounded-md hover:opacity-90 transition-colors"
                             >
                                <DownloadIcon />
                                Download Squared Image
                             </button>
                        </>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)] flex items-center justify-center">
                    <div
                        className="relative bg-[var(--theme-bg)] overflow-hidden cursor-move"
                        style={{ width: CROP_BOX_SIZE, height: CROP_BOX_SIZE }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {sourceImage ? (
                            <img
                                src={sourceImage.src}
                                alt="Preview"
                                draggable="false"
                                style={{
                                    position: 'absolute',
                                    left: position.x,
                                    top: position.y,
                                    width: sourceImage.width * zoom,
                                    height: sourceImage.height * zoom,
                                    pointerEvents: 'none'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--theme-text-secondary)]">
                                Preview will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};