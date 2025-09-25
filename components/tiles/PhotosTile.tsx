import React from 'react';
import { View } from '../../App';
import { PhotoIcon } from '../icons/PhotoIcon';

interface PhotosTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const PhotosTile: React.FC<PhotosTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('photos')} className="w-full h-full bg-purple-500 text-white p-2 flex flex-col justify-start items-start gap-2 hover:bg-purple-600 transition-colors">
        <PhotoIcon className="w-7 h-7" />
        <div className="text-left mt-auto">
            <span className="font-bold text-2xl">{count}</span>
            <p className="text-xs">Photos</p>
        </div>
    </button>
);