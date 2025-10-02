import React from 'react';
import { TourToolIcon } from '../icons/TourToolIcon';

interface TourTileProps {
    onOpenTour: () => void;
}

export const TourTile: React.FC<TourTileProps> = ({ onOpenTour }) => (
    <button onClick={onOpenTour} className="w-full h-full bg-gradient-to-br from-cyan-600/90 to-black/60 text-white p-2 sm:p-4 flex flex-col justify-center items-center text-center gap-1 sm:gap-2 hover:from-cyan-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-12 sm:h-12 holographic-icon">
            <TourToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-lg text-white">App Tour</span>
    </button>
);