import React from 'react';
import { View } from '../../App';
import { RecordingIcon } from '../icons/RecordingIcon';

interface RecordingsTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const RecordingsTile: React.FC<RecordingsTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('recordings')} className="w-full h-full bg-pink-500 text-white p-4 flex flex-col justify-start items-start gap-4 hover:bg-pink-600 transition-colors">
        <RecordingIcon className="w-7 h-7" />
        <div>
            <span className="font-bold text-3xl">{count}</span>
            <p className="text-sm">Recordings</p>
        </div>
    </button>
);