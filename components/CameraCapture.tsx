
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { XIcon } from './icons/XIcon';
import { SwitchCameraIcon } from './icons/SwitchCameraIcon';
import { RedoIcon } from './icons/RedoIcon';
import { CheckIcon } from './icons/CheckIcon';
import { FlashOnIcon } from './icons/FlashOnIcon';
import { FlashOffIcon } from './icons/FlashOffIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { TimerIcon } from './icons/TimerIcon';
import { GridIcon } from './icons/GridIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

const FILTERS = [
    { name: 'None', css: 'camera-filter-none' },
    { name: 'Vivid', css: 'camera-filter-vivid' },
    { name: 'Vintage', css: 'camera-filter-vintage' },
    { name: 'Noir', css: 'camera-filter-noir' },
    { name: 'Dreamy', css: 'camera-filter-dreamy' },
    { name: 'Cool', css: 'camera-filter-cool' },
    { name: 'Warm', css: 'camera-filter-warm' },
    { name: 'Mono', css: 'camera-filter-grayscale' },
    { name: 'Sepia', css: 'camera-filter-sepia' },
];

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  mode?: 'photo' | 'document';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, mode = 'photo' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, error, capabilities, switchCamera, applyAdvancedConstraint, activeDevice, devices } = useCamera();

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0].css);

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [timer, setTimer] = useState<0 | 3 | 5>(0);
  const [isGridOn, setIsGridOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        setZoom(capabilities.zoom?.min || 1);
    }
  }, [stream, capabilities.zoom]);

  useEffect(() => {
    if (capabilities.torch) {
      applyAdvancedConstraint([{ torch: flashMode === 'on' } as any]);
    }
  }, [flashMode, capabilities.torch, applyAdvancedConstraint]);

  const handleZoomChange = useCallback((newZoom: number) => {
    if (!capabilities.zoom) return;
    const clampedZoom = Math.max(capabilities.zoom.min, Math.min(newZoom, capabilities.zoom.max));
    setZoom(clampedZoom);
    applyAdvancedConstraint([{ zoom: clampedZoom } as any]);
  }, [capabilities.zoom, applyAdvancedConstraint]);

  const takePicture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    if (activeDevice?.label.toLowerCase().includes('front')) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }
    
    context.filter = window.getComputedStyle(video).filter;
    if(mode === 'document') context.filter = 'grayscale(1) contrast(1.8)';
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

    setPreviewDataUrl(dataUrl);
  }, [activeDevice, mode]);

  const handleCapture = useCallback(() => {
    if (timer > 0) {
        let count = timer;
        setCountdown(count);
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(interval);
                setCountdown(null);
                takePicture();
            }
        }, 1000);
    } else {
        takePicture();
    }
  }, [timer, takePicture]);


  const handleSave = () => {
      if(previewDataUrl) {
          onCapture(previewDataUrl);
      }
  }

  const toggleFlash = () => {
    setFlashMode(prev => prev === 'on' ? 'off' : 'on');
  }

  const UIIconButton: React.FC<{onClick: () => void, children: React.ReactNode, active?: boolean, label: string}> = ({ onClick, children, active, label }) => (
    <button onClick={onClick} aria-label={label} className={`p-2.5 rounded-full transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-black/40 text-white hover:bg-black/70'}`}>
        {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center font-inter" aria-modal="true" role="dialog">
        <div className="relative w-full h-full flex items-center justify-center">
             {error ? (
                <div className="p-8 text-center text-rose-400">{error}</div>
            ) : previewDataUrl ? (
                <img src={previewDataUrl} alt="Capture preview" className="max-w-full max-h-full object-contain animate-fade-in-down" />
            ) : (
                <>
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all duration-300 ${activeFilter}`}></video>
                    {isGridOn && <div className="camera-grid-overlay"></div>}
                </>
            )}

            {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-9xl font-bold text-white drop-shadow-lg animate-ping">{countdown}</span>
                </div>
            )}
        </div>
        
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10 flex justify-between items-center">
            <UIIconButton onClick={onClose} label="Close camera"><XIcon /></UIIconButton>
            {!previewDataUrl && (
                <div className="flex items-center gap-4">
                    {capabilities.torch && <UIIconButton onClick={toggleFlash} active={flashMode === 'on'} label="Toggle flash">{flashMode === 'on' ? <FlashOnIcon /> : <FlashOffIcon />}</UIIconButton>}
                    <UIIconButton onClick={() => setIsSettingsOpen(p => !p)} active={isSettingsOpen} label="Open settings"><SettingsIcon /></UIIconButton>
                </div>
            )}
        </div>

        {isSettingsOpen && !previewDataUrl && (
            <div className="absolute top-16 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 z-20 animate-fade-in-down space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><TimerIcon /> Timer</h4>
                    <div className="flex gap-2">
                        {[0, 3, 5].map(t => <button key={t} onClick={() => { setTimer(t as 0|3|5); setIsSettingsOpen(false); }} className={`px-4 py-1 rounded-full text-sm font-bold ${timer === t ? 'bg-orange-500 text-white' : 'bg-white/20 text-white'}`}>{t}s</button>)}
                    </div>
                </div>
                 <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><GridIcon /> Grid</h4>
                    <button onClick={() => setIsGridOn(p => !p)} className={`w-full px-4 py-1 rounded-full text-sm font-bold ${isGridOn ? 'bg-orange-500 text-white' : 'bg-white/20 text-white'}`}>{isGridOn ? 'On' : 'Off'}</button>
                </div>
            </div>
        )}

        {capabilities.zoom && !previewDataUrl && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2/5 flex flex-col items-center z-10 gap-2">
                <UIIconButton onClick={() => handleZoomChange(zoom + capabilities.zoom!.step * 5)} label="Zoom in"><PlusIcon /></UIIconButton>
                <input type="range" min={capabilities.zoom.min} max={Math.min(capabilities.zoom.max, 10)} step={capabilities.zoom.step} value={zoom} onChange={(e) => handleZoomChange(Number(e.target.value))} className="zoom-slider h-full" />
                <UIIconButton onClick={() => handleZoomChange(zoom - capabilities.zoom!.step * 5)} label="Zoom out"><MinusIcon /></UIIconButton>
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10">
            {!previewDataUrl ? (
                <>
                    {mode === 'photo' && (
                         <div className="flex justify-center items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                            {FILTERS.map(filter => (
                                <button key={filter.name} onClick={() => setActiveFilter(filter.css)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-lg border-2 bg-cover bg-center transition-all ${activeFilter === filter.css ? 'border-orange-500' : 'border-transparent'}`} style={{backgroundImage: `url(https://i.postimg.cc/pXG25b2d/filter-preview.jpg)`}}>
                                        <div className={`w-full h-full ${filter.css}`}></div>
                                    </div>
                                    <span className={`text-xs font-semibold transition-colors ${activeFilter === filter.css ? 'text-orange-500' : 'text-white'}`}>{filter.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex w-full items-center justify-between">
                        <div className="w-28 flex justify-start"></div>
                        <button onClick={handleCapture} disabled={!stream || !!error} className="bg-white hover:bg-gray-200 rounded-full w-20 h-20 shadow-lg ring-4 ring-white/30 disabled:bg-gray-400 transform transition-transform active:scale-90" aria-label="Take Picture" />
                        <div className="w-28 flex justify-end">
                            {devices.length > 1 && <UIIconButton onClick={switchCamera} label="Switch camera"><SwitchCameraIcon /></UIIconButton>}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex w-full items-center justify-between">
                    <UIIconButton onClick={() => setPreviewDataUrl(null)} label="Retake photo"><RedoIcon /></UIIconButton>
                    <button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg" aria-label="Save Photo">
                        <CheckIcon />
                    </button>
                    <div className="w-28"></div>
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};