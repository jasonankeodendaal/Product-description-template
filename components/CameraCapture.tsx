

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { XIcon } from './icons/XIcon';
import { SwitchCameraIcon } from './icons/SwitchCameraIcon';
import { RedoIcon } from './icons/RedoIcon';
import { CheckIcon } from './icons/CheckIcon';
import { FlashOnIcon } from './icons/FlashOnIcon';
import { FlashOffIcon } from './icons/FlashOffIcon';
import { TimerIcon } from './icons/TimerIcon';
import { GridIcon } from './icons/GridIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ExposureIcon } from './icons/ExposureIcon';
import { AspectRatioIcon } from './icons/AspectRatioIcon';
import { ImageIcon } from './icons/ImageIcon';

const FILTERS = [ { name: 'None', css: 'camera-filter-none' }, { name: 'Vivid', css: 'camera-filter-vivid' }, { name: 'Vintage', css: 'camera-filter-vintage' }, { name: 'Noir', css: 'camera-filter-noir' }, { name: 'Dreamy', css: 'camera-filter-dreamy' }, { name: 'Cool', css: 'camera-filter-cool' }, { name: 'Warm', css: 'camera-filter-warm' }, { name: 'Mono', css: 'camera-filter-grayscale' }, { name: 'Sepia', css: 'camera-filter-sepia' }];
const ASPECT_RATIOS = { '4:3': 4/3, '16:9': 16/9, '1:1': 1 };

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  mode?: 'photo' | 'document';
}

const CameraControlsPanel: React.FC<{
    flashMode: 'on' | 'off'; onFlashToggle: () => void; hasFlash: boolean;
    timer: number; onTimerChange: (t: number) => void;
    isGridOn: boolean; onGridToggle: () => void;
    aspectRatio: string; onAspectRatioChange: (ar: string) => void;
    exposure: number; onExposureChange: (e: number) => void;
}> = ({ flashMode, onFlashToggle, hasFlash, timer, onTimerChange, isGridOn, onGridToggle, aspectRatio, onAspectRatioChange, exposure, onExposureChange }) => (
    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-black/50 backdrop-blur-md rounded-2xl p-4 z-20 animate-fade-in-down">
        <div className="grid grid-cols-3 gap-y-4">
            {hasFlash && <ControlItem icon={flashMode === 'on' ? <FlashOnIcon /> : <FlashOffIcon />} label="Flash" onClick={onFlashToggle} />}
            <ControlItem icon={<TimerIcon />} label={`${timer}s`} onClick={() => onTimerChange(timer === 0 ? 3 : timer === 3 ? 5 : 0)} />
            <ControlItem icon={<GridIcon />} label="Grid" onClick={onGridToggle} active={isGridOn} />
            <ControlItem icon={<AspectRatioIcon />} label={aspectRatio} onClick={() => {
                const ratios = Object.keys(ASPECT_RATIOS);
                const currentIndex = ratios.indexOf(aspectRatio);
                onAspectRatioChange(ratios[(currentIndex + 1) % ratios.length]);
            }} />
             <div className="flex flex-col items-center justify-center text-white text-xs font-semibold">
                <ExposureIcon />
                <input type="range" min="-2" max="2" step="0.5" value={exposure} onChange={e => onExposureChange(parseFloat(e.target.value))} className="w-16 mt-2" />
                <span className="mt-1">Exposure</span>
            </div>
            <ControlItem icon={<ImageIcon />} label="Styles" onClick={() => { /* This would open the filter strip */ }} />
        </div>
    </div>
);

const ControlItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-orange-500' : 'bg-white/10'}`}>{icon}</div>
        <span>{label}</span>
    </button>
);


