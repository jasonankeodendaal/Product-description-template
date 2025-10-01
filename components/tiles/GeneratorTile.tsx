import React from 'react';
import { View } from '../../App';
import { GeneratorToolIcon } from '../icons/GeneratorToolIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-gradient-to-br from-orange-600/90 to-black/60 text-white p-4 flex flex-col justify-center items-center text-center gap-2 hover:from-orange-500/90 hover:to-black/50 transition-all">
        <div className="w-12 h-12 holographic-icon">
            <GeneratorToolIcon />
        </div>
        <span className="font-bold text-lg text-white">Generator</span>
    </button>
);
