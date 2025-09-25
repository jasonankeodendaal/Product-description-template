import React from 'react';
import { View } from '../../App';
import { NotepadToolIcon } from '../icons/NotepadToolIcon';

interface NotepadTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const NotepadTile: React.FC<NotepadTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('notepad')} className="w-full h-full bg-gradient-to-br from-sky-600/90 to-black/60 text-white p-3 flex flex-col justify-between items-start gap-2 hover:from-sky-500/90 hover:to-black/50 transition-all">
        <div className="w-10 h-10 holographic-icon">
            <NotepadToolIcon />
        </div>
        <div className="text-left">
            <span className="font-bold text-xl sm:text-2xl text-white">{count}</span>
            <p className="text-xs font-semibold">Notes</p>
        </div>
    </button>
);