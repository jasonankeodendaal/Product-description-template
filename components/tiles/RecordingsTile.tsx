import React from 'react';
import { View } from '../../App';
import { RecordingsToolIcon } from '../icons/RecordingsToolIcon';

interface RecordingsTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const RecordingsTile: React.FC<RecordingsTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('recordings')} className="w-full h-full bg-gradient-to-br from-pink-600/90 to-black/60 text-white p-2 sm:p-3 flex flex-col justify-between items-start gap-1 sm:gap-2 hover:from-pink-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-10 sm:h-10 holographic-icon">
            <RecordingsToolIcon />
        </div>
        <div className="text-left">
            <span className="font-bold text-xl sm:text-2xl text-white">{count}</span>
            <p className="text-xs font-semibold">Recordings</p>
        </div>
    </button>
);
