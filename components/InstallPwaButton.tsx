import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface InstallPwaButtonProps {
    onClick: () => void;
    show: boolean;
}

export const InstallPwaButton: React.FC<InstallPwaButtonProps> = ({ onClick, show }) => {
    if (!show) {
        return null;
    }
    
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-[var(--theme-green)] text-black font-bold py-2 px-4 rounded-full text-sm animate-fade-in-down shadow-lg hover:opacity-90 transition-opacity"
            aria-label="Install App"
        >
            <DownloadIcon />
            <span>Install App</span>
        </button>
    );
};
