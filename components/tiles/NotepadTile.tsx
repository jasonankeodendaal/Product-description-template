
import React from 'react';
import { View } from '../../App';
import { NotepadToolIcon } from '../icons/NotepadToolIcon';

interface NotepadTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const NotepadTile: React.FC<NotepadTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('notepad')} className="w-full h-full bg-sky-500 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-sky-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <NotepadToolIcon />
        </div>
        <div className="text-left">
            <span className="font-bold text-xl sm:text-2xl holographic-text">{count}</span>
            <p className="text-xs font-semibold">Notes</p>
        </div>
    </button>
);