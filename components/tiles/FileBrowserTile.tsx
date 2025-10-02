import React from 'react';
import { View } from '../../App';
import { FileBrowserToolIcon } from '../icons/FileBrowserToolIcon';

interface FileBrowserTileProps {
    onNavigate: (view: View) => void;
}

export const FileBrowserTile: React.FC<FileBrowserTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('browser')} className="w-full h-full bg-gradient-to-br from-blue-600/90 to-black/60 text-white p-2 sm:p-4 flex flex-col justify-center items-center text-center gap-1 sm:gap-2 hover:from-blue-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-12 sm:h-12 holographic-icon">
            <FileBrowserToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-lg text-white">File Browser</span>
    </button>
);