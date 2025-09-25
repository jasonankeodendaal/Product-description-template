import React from 'react';
import { QuestionCircleIcon } from '../icons/QuestionCircleIcon';

interface TourTileProps {
    onOpenTour: () => void;
}

export const TourTile: React.FC<TourTileProps> = ({ onOpenTour }) => (
    <button onClick={onOpenTour} className="w-full h-full bg-cyan-500 text-white p-2 flex flex-col justify-between items-start gap-2 hover:bg-cyan-600 transition-colors">
        <QuestionCircleIcon />
        <span className="font-bold text-base">App Tour</span>
    </button>
);
