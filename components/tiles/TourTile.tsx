
import React from 'react';
import { TourToolIcon } from '../icons/TourToolIcon';

interface TourTileProps {
    onOpenTour: () => void;
}

export const TourTile: React.FC<TourTileProps> = ({ onOpenTour }) => (
    <button onClick={onOpenTour} className="w-full h-full bg-cyan-500 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-cyan-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <TourToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base holographic-text">App Tour</span>
    </button>
);