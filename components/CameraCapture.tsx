import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { SwitchCameraIcon } from './icons/SwitchCameraIcon';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);

  // Stop current stream
  const stopCurrentStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // useEffect to handle permissions and device enumeration correctly.
  useEffect(() => {
    let isMounted = true;
    const initializeCamera = async () => {
      let tempStream: MediaStream | null = null;
      try {
        // First, get a generic stream to trigger the permission prompt.
        tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // If we're here, permission was granted. Now we can get the full device list.
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
        // Stop the temporary stream, as the next useEffect will handle the specific device.
        tempStream?.getTracks().forEach(track => track.stop());
      }
    };

    initializeCamera();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Start a new stream when the active device changes
  useEffect(() => {
    if (videoDevices.length === 0) return;

    let isCancelled = false;
    const startStream = async () => {
      stopCurrentStream(); // Stop any existing stream first
      try {
        const deviceId = videoDevices[activeDeviceIndex].deviceId;
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isCancelled) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setError(null);
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
        }
      }
    };

    startStream();

    return () => {
      isCancelled = true;
      stopCurrentStream();
    };
  }, [activeDeviceIndex, videoDevices, stopCurrentStream]);


  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      // Flip the image horizontally if it's the front camera
      if (videoDevices[activeDeviceIndex]?.label.toLowerCase().includes('front')) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  }, [onCapture, activeDeviceIndex, videoDevices]);

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      setActiveDeviceIndex(prev => (prev + 1) % videoDevices.length);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-[var(--theme-border)]">
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

      <div className="mt-6 flex w-full max-w-3xl items-center justify-around">
        <div className="w-16"></div>
        <button
          onClick={handleCapture}
          disabled={!stream || !!error}
          className="bg-white hover:opacity-90 text-black font-bold rounded-full p-4 shadow-lg ring-4 ring-white/30 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Take Picture"
        >
          <CameraIcon className="h-7 w-7" />
        </button>
        <div className="w-16 flex justify-center">
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
