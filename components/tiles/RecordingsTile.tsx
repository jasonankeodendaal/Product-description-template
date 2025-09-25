
import React from 'react';
import { View } from '../../App';
import { RecordingsToolIcon } from '../icons/RecordingsToolIcon';

interface RecordingsTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const RecordingsTile: React.FC<RecordingsTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('recordings')} className="w-full h-full bg-pink-500 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-pink-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <RecordingsToolIcon />
        </div>
        <div className="text-left">
            <span className="font-bold text-xl sm:text-2xl holographic-text">{count}</span>
            <p className="text-xs font-semibold">Recordings</p>
        </div>
    </button>
);