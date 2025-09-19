import { useState, useRef, useCallback, useEffect } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Refs for Web Audio API visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const cleanupAudioContext = useCallback(() => {
     if (audioContextRef.current) {
        sourceRef.current?.disconnect();
        analyserRef.current = null;
        sourceRef.current = null;
        if(audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
        }
        audioContextRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up AudioContext for visualization
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      source.connect(analyser);

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        streamRef.current?.getTracks().forEach(track => track.stop());
        cleanupAudioContext();
      };
      
      recorder.start(100); // Start with timeslice for better responsiveness
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioBlob(null);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      // You could add state to show an error to the user
    }
  }, [cleanupAudioContext]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  }, [isRecording]);
  
   const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
         if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  const resumeRecording = useCallback(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
          setIsPaused(false);
           timerIntervalRef.current = window.setInterval(() => {
              setRecordingTime(prevTime => prevTime + 1);
          }, 1000);
      }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      cleanupAudioContext();
    };
  }, [cleanupAudioContext]);

  return { 
      isRecording, 
      isPaused,
      recordingTime, 
      audioBlob, 
      startRecording, 
      stopRecording,
      pauseRecording,
      resumeRecording,
      analyserNode: analyserRef.current 
    };
};