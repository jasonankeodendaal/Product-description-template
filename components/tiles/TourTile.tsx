import React from 'react';
import { TourToolIcon } from '../icons/TourToolIcon';

interface TourTileProps {
    onOpenTour: () => void;
}

export const TourTile: React.FC<TourTileProps> = ({ onOpenTour }) => (
    <button onClick={onOpenTour} className="w-full h-full bg-gradient-to-br from-cyan-600/90 to-black/60 text-white p-3 flex flex-col justify-between items-start gap-2 hover:from-cyan-500/90 hover:to-black/50 transition-all">
        <div className="w-10 h-10 holographic-icon">
            <TourToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-white">App Tour</span>
    </button>
);