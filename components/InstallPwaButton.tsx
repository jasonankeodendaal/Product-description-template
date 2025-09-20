import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface InstallPwaButtonProps {
    onInstall: () => void;
}

export const InstallPwaButton: React.FC<InstallPwaButtonProps> = ({ onInstall }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-bottom">
            <button
                onClick={onInstall}
                className="flex items-center gap-3 bg-[var(--theme-green)] text-black font-bold py-3 px-5 rounded-full shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200"
                aria-label="Install App"
            >
                <DownloadIcon />
                <span>Install App</span>
            </button>
        </div>
    );
};
