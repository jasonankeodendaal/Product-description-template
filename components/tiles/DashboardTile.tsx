import React from 'react';
import { DashboardToolIcon } from '../icons/DashboardToolIcon';

interface DashboardTileProps {
    onOpenDashboard: () => void;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ onOpenDashboard }) => (
    <button onClick={onOpenDashboard} className="w-full h-full bg-gradient-to-br from-gray-600/90 to-black/60 text-white p-3 flex flex-col justify-between items-start gap-2 hover:from-gray-500/90 hover:to-black/50 transition-all">
        <div className="w-10 h-10 holographic-icon">
            <DashboardToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-left text-white">Dashboard</span>
    </button>
);