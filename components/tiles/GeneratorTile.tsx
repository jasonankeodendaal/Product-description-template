
import React from 'react';
import { View } from '../../App';
import { SparklesIcon } from '../icons/SparklesIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-emerald-500 text-white p-4 flex flex-col justify-between hover:bg-emerald-600 transition-colors">
        <SparklesIcon />
        <span className="font-bold text-lg self-start">Generator</span>
    </button>
);
