import React from 'react';
import { LogoutToolIcon } from '../icons/LogoutToolIcon';

interface LogoutTileProps {
    onLogout: () => void;
}

export const LogoutTile: React.FC<LogoutTileProps> = ({ onLogout }) => (
    <button onClick={onLogout} className="w-full h-full bg-gradient-to-br from-red-700/90 to-black/60 text-white p-4 flex flex-col justify-center items-center text-center gap-2 hover:from-red-600/90 hover:to-black/50 transition-all">
        <div className="w-12 h-12 holographic-icon">
            <LogoutToolIcon />
        </div>
        <span className="font-bold text-lg text-white">Logout</span>
    </button>
);
