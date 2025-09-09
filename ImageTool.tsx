import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Corrected import paths to be relative to the root directory.
import { XIcon } from './components/icons/XIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';

interface ImageToolProps {
  onClose: () => void;
}

const TARGET_SIZE = 800;

export const ImageTool: React.FC<ImageToolProps> = ({ onClose }) => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [squaredImageDataUrl, setSquaredImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
          setError('Invalid file type. Please upload an image.');
          return;
      }
      setError(null);
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
        };
        img.onerror = () => {
            setError('Could not load the image file.');
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  };

  useEffect(() => {
    if (originalImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not get canvas context.');
        return;
      }

      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;

      ctx.fillStyle = '#FFFFFF'; // White background for transparency
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      const imgWidth = originalImage.width;
      const imgHeight = originalImage.height;
      const imgAspectRatio = imgWidth / imgHeight;
      const canvasAspectRatio = TARGET_SIZE / TARGET_SIZE;

      let sx, sy, sWidth, sHeight;

      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas
        sHeight = imgHeight;
        sWidth = sHeight * canvasAspectRatio;
        sx = (imgWidth - sWidth) / 2;
        sy = 0;
      } else {
        // Image is taller than or same aspect as canvas
        sWidth = imgWidth;
        sHeight = sWidth / canvasAspectRatio;
        sx = 0;
        sy = (imgHeight - sHeight) / 2;
      }

      ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, TARGET_SIZE, TARGET_SIZE);
      
      // Get the data URL for preview and download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller file size
      setSquaredImageDataUrl(dataUrl);
    }
  }, [originalImage]);

  const handleDownload = useCallback(() => {
    if (!squaredImageDataUrl) return;
    const link = document.createElement('a');
    
    // Create a new filename
    const nameParts = originalFileName.split('.');
    const extension = nameParts.pop();
    const name = nameParts.join('.');
    link.download = `${name}_${TARGET_SIZE}x${TARGET_SIZE}.jpg`;
    
    link.href = squaredImageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [squaredImageDataUrl, originalFileName]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full max-w-5xl h-[90vh] rounded-lg shadow-xl border border-[var(--theme-border)] flex flex-col">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Image Squarer</h2>
            <p className="text-sm text-slate-400">Upload an image to resize and crop it to {TARGET_SIZE}x{TARGET_SIZE} pixels.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <XIcon />
          </button>
        </header>

        <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
          {/* Left Panel: Upload and Original Preview */}
          <div className="bg-black/20 border border-[var(--theme-border)] rounded-lg flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-300">Original Image</h3>
                <label htmlFor="image-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                    <UploadIcon /> Upload Image
                </label>
                <input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
            </div>
            <div className="flex-grow bg-slate-900/50 rounded-md flex items-center justify-center relative overflow-hidden">
                {originalImage ? (
                    <img src={originalImage.src} alt="Original" className="max-w-full max-h-full object-contain" />
                ) : (
                    <div className="text-center text-slate-500">
                        <p>Upload an image to begin.</p>
                        {error && <p className="text-red-400 mt-2">{error}</p>}
                    </div>
                )}
            </div>
          </div>
          {/* Right Panel: Squared Preview and Download */}
          <div className="bg-black/20 border border-[var(--theme-border)] rounded-lg flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-300">Squared Preview ({TARGET_SIZE}x{TARGET_SIZE})</h3>
                <button 
                    onClick={handleDownload}
                    disabled={!squaredImageDataUrl}
                    style={{ backgroundColor: 'var(--theme-green)'}}
                    className="text-white font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                >
                    <DownloadIcon /> Download
                </button>
            </div>
            <div className="flex-grow bg-slate-900/50 rounded-md flex items-center justify-center relative overflow-hidden">
                {squaredImageDataUrl ? (
                    <img src={squaredImageDataUrl} alt="Squared Preview" className="max-w-full max-h-full object-contain shadow-lg" />
                ) : (
                    <div className="text-center text-slate-500">
                        <p>Your squared image will appear here.</p>
                    </div>
                )}
                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
