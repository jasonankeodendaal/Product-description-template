import React from 'react';
import { View } from '../../App';
import { SparklesIcon } from '../icons/SparklesIcon';

interface GeneratorTileProps {
    onNavigate: (view: View) => void;
}

export const GeneratorTile: React.FC<GeneratorTileProps> = ({ onNavigate }) => (
    <button onClick={() => onNavigate('generator')} className="w-full h-full bg-orange-500 text-black p-4 flex flex-col justify-start items-start gap-4 hover:bg-orange-600 transition-colors">
        <style>{`
            @keyframes sparkle-pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.2); opacity: 1; }
            }
            .sparkle-animation {
                animation: sparkle-pulse 2.5s ease-in-out infinite;
            }
        `}</style>
        <SparklesIcon className="w-7 h-7 sparkle-animation" />
        <span className="font-bold text-lg">Generator</span>
    </button>
);