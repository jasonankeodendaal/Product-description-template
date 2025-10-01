import React from 'react';
import { DashboardToolIcon } from '../icons/DashboardToolIcon';

interface DashboardTileProps {
    onOpenDashboard: () => void;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ onOpenDashboard }) => (
    <button onClick={onOpenDashboard} className="w-full h-full bg-gradient-to-br from-gray-600/90 to-black/60 text-white p-4 flex flex-col justify-center items-center text-center gap-2 hover:from-gray-500/90 hover:to-black/50 transition-all">
        <div className="w-12 h-12 holographic-icon">
            <DashboardToolIcon />
        </div>
        <span className="font-bold text-lg text-left text-white">Dashboard</span>
    </button>
);
