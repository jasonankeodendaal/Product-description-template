import React from 'react';
import { View } from '../../App';
import { GeneratorToolIcon } from '../icons/GeneratorToolIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-gradient-to-br from-orange-600/90 to-black/60 text-white p-2 sm:p-4 flex flex-col justify-center items-center text-center gap-1 sm:gap-2 hover:from-orange-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-12 sm:h-12 holographic-icon">
            <GeneratorToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-lg text-white">Generator</span>
    </button>
);