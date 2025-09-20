
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';

const FilterSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}> = ({ label, value, onChange, min = 0, max = 200, step = 1 }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-[var(--theme-bg)] rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono w-10 text-right">{value}</span>
        </div>
    </div>
);


export const ImageTool: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
    const [fileName, setFileName] = useState<string>('squared-image.jpg');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cropBoxRef = useRef<HTMLDivElement>(null);
    const [cropBoxSize, setCropBoxSize] = useState(400); // Default size, will be updated
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [filters, setFilters] = useState({
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0,
    });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const imageStartPos = useRef({ x: 0, y: 0 });
    
    const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const newSize = entries[0].contentRect.width;
                if (newSize > 0) {
                    setCropBoxSize(newSize);
                }
            }
        });
        const currentRef = cropBoxRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const resetTool = useCallback(() => {
        setSourceImage(null);
        setFileName('squared-image.jpg');
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setFilters({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0 });
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    resetTool();
                    setSourceImage(img);
                    setFileName(`squared_${file.name.split('.')[0]}.jpg`);
                    // Reset and center image on load
                    const aspect = img.width / img.height;
                    let initialZoom, initialPos;
                    if (aspect > 1) { // Landscape
                        initialZoom = cropBoxSize / img.height;
                        const scaledWidth = img.width * initialZoom;
                        initialPos = { x: (cropBoxSize - scaledWidth) / 2, y: 0 };
                    } else { // Portrait or square
                        initialZoom = cropBoxSize / img.width;
                        const scaledHeight = img.height * initialZoom;
                        initialPos = { x: 0, y: (cropBoxSize - scaledHeight) / 2 };
                    }
                    setZoom(initialZoom);
                    setPosition(initialPos);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }, [cropBoxSize, resetTool]);
    
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
        
        const finalSize = Math.min(sourceImage.width, sourceImage.height, 2048); // Cap resolution
        canvas.width = finalSize;
        canvas.height = finalSize;
        
        const sourceX = -position.x / zoom;
        const sourceY = -position.y / zoom;
        const sourceSize = cropBoxSize / zoom;
        
        ctx.filter = filterString;
        ctx.drawImage(sourceImage, sourceX, sourceY, sourceSize, sourceSize, 0, 0, finalSize, finalSize);
        ctx.filter = 'none'; // Reset filter for next draw

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [sourceImage, position, zoom, fileName, cropBoxSize, filterString]);
    
    const updateFilter = (filterName: keyof typeof filters, value: number) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    return (
        <div className="container mx-auto p-4 lg:py-8 flex-1 flex flex-col overflow-y-auto">
            <h1 className="text-3xl font-bold text-[var(--theme-green)]">Image Editor</h1>
            <p className="text-[var(--theme-text-secondary)] mt-2">Upload an image to crop, apply filters, and download a perfect square.</p>
            
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
                            <h2 className="text-xl font-semibold mt-6 mb-4">2. Adjust Crop &amp; Filters</h2>
                            <div className="space-y-4">
                                <FilterSlider label="Zoom" value={zoom} onChange={setZoom} min={0.1} max={5} step={0.01} />
                                <FilterSlider label="Brightness" value={filters.brightness} onChange={(v) => updateFilter('brightness', v)} />
                                <FilterSlider label="Contrast" value={filters.contrast} onChange={(v) => updateFilter('contrast', v)} />
                                <FilterSlider label="Grayscale" value={filters.grayscale} onChange={(v) => updateFilter('grayscale', v)} max={100} />
                                <FilterSlider label="Sepia" value={filters.sepia} onChange={(v) => updateFilter('sepia', v)} max={100} />
                                <button onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }} className="text-sm text-[var(--theme-green)] hover:underline">Reset Position & Zoom</button>
                            </div>
                            
                             <h2 className="text-xl font-semibold mt-6 mb-4">3. Download</h2>
                             <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-2 bg-[var(--theme-green)] text-black font-bold py-3 px-4 rounded-md hover:opacity-90 transition-colors"
                                >
                                    <DownloadIcon />
                                    Download Image
                                </button>
                                <button
                                    onClick={resetTool}
                                    title="Clear Image"
                                    className="p-3 bg-[var(--theme-red)]/80 text-white rounded-md hover:bg-[var(--theme-red)] transition-colors"
                                >
                                    <TrashIcon />
                                </button>
                             </div>
                        </>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)] flex items-center justify-center">
                    <div
                        ref={cropBoxRef}
                        className="relative bg-[var(--theme-bg)] overflow-hidden cursor-move w-full aspect-square max-w-[400px] mx-auto rounded-md"
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
                                    pointerEvents: 'none',
                                    filter: filterString,
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