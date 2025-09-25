import { useState, useCallback, useEffect, useRef } from 'react';

export interface CameraCapabilities {
    zoom?: { min: number; max: number; step: number };
    torch?: boolean;
}

export const useCamera = () => {
    const streamRef = useRef<MediaStream | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capabilities, setCapabilities] = useState<CameraCapabilities>({});
    const [error, setError] = useState<string | null>(null);

    const stopCurrentStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const initialize = useCallback(async () => {
        stopCurrentStream();
        try {
            // Get permission and list devices
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
            
            if (videoDevices.length === 0) throw new Error("No camera found.");
            
            // Prefer the back camera ('environment') as the default
            const backCameraIndex = videoDevices.findIndex(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setActiveDeviceIndex(backCameraIndex > -1 ? backCameraIndex : 0);
            setDevices(videoDevices);
            setError(null);
            
            // Clean up the temporary stream
            tempStream.getTracks().forEach(track => track.stop());
        } catch (err) {
            let message = "Could not access the camera. Please grant permission in your browser settings.";
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') message = 'Camera access was denied.';
                else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') message = 'No camera was found on this device.';
            }
            setError(message);
        }
    }, [stopCurrentStream]);

    useEffect(() => {
        initialize();
        return () => stopCurrentStream();
    }, [initialize, stopCurrentStream]);

    useEffect(() => {
        if (devices.length === 0) return;
        let isCancelled = false;

        const startStream = async () => {
            stopCurrentStream();
            setStream(null);
            setCapabilities({});
            
            try {
                const deviceId = devices[activeDeviceIndex]?.deviceId;
                const constraints: MediaStreamConstraints = {
                    video: { deviceId: deviceId ? { exact: deviceId } : undefined, width: { ideal: 1920 }, height: { ideal: 1080 } }
                };
                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (!isCancelled) {
                    streamRef.current = newStream;
                    setStream(newStream);
                    
                    const track = newStream.getVideoTracks()[0];
                    if (track.getCapabilities) {
                        const caps = track.getCapabilities() as any;
                        const newCapabilities: CameraCapabilities = {};
                        if (caps.zoom) newCapabilities.zoom = { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step };
                        if (caps.torch) newCapabilities.torch = true;
                        setCapabilities(newCapabilities);
                    }
                } else {
                    newStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                if (!isCancelled) setError("Could not start camera stream.");
            }
        };

        startStream();
        return () => { isCancelled = true; stopCurrentStream(); };
    }, [activeDeviceIndex, devices, stopCurrentStream]);
    
    const switchCamera = useCallback(() => {
        if (devices.length > 1) {
            setActiveDeviceIndex(prev => (prev + 1) % devices.length);
        }
    }, [devices.length]);

    const applyAdvancedConstraint = useCallback((constraint: MediaTrackConstraints['advanced']) => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (track && track.readyState === 'live') {
            track.applyConstraints({ advanced: constraint }).catch(e => console.error("Failed to apply constraint", constraint, e));
        }
    }, []);

    return {
        stream,
        error,
        devices,
        capabilities,
        switchCamera,
        applyAdvancedConstraint,
        activeDevice: devices[activeDeviceIndex]
    };
};
