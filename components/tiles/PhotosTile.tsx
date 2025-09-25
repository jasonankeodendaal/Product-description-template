
import React from 'react';
import { View } from '../../App';
import { PhotosToolIcon } from '../icons/PhotosToolIcon';

interface PhotosTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const PhotosTile: React.FC<PhotosTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('photos')} className="w-full h-full bg-purple-500 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-purple-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <PhotosToolIcon />
        </div>
        <div className="text-left">
            <span className="font-bold text-xl sm:text-2xl holographic-text">{count}</span>
            <p className="text-xs font-semibold">Photos</p>
        </div>
    </button>
);