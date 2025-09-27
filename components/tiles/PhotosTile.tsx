import React from 'react';
import { View } from '../../App';
import { PhotosToolIcon } from '../icons/PhotosToolIcon';

interface PhotosTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const PhotosTile: React.FC<PhotosTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('photos')} className="w-full h-full bg-gradient-to-br from-purple-600/90 to-black/60 text-white p-2 sm:p-3 flex flex-col justify-between items-start gap-1 sm:gap-2 hover:from-purple-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-10 sm:h-10 holographic-icon">
            <PhotosToolIcon />
        </div>
        <div className="text-left">
            <span className="font-bold text-xl sm:text-2xl text-white">{count}</span>
            <p className="text-xs font-semibold">Photos</p>
        </div>
    </button>
);
