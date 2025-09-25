
import React from 'react';
import { View } from '../../App';
import { GeneratorToolIcon } from '../icons/GeneratorToolIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-orange-500 text-black p-3 flex flex-col justify-between items-start gap-2 hover:bg-orange-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <GeneratorToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base holographic-text">Generator</span>
    </button>
);