import React from 'react';
import { View } from '../../App';
import { ImageToolIcon } from '../icons/ImageToolIcon';

interface ImageToolTileProps {
    onNavigate: (view: View) => void;
}

export const ImageToolTile: React.FC<ImageToolTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('image-tool')} className="w-full h-full bg-gradient-to-br from-amber-600/90 to-black/60 text-white p-4 flex flex-col justify-center items-center text-center gap-2 hover:from-amber-500/90 hover:to-black/50 transition-all">
        <div className="w-12 h-12 holographic-icon">
            <ImageToolIcon />
        </div>
        <span className="font-bold text-lg text-left text-white">Image Tool</span>
    </button>
);
