
import React from 'react';
import { useRecharts } from '../../hooks/useRecharts';
import { Spinner } from '../icons/Spinner';
import { StorageUsage } from '../../utils/storageUtils';

interface StorageBreakdownWidgetProps {
    storageUsage: StorageUsage;
}

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const StorageBreakdownWidget: React.FC<StorageBreakdownWidgetProps> = ({ storageUsage }) => {
    const Recharts = useRecharts();

    if (!Recharts) {
        return (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col items-center justify-center">
                <Spinner />
                <p className="text-white/70 mt-2 text-sm">Loading chart...</p>
            </div>
        );
    }

    const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } = Recharts;
    const { total, breakdown } = storageUsage;
    const hasData = total > 0;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col">
            <h3 className="text-white font-bold text-base mb-1">Storage</h3>
            <div className="flex-grow flex flex-col items-center justify-center gap-2">
                <div className="w-full h-16">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    innerRadius="60%"
                                    outerRadius="100%"
                                    paddingAngle={2}
                                    dataKey="bytes"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [formatBytes(value), 'Size']}
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No data stored.</div>
                    )}
                </div>
                <div className="w-full text-center">
                    <span className="font-bold text-white text-lg">{formatBytes(total)}</span>
                    <span className="text-gray-400 text-sm"> Total Used</span>
                </div>
            </div>
        </div>
    );
};