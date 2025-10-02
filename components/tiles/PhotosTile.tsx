import React from 'react';
import { View } from '../../App';
import { PhotosToolIcon } from '../icons/PhotosToolIcon';

interface PhotosTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const PhotosTile: React.FC<PhotosTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('photos')} className="w-full h-full bg-gradient-to-br from-purple-600/90 to-black/60 text-white p-2 sm:p-4 flex flex-col justify-center items-center text-center gap-1 hover:from-purple-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-12 sm:h-12 holographic-icon">
            <PhotosToolIcon />
        </div>
        <div className="text-center">
            <span className="font-bold text-2xl sm:text-3xl text-white">{count}</span>
            <p className="font-semibold text-xs sm:text-base leading-tight">Photos</p>
        </div>
    </button>
);