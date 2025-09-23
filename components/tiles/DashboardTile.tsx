
import React from 'react';
import { DatabaseIcon } from '../icons/DatabaseIcon';

interface DashboardTileProps {
    onOpenDashboard: () => void;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ onOpenDashboard }) => (
    <button onClick={onOpenDashboard} className="w-full h-full bg-gray-500 text-white p-4 flex flex-col justify-between hover:bg-gray-600 transition-colors">
        <DatabaseIcon />
        <span className="font-bold text-lg self-start">Dashboard</span>
    </button>
);
