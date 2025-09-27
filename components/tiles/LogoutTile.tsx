import React from 'react';
import { LogoutToolIcon } from '../icons/LogoutToolIcon';

interface LogoutTileProps {
    onLogout: () => void;
}

export const LogoutTile: React.FC<LogoutTileProps> = ({ onLogout }) => (
    <button onClick={onLogout} className="w-full h-full bg-gradient-to-br from-red-700/90 to-black/60 text-white p-2 sm:p-3 flex flex-col justify-between items-start gap-1 sm:gap-2 hover:from-red-600/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-10 sm:h-10 holographic-icon">
            <LogoutToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-white">Logout</span>
    </button>
);
