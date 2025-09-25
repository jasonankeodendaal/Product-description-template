import React from 'react';
import { LogoutToolIcon } from '../icons/LogoutToolIcon';

interface LogoutTileProps {
    onLogout: () => void;
}

export const LogoutTile: React.FC<LogoutTileProps> = ({ onLogout }) => (
    <button onClick={onLogout} className="w-full h-full bg-gradient-to-br from-red-700/90 to-black/60 text-white p-3 flex flex-col justify-between items-start gap-2 hover:from-red-600/90 hover:to-black/50 transition-all">
        <div className="w-10 h-10 holographic-icon">
            <LogoutToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-white">Logout</span>
    </button>
);