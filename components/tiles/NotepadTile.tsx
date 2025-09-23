
import React from 'react';
import { View } from '../../App';
import { NotepadIcon } from '../icons/NotepadIcon';

interface NotepadTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const NotepadTile: React.FC<NotepadTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('notepad')} className="w-full h-full bg-sky-500 text-white p-4 flex flex-col justify-between hover:bg-sky-600 transition-colors">
        <NotepadIcon className="w-6 h-6 text-white" />
        <div className="self-start">
            <span className="font-bold text-3xl">{count}</span>
            <p className="text-sm">Notes</p>
        </div>
    </button>
);
