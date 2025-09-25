
import React from 'react';
import { LogoutToolIcon } from '../icons/LogoutToolIcon';

interface LogoutTileProps {
    onLogout: () => void;
}

export const LogoutTile: React.FC<LogoutTileProps> = ({ onLogout }) => (
    <button onClick={onLogout} className="w-full h-full bg-red-600 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-red-700 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <LogoutToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base holographic-text">Logout</span>
    </button>
);