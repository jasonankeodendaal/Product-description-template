import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please ensure you have granted permission in your browser settings.");
      }
    };

    getCameraStream();

    // Cleanup function to stop the stream
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video to capture full frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-[var(--theme-border)]">
        {error ? (
          <div className="w-full h-full flex items-center justify-center p-8 text-center text-[var(--theme-red)]">
            {error}
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        )}
         <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/60 rounded-full p-2" aria-label="Close Camera">
            <XIcon />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button onClick={onClose} className="text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-white px-4 py-2">
            Cancel
        </button>
        <button
          onClick={handleCapture}
          disabled={!stream || !!error}
          className="bg-[var(--theme-blue)] hover:opacity-90 text-white font-bold rounded-full p-4 shadow-lg disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed"
          aria-label="Take Picture"
        >
          <CameraIcon className="h-7 w-7" />
        </button>
      </div>
       {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};