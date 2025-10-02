import React from 'react';
import { View } from '../../App';
import { ImageToolIcon } from '../icons/ImageToolIcon';

interface ImageToolTileProps {
    onNavigate: (view: View) => void;
}

export const ImageToolTile: React.FC<ImageToolTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('image-tool')} className="w-full h-full bg-gradient-to-br from-amber-600/90 to-black/60 text-white p-2 sm:p-4 flex flex-col justify-center items-center text-center gap-1 sm:gap-2 hover:from-amber-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-12 sm:h-12 holographic-icon">
            <ImageToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-lg text-white">Image Tool</span>
    </button>
);