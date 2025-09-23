
import React from 'react';
import { View } from '../../App';
import { PhotoIcon } from '../icons/PhotoIcon';

interface PhotosTileProps {
    onNavigate: (view: View) => void;
    count: number;
}

export const PhotosTile: React.FC<PhotosTileProps> = ({ onNavigate, count }) => (
    <button onClick={() => onNavigate('photos')} className="w-full h-full bg-purple-500 text-white p-4 flex flex-col justify-between hover:bg-purple-600 transition-colors">
        <PhotoIcon />
        <div className="self-start">
            <span className="font-bold text-3xl">{count}</span>
            <p className="text-sm">Photos</p>
        </div>
    </button>
);
