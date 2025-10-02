import React from 'react';
import { DashboardToolIcon } from '../icons/DashboardToolIcon';

interface DashboardTileProps {
    onOpenDashboard: () => void;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ onOpenDashboard }) => (
    <button onClick={onOpenDashboard} className="w-full h-full bg-gradient-to-br from-gray-600/90 to-black/60 text-white p-2 sm:p-4 flex flex-col justify-center items-center text-center gap-1 sm:gap-2 hover:from-gray-500/90 hover:to-black/50 transition-all">
        <div className="w-8 h-8 sm:w-12 sm:h-12 holographic-icon">
            <DashboardToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-lg text-white">Dashboard</span>
    </button>
);