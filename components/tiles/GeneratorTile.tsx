import React from 'react';
import { View } from '../../App';
import { GeneratorToolIcon } from '../icons/GeneratorToolIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-gradient-to-br from-orange-600/90 to-black/60 text-white p-3 flex flex-col justify-between items-start gap-2 hover:from-orange-500/90 hover:to-black/50 transition-all">
        <div className="w-10 h-10 holographic-icon">
            <GeneratorToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-white">Generator</span>
    </button>
);