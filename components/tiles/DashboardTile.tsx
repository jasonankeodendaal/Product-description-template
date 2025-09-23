import React from 'react';
import { DatabaseIcon } from '../icons/DatabaseIcon';

interface DashboardTileProps {
    onOpenDashboard: () => void;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({ onOpenDashboard }) => (
    <button onClick={onOpenDashboard} className="w-full h-full bg-gray-500 text-white p-4 flex flex-col justify-start items-start gap-4 hover:bg-gray-600 transition-colors">
        <DatabaseIcon className="w-7 h-7" />
        <span className="font-bold text-lg">Dashboard</span>
    </button>
);