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
            waveColor: 'rgb(120 116 111)', // theme-border
            progressColor: 'rgb(212 158 60)', // theme-yellow
            cursorColor: 'rgb(233 226 213)', // theme-text-primary
            barWidth: 2,
            barRadius: 2,
            barGap: 2,
            height: 60,
            url: URL.createObjectURL(audioBlob),
        });

        wavesurferRef.current = ws;

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => setIsPlaying(false));
        ws.on('audioprocess', (time: number) => setCurrentTime(Math.floor(time)));
        ws.on('ready', (newDuration: number) => {
             setDuration(Math.floor(newDuration));
             setCurrentTime(0);
        });

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
        <div className="bg-[var(--theme-bg)]/50 p-3 rounded-md">
            <div ref={containerRef} style={{ minHeight: '60px' }}></div>
            <div className="flex items-center justify-between mt-2">
                <button 
                    onClick={togglePlayPause} 
                    className="p-2 bg-[var(--theme-blue)] rounded-full text-white hover:opacity-90 flex-shrink-0 disabled:bg-[var(--theme-border)]"
                    disabled={!audioBlob}
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div className="text-sm font-mono text-[var(--theme-text-secondary)]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
        </div>
    );
};