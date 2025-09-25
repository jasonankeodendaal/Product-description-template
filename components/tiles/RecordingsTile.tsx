import React from 'react';
import { View } from '../../App';
import { WaveformIcon } from '../icons/WaveformIcon';

interface RecordingsTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const RecordingsTile: React.FC<RecordingsTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('recordings')} className="w-full h-full bg-pink-500 text-white p-2 flex flex-col justify-start items-start gap-2 hover:bg-pink-600 transition-colors">
        <WaveformIcon className="w-8 h-8 text-white" />
        <div className="text-left mt-auto">
            <span className="font-bold text-2xl">{count}</span>
            <p className="text-xs">Recordings</p>
        </div>
    </button>
);