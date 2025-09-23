import React from 'react';
import { View } from '../../App';
import { SparklesIcon } from '../icons/SparklesIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-emerald-500 text-white p-4 flex flex-col justify-start items-start gap-4 hover:bg-emerald-600 transition-colors">
        <SparklesIcon className="w-7 h-7" />
        <span className="font-bold text-lg">Generator</span>
    </button>
);