export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, mode = 'photo' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, error, capabilities, switchCamera, applyAdvancedConstraint, activeDevice, devices } = useCamera();

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0); // -2 to 2
  const [aspectRatio, setAspectRatio] = useState('4:3');

  // UI State
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [timer, setTimer] = useState<0 | 3 | 5>(0);
  const [isGridOn, setIsGridOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 350);
  }, [onClose]);

  useEffect(() => { if (stream && videoRef.current) { videoRef.current.srcObject = stream; setZoom(capabilities.zoom?.min || 1); } }, [stream, capabilities.zoom]);
  useEffect(() => { if (capabilities.torch) { applyAdvancedConstraint([{ torch: flashMode === 'on' } as any]); } }, [flashMode, capabilities.torch, applyAdvancedConstraint]);

  const handleZoomChange = useCallback((newZoom: number) => { if (!capabilities.zoom) return; const clampedZoom = Math.max(capabilities.zoom.min, Math.min(newZoom, capabilities.zoom.max)); setZoom(clampedZoom); applyAdvancedConstraint([{ zoom: clampedZoom } as any]); }, [capabilities.zoom, applyAdvancedConstraint]);

  const takePicture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS];

    let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

    if (videoRatio > targetRatio) { // Video is wider than target, crop sides
        sWidth = video.videoHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
    } else { // Video is taller than target, crop top/bottom
        sHeight = video.videoWidth / targetRatio;
        sy = (video.videoHeight - sHeight) / 2;
    }

    canvas.width = sWidth;
    canvas.height = sHeight;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    if (activeDevice?.label.toLowerCase().includes('front')) { context.translate(canvas.width, 0); context.scale(-1, 1); }
    
    context.filter = `brightness(${1 + exposure * 0.25}) contrast(${1 + exposure * 0.1})`;
    
    context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    setPreviewDataUrl(dataUrl);
  }, [activeDevice, mode, exposure, aspectRatio]);

  const handleCapture = useCallback(() => {
    if (timer > 0) {
        let count = timer;
        setCountdown(count);
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) { clearInterval(interval); setCountdown(null); takePicture(); }
        }, 1000);
    } else { takePicture(); }
  }, [timer, takePicture]);

  const handleSave = () => { if(previewDataUrl) { onCapture(previewDataUrl); } }

  return (
    <div className={`camera-drawer-container ${isInitialized ? (isClosing ? 'camera-drawer-out' : 'camera-drawer-in') : 'camera-drawer-initial'}`} aria-modal="true" role="dialog">
      <div className="camera-drawer-content font-inter">
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ aspectRatio: ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS] }}>
             {error ? ( <div className="p-8 text-center text-rose-400">{error}</div>
            ) : previewDataUrl ? ( <img src={previewDataUrl} alt="Capture preview" className="w-full h-full object-contain animate-fade-in-down" />
            ) : ( <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ filter: `brightness(${1 + exposure * 0.25}) contrast(${1 + exposure * 0.1})` }}></video>
                    {isGridOn && <div className="camera-grid-overlay"></div>}
                </>
            )}
            {countdown !== null && countdown > 0 && ( <div className="absolute inset-0 flex items-center justify-center bg-black/50"><span className="text-9xl font-bold text-white drop-shadow-lg animate-ping">{countdown}</span></div> )}
        </div>
        
        <button onClick={handleClose} className="absolute top-4 left-4 bg-black/40 text-white rounded-full p-2.5 z-20"><XIcon /></button>
        {capabilities.zoom && !previewDataUrl && ( <input type="range" min={capabilities.zoom.min} max={Math.min(capabilities.zoom.max, 10)} step={capabilities.zoom.step} value={zoom} onChange={(e) => handleZoomChange(Number(e.target.value))} className="zoom-slider absolute right-4 top-1/2 -translate-y-1/2 h-2/5 z-10" /> )}

        {isControlsOpen && !previewDataUrl &&
            <CameraControlsPanel
                flashMode={flashMode} onFlashToggle={() => setFlashMode(p => p === 'on' ? 'off' : 'on')} hasFlash={!!capabilities.torch}
                timer={timer} onTimerChange={(t) => setTimer(t as 0 | 3 | 5)}
                isGridOn={isGridOn} onGridToggle={() => setIsGridOn(p => !p)}
                aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio}
                exposure={exposure} onExposureChange={setExposure}
            />
        }
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col items-center gap-4">
            {!previewDataUrl ? (
                <>
                    <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 text-white transition-transform" style={{ transform: isControlsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}><ChevronUpIcon /></button>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                        <button className="text-gray-400">VIDEO</button>
                        <button className="text-orange-400 relative">PHOTO<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full"></div></button>
                    </div>
                    <div className="w-full flex items-center justify-between">
                        <div className="w-16 h-16"></div> {/* Placeholder for gallery */}
                        <button onClick={handleCapture} disabled={!stream || !!error} className="shutter-button disabled:bg-gray-400" aria-label="Take Picture" />
                        <div className="w-16 h-16 flex items-center justify-center">
                             {devices.length > 1 && <button onClick={switchCamera} className="bg-white/10 rounded-full p-3"><SwitchCameraIcon /></button>}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex w-full items-center justify-between">
                    <button onClick={() => setPreviewDataUrl(null)} className="flex items-center gap-2 font-semibold bg-white/10 text-white py-3 px-6 rounded-full"><RedoIcon /> Retake</button>
                    <button onClick={handleSave} className="flex items-center gap-2 font-semibold bg-orange-500 text-black py-3 px-6 rounded-full"><CheckIcon /> Save Photo</button>
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};