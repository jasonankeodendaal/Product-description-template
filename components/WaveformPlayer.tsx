import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { formatTime } from '../utils/formatters';

declare var WaveSurfer: any;

interface WaveformPlayerProps {
    audioBlob: Blob | null;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioBlob }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!containerRef.current || !audioBlob) return;
        
        // Cleanup previous instance if it exists
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: 'rgb(200, 200, 200)', // A light grey for the wave
            progressColor: 'var(--theme-green-light, #10B981)',
            cursorColor: 'var(--theme-text-primary-light, #2C3E50)',
            barWidth: 3,
            barRadius: 3,
            barGap: 2,
            height: 60,
            url: URL.createObjectURL(audioBlob),
        });

        wavesurferRef.current = ws;

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => setIsPlaying(false));
        ws.on('timeupdate', (time: number) => setCurrentTime(Math.floor(time)));
        ws.on('ready', (newDuration: number) => {
             setDuration(Math.floor(newDuration));
             setCurrentTime(0);
        });
        // FIX: The 'audioprocess' event was deprecated in WaveSurfer v7. Replaced with 'timeupdate' for compatibility.
        // ws.on('audioprocess', (time: number) => setCurrentTime(Math.floor(time)));


        return () => {
            ws.destroy();
        };
    }, [audioBlob]);

    const togglePlayPause = useCallback(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    }, []);

    return (
        <div className="p-3 rounded-md">
            <div ref={containerRef} style={{ minHeight: '60px' }}></div>
            <div className="flex items-center justify-between mt-2">
                <button 
                    onClick={togglePlayPause} 
                    className="p-2 bg-[var(--theme-green-light)] rounded-full text-white hover:opacity-90 flex-shrink-0 disabled:bg-[var(--theme-border-light)]"
                    disabled={!audioBlob}
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div className="text-sm font-mono text-[var(--theme-text-secondary-light)]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
        </div>
    );
};