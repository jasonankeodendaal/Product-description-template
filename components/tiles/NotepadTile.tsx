import React from 'react';
import { View } from '../../App';
import { NotepadIcon } from '../icons/NotepadIcon';

interface NotepadTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const NotepadTile: React.FC<NotepadTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('notepad')} className="w-full h-full bg-sky-500 text-white p-4 flex flex-col justify-start items-start gap-4 hover:bg-sky-600 transition-colors">
        <NotepadIcon className="w-7 h-7 text-white" />
        <div>
            <span className="font-bold text-3xl">{count}</span>
            <p className="text-sm">Notes</p>
        </div>
    </button>
);