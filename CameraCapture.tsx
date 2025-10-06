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

const ASPECT_RATIOS: Record<string, number> = { '4:3': 4/3, '16:9': 16/9, '1:1': 1 };

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  mode?: 'photo' | 'document';
}

// FIX: Added export to the CameraCapture component.
export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, mode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { stream, error, capabilities, switchCamera, applyAdvancedConstraint, activeDevice, devices } = useCamera();

    const [captureDataUrl, setCaptureDataUrl] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    
    // UI State
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
    const [timer, setTimer] = useState<0 | 3 | 10>(0);
    const [isGridOn, setIsGridOn] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState(FILTERS[0].css);
    const [aspectRatio, setAspectRatio] = useState('4:3');

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            setZoom(capabilities.zoom?.min || 1);
        }
    }, [stream, capabilities.zoom]);
    
    useEffect(() => {
        if (capabilities.torch) {
            const isTorchOn = flashMode === 'on'; // 'auto' behaves as 'off' for simplicity
            applyAdvancedConstraint([{ torch: isTorchOn } as any]);
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
        
        const videoRatio = video.videoWidth / video.videoHeight;
        const targetRatio = ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS];

        let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

        if (videoRatio > targetRatio) {
            sWidth = video.videoHeight * targetRatio;
            sx = (video.videoWidth - sWidth) / 2;
        } else {
            sHeight = video.videoWidth / targetRatio;
            sy = (video.videoHeight - sHeight) / 2;
        }

        canvas.width = sWidth;
        canvas.height = sHeight;

        const context = canvas.getContext('2d');
        if (!context) return;
        
        if (activeDevice?.label.toLowerCase().includes('front')) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        
        context.filter = window.getComputedStyle(video).filter;
        
        context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        
        if (mode === 'document') {
            onCapture(dataUrl);
        } else {
            setCaptureDataUrl(dataUrl);
        }

    }, [activeDevice, aspectRatio, onCapture, mode]);

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

    const handleConfirm = () => {
        if (captureDataUrl) {
            onCapture(captureDataUrl);
        }
    };

    const handleRetake = () => {
        setCaptureDataUrl(null);
    };
    
    const toggleFlash = () => {
        setFlashMode(prev => prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto');
    };
    
    const toggleTimer = () => {
        setTimer(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0);
    };

    const toggleAspectRatio = () => {
        setAspectRatio(prev => prev === '4:3' ? '16:9' : prev === '16:9' ? '1:1' : '4:3');
    };

    if (captureDataUrl) {
        return (
            <div className="fixed inset-0 bg-black z-[60] flex flex-col font-inter" aria-modal="true" role="dialog">
                <img src={captureDataUrl} alt="Captured" className="w-full h-full object-contain" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-10 flex justify-between items-center">
                    <button onClick={handleRetake} className="flex flex-col items-center gap-2 text-white font-semibold">
                        <div className="bg-white/20 rounded-full p-4"><RedoIcon /></div>
                        Retake
                    </button>
                    <button onClick={handleConfirm} className="flex flex-col items-center gap-2 text-white font-semibold">
                        <div className="bg-emerald-500 rounded-full p-4"><CheckIcon /></div>
                        Use Photo
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col font-inter animate-fade-in-down" aria-modal="true" role="dialog">
            {/* Main Video View */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                {error ? (
                    <div className="p-8 text-center text-rose-400">{error}</div>
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
            
            {/* Top Bar Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center">
                <button onClick={onClose} className="p-2 bg-black/30 rounded-full text-white"><XIcon /></button>
                <div className="flex items-center gap-3">
                    {capabilities.torch && (
                        <button onClick={toggleFlash} className="p-2 bg-black/30 rounded-full text-white">
                            {flashMode === 'auto' ? 'A' : flashMode === 'on' ? <FlashOnIcon /> : <FlashOffIcon />}
                        </button>
                    )}
                    <button onClick={() => setIsSettingsVisible(p => !p)} className={`p-2 rounded-full transition-colors ${isSettingsVisible ? 'bg-orange-500 text-black' : 'bg-black/30 text-white'}`}><SettingsIcon /></button>
                </div>
            </div>

            {/* Bottom Bar Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col items-center gap-4">
                 <div className="flex justify-center items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2 w-full">
                    {FILTERS.map(filter => (
                        <button key={filter.name} onClick={() => setActiveFilter(filter.css)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className={`w-12 h-12 rounded-lg border-2 bg-cover bg-center transition-all ${activeFilter === filter.css ? 'border-orange-500' : 'border-transparent'}`} style={{backgroundImage: `url(https://i.postimg.cc/pXG25b2d/filter-preview.jpg)`}}>
                                <div className={`w-full h-full ${filter.css}`}></div>
                            </div>
                            <span className={`text-xs font-semibold transition-colors ${activeFilter === filter.css ? 'text-orange-500' : 'text-white'}`}>{filter.name}</span>
                        </button>
                    ))}
                </div>

                <div className="w-full flex items-center justify-between">
                    <div className="w-16 h-16"></div>
                    <button disabled={!stream || !!error} onClick={handleCapture} className="shutter-button disabled:bg-gray-400" aria-label="Take Picture" />
                    <div className="w-16 h-16 flex items-center justify-center">
                        {devices.length > 1 && (
                            <button onClick={switchCamera} className="bg-white/20 rounded-full p-3"><SwitchCameraIcon /></button>
                        )}
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};
