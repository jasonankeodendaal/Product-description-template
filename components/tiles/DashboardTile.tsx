
import React from 'react';
import { DashboardToolIcon } from '../icons/DashboardToolIcon';

interface DashboardTileProps {
    onOpenDashboard: () => void;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ onOpenDashboard }) => (
    <button onClick={onOpenDashboard} className="w-full h-full bg-gray-500 text-white p-3 flex flex-col justify-between items-start gap-2 hover:bg-gray-600 transition-colors">
        <div className="w-10 h-10 holographic-icon">
            <DashboardToolIcon />
        </div>
        <span className="font-bold text-sm sm:text-base text-left holographic-text">Dashboard</span>
    </button>
);