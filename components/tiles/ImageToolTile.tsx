
import React from 'react';
import { View } from '../../App';
import { ImageIcon } from '../icons/ImageIcon';

interface ImageToolTileProps {
    onNavigate: (view: View) => void;
}

export const ImageToolTile: React.FC<ImageToolTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('image-tool')} className="w-full h-full bg-amber-500 text-white p-4 flex flex-col justify-between hover:bg-amber-600 transition-colors">
        <ImageIcon className="w-6 h-6 text-white" />
        <span className="font-bold text-lg self-start">Image Tool</span>
    </button>
);
