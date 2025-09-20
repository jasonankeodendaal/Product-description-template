import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SwitchCameraIcon } from './icons/SwitchCameraIcon';
import { FlashOnIcon } from './icons/FlashOnIcon';
import { FlashOffIcon } from './icons/FlashOffIcon';
import { CAMERA_FEATURES_LIST } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Stop current stream
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // useEffect to handle permissions and device enumeration correctly.
  useEffect(() => {
    let isMounted = true;
    const initializeCamera = async () => {
      stopCurrentStream();
      
      let tempStream: MediaStream | null = null;
      try {
        tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');

        if (videoInputs.length === 0) {
          throw new Error("No camera found on this device.");
        }
        
        if (isMounted) {
          setVideoDevices(videoInputs);
          setError(null);
        }

      } catch (err) {
        console.error("Error initializing camera:", err);
        let message = "Could not access the camera. Please grant permission in your browser settings.";
        if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                message = 'Camera access was denied. Please grant permission in your browser settings to use this feature.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                message = 'No camera was found on this device.';
            }
        }
        if (isMounted) {
            setError(message);
        }
      } finally {
        tempStream?.getTracks().forEach(track => track.stop());
      }
    };

    initializeCamera();
    
    return () => {
      isMounted = false;
      stopCurrentStream();
    };
  }, [stopCurrentStream]);

  // Start a new stream when the active device changes
  useEffect(() => {
    if (videoDevices.length === 0) return;

    let isCancelled = false;
    const startStream = async () => {
      stopCurrentStream();
      setIsStreamActive(false);
      setHasTorch(false);
      setIsTorchOn(false);

      try {
        const deviceId = videoDevices[activeDeviceIndex].deviceId;
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 3840 },
            height: { ideal: 2160 },
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isCancelled) {
          streamRef.current = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          const track = mediaStream.getVideoTracks()[0];
          // FIX: The standard MediaTrackCapabilities type may not include 'torch'. Cast to 'any' to bypass the check for this widely supported but sometimes untyped property.
          const capabilities = track.getCapabilities() as any;
          setHasTorch(!!capabilities.torch);

          setIsStreamActive(true);
          setError(null);
        } else {
            mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = "Could not access the camera. Please ensure you have granted permission in your browser settings.";
        if (err instanceof DOMException) {
            if (err.name === 'NotReadableError') {
                message = 'The camera is currently in use by another application or a hardware error occurred.';
            } else if (err.name === 'OverconstrainedError') {
                message = `The selected camera does not support the requested settings (e.g., resolution).`;
            }
        }
        if (!isCancelled) {
            setError(message);
            setIsStreamActive(false);
        }
      }
    };

    startStream();

    return () => {
      isCancelled = true;
      stopCurrentStream();
      setIsStreamActive(false);
    };
  }, [activeDeviceIndex, videoDevices, stopCurrentStream]);


  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      if (videoDevices[activeDeviceIndex]?.label.toLowerCase().includes('front')) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  }, [onCapture, activeDeviceIndex, videoDevices, isStreamActive]);

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      setActiveDeviceIndex(prev => (prev + 1) % videoDevices.length);
    }
  };
  
  const handleToggleTorch = useCallback(() => {
      if (!streamRef.current || !hasTorch) return;
      const track = streamRef.current.getVideoTracks()[0];
      const newTorchState = !isTorchOn;
      // FIX: The standard MediaTrackConstraintSet type may not include 'torch'. Cast to 'any' to bypass the check for this widely supported but sometimes untyped property.
      track.applyConstraints({ advanced: [{ torch: newTorchState } as any] })
          .then(() => {
              setIsTorchOn(newTorchState);
          })
          .catch(e => console.error("Failed to toggle torch", e));
  }, [hasTorch, isTorchOn]);

  const handleCopyFeatures = useCallback(() => {
    navigator.clipboard.writeText(CAMERA_FEATURES_LIST).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  }, []);


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-3xl aspect-[4/3] md:aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-[var(--theme-border)]">
        {error ? (
          <div className="w-full h-full flex items-center justify-center p-8 text-center text-[var(--theme-red)]">
            {error}
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
        )}
         <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/60 rounded-full p-2" aria-label="Close Camera">
            <XIcon />
        </button>
      </div>

      <div className="mt-6 flex w-full max-w-3xl items-center justify-between">
        <div className="w-28 flex justify-start gap-2">
             {hasTorch && (
                <button onClick={handleToggleTorch} className="text-white bg-black/30 hover:bg-black/60 rounded-full p-3" aria-label="Toggle Flash">
                    {isTorchOn ? <FlashOnIcon /> : <FlashOffIcon />}
                </button>
            )}
             <button onClick={handleCopyFeatures} title="Copy Camera Features" className="text-white bg-black/30 hover:bg-black/60 rounded-full p-3" aria-label="Copy Camera Features">
                {isCopied ? <CheckIcon /> : <CopyIcon />}
            </button>
        </div>
        <button
          onClick={handleCapture}
          disabled={!isStreamActive || !!error}
          className="bg-white hover:opacity-90 text-black font-bold rounded-full p-4 shadow-lg ring-4 ring-white/30 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Take Picture"
        >
          <CameraIcon className="h-7 w-7" />
        </button>
        <div className="w-28 flex justify-end">
            {videoDevices.length > 1 && (
              <button onClick={handleSwitchCamera} className="text-white bg-black/30 hover:bg-black/60 rounded-full p-3" aria-label="Switch Camera">
                  <SwitchCameraIcon />
              </button>
            )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};