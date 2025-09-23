import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SwitchCameraIcon } from './icons/SwitchCameraIcon';
import { SaveIcon } from './icons/SaveIcon';
import { RedoIcon } from './icons/RedoIcon';

const FILTERS = [
    { name: 'None', css: 'camera-filter-none' },
    { name: 'Mono', css: 'camera-filter-grayscale' },
    { name: 'Sepia', css: 'camera-filter-sepia' },
    { name: 'Contrast', css: 'camera-filter-contrast' },
    { name: 'Saturate', css: 'camera-filter-saturate' },
    { name: 'Invert', css: 'camera-filter-invert' },
];


interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  mode?: 'photo' | 'document';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, mode = 'photo' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number; step: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0].css);


  // Stop current stream
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize and get device list
  useEffect(() => {
    let isMounted = true;
    const initializeCamera = async () => {
      stopCurrentStream();
      try {
        // Request once to get permissions
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        
        if (isMounted) {
          if (videoInputs.length === 0) throw new Error("No camera found.");
          setVideoDevices(videoInputs);
          setError(null);
        }
        tempStream.getTracks().forEach(track => track.stop());
      } catch (err) {
        let message = "Could not access the camera. Please grant permission in your browser settings.";
        if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') message = 'Camera access was denied.';
            else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') message = 'No camera was found on this device.';
        }
        if (isMounted) setError(message);
      }
    };

    initializeCamera();
    return () => { isMounted = false; stopCurrentStream(); };
  }, [stopCurrentStream]);

  // Start a new stream when the active device changes
  useEffect(() => {
    if (videoDevices.length === 0) return;
    let isCancelled = false;

    const startStream = async () => {
      stopCurrentStream();
      setIsStreamActive(false);
      setZoomCaps(null);
      setZoom(1);
      
      try {
        const deviceId = videoDevices[activeDeviceIndex].deviceId;
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
        
        if (!isCancelled) {
          streamRef.current = mediaStream;
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
          
          const track = mediaStream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as any;
          if (capabilities.zoom) {
            setZoomCaps({ min: capabilities.zoom.min, max: capabilities.zoom.max, step: capabilities.zoom.step });
          }
          setIsStreamActive(true);
        } else {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (!isCancelled) setError("Could not start camera stream. It may be in use by another app.");
      }
    };

    startStream();
    return () => { isCancelled = true; stopCurrentStream(); };
  }, [activeDeviceIndex, videoDevices, stopCurrentStream]);


  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Flip image if it's the front camera
    if (videoDevices[activeDeviceIndex]?.label.toLowerCase().includes('front')) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }
    
    const filterToApply = mode === 'document' ? 'grayscale(1) contrast(1.8)' : (activeFilter === 'camera-filter-none' ? 'none' : FILTERS.find(f => f.css === activeFilter)?.css.replace('camera-filter-', ''));
    context.filter = filterToApply || 'none';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    context.filter = 'none'; // Reset filter for next use

    if (mode === 'document') {
        onCapture(dataUrl);
        onClose();
    } else {
        setPreviewDataUrl(dataUrl);
    }
  }, [onCapture, onClose, activeDeviceIndex, videoDevices, isStreamActive, activeFilter, mode]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
    const track = streamRef.current?.getVideoTracks()[0];
    if (track && 'zoom' in track.getCapabilities()) {
      track.applyConstraints({ advanced: [{ zoom: newZoom } as any] }).catch(e => console.error("Zoom failed", e));
    }
  }, []);
  
  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      setActiveDeviceIndex(prev => (prev + 1) % videoDevices.length);
    }
  };

  const handleSave = () => {
      if(previewDataUrl) {
          onCapture(previewDataUrl);
          onClose();
      }
  }


  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-0" aria-modal="true" role="dialog">
        <div className="relative w-full h-full flex items-center justify-center">
             {error ? (
                <div className="w-full h-full flex items-center justify-center p-8 text-center text-[var(--theme-red)]">{error}</div>
            ) : previewDataUrl ? (
                <img src={previewDataUrl} alt="Capture preview" className="max-w-full max-h-full object-contain" />
            ) : (
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all duration-300 ${activeFilter}`}></video>
            )}
             <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 z-20" aria-label="Close Camera">
                <XIcon />
            </button>

            {zoomCaps && !previewDataUrl && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2/3 w-12 flex flex-col items-center z-10">
                    <input 
                        type="range"
                        min={zoomCaps.min}
                        max={Math.min(zoomCaps.max, 10)} // Cap zoom at 10x for usability
                        step={zoomCaps.step}
                        value={zoom}
                        onChange={(e) => handleZoomChange(Number(e.target.value))}
                        className="w-full h-full appearance-none bg-transparent [-webkit-appearance:none] transform -rotate-90 origin-center"
                        style={{'--thumb-color': 'var(--theme-green)'} as React.CSSProperties}
                    />
                </div>
            )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
            {/* Filter Carousel */}
            {!previewDataUrl && mode === 'photo' && (
                 <div className="flex justify-center items-center gap-4 mb-4 overflow-x-auto no-scrollbar pb-2">
                    {FILTERS.map(filter => (
                        <button key={filter.name} onClick={() => setActiveFilter(filter.css)} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeFilter === filter.css ? 'bg-[var(--theme-green)] text-black' : 'bg-black/30 text-white'}`}>
                            {filter.name}
                        </button>
                    ))}
                </div>
            )}
           
            <div className="flex w-full items-center justify-between">
                <div className="w-28 flex justify-start">
                    {previewDataUrl && (
                        <button onClick={() => setPreviewDataUrl(null)} className="text-white bg-black/40 hover:bg-black/70 rounded-full p-4" aria-label="Retake">
                            <RedoIcon />
                        </button>
                    )}
                </div>
                
                {!previewDataUrl && (
                    <button
                        onClick={handleCapture}
                        disabled={!isStreamActive || !!error}
                        className="bg-white hover:opacity-90 rounded-full w-20 h-20 shadow-lg ring-4 ring-white/30 disabled:bg-gray-400"
                        aria-label="Take Picture"
                    />
                )}
                 {previewDataUrl && (
                     <button onClick={handleSave} className="bg-[var(--theme-green)] hover:opacity-90 rounded-full w-20 h-20 flex items-center justify-center" aria-label="Save Photo">
                        <SaveIcon />
                     </button>
                 )}

                <div className="w-28 flex justify-end">
                    {!previewDataUrl && videoDevices.length > 1 && (
                        <button onClick={handleSwitchCamera} className="text-white bg-black/40 hover:bg-black/70 rounded-full p-4" aria-label="Switch Camera">
                            <SwitchCameraIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

// Add RedoIcon for retaking photo
const RedoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
);
