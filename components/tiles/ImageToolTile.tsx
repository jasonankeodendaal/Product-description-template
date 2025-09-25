
import React from 'react';
import { View } from '../../App';
import { ImageToolIcon } from '../icons/ImageToolIcon';

interface ImageToolTileProps {
    onNavigate: (view: View) => void;
}

export const ImageToolTile: React.FC<ImageToolTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('image-tool')} className="w-full h-full bg-amber-500 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-amber-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <ImageToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-left holographic-text">Image Tool</span>
    </button>
);