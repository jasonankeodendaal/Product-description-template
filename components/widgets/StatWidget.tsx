import React from 'react';

interface StatWidgetProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({ title, value, icon, color }) => {
    return (
        <div className={`bg-gradient-to-br ${color} rounded-xl p-4 flex flex-col justify-between shadow-lg border border-white/10`}>
            <div className="flex justify-between items-start">
                <h3 className="text-white font-bold">{title}</h3>
                <div className="w-10 h-10 opacity-80">{icon}</div>
            </div>
            <p className="text-4xl font-bold text-white text-right">{value}</p>
        </div>
    );
};
