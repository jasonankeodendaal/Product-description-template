import React, { useEffect, useState } from 'react';
import { useRecharts } from '../../hooks/useRecharts';
import { Spinner } from '../icons/Spinner';
import { StorageUsage } from '../../utils/storageUtils';

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AnimatedValue: React.FC<{ value: number }> = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        let startTime: number | null = null;
        const duration = 1000; // 1 second animation

        const animationFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            setDisplayValue(current);
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            } else {
                setDisplayValue(end); // Ensure it ends on the exact value
            }
        };
        const handle = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(handle);
    }, [value]);

    return <span>{formatBytes(displayValue)}</span>;
};


interface StorageBreakdownWidgetProps {
    storageUsage: StorageUsage;
}

export const StorageBreakdownWidget: React.FC<StorageBreakdownWidgetProps> = ({ storageUsage }) => {
    // FIX: The useRecharts hook returns a status object. Destructure its properties.
    const { lib: Recharts, loading, error } = useRecharts();

    // FIX: Check loading, error, and library existence before attempting to render the chart.
    if (loading || error || !Recharts) {
        return (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col items-center justify-center">
                <Spinner />
                <p className="text-white/70 mt-2 text-sm">{loading ? 'Loading chart...' : 'Chart failed to load.'}</p>
            </div>
        );
    }

    // FIX: Destructure chart components from the loaded library object.
    const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } = Recharts;
    const { total, breakdown } = storageUsage;
    const hasData = total > 0;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-2">Storage Breakdown</h3>
            <div className="flex-grow flex flex-col md:flex-row items-center justify-around gap-4">
                {hasData ? (
                    <>
                        <div className="w-full md:w-1/2 h-28">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={breakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        innerRadius="60%"
                                        outerRadius="100%"
                                        paddingAngle={3}
                                        dataKey="bytes"
                                        nameKey="name"
                                        stroke="none"
                                        isAnimationActive={true}
                                        animationDuration={800}
                                    >
                                        {breakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number, name: string, props) => [formatBytes(value), `${props.payload.name} (${props.payload.count})`]}
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-2">
                            <div className="text-center md:text-left">
                                <span className="font-bold text-white text-2xl"><AnimatedValue value={total} /></span>
                                <p className="text-gray-400 text-sm"> Total Used</p>
                            </div>
                            <div className="text-xs text-gray-300 space-y-1">
                                {breakdown.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}></div>
                                        <span className="flex-grow truncate">{item.name} ({item.count})</span>
                                        <span className="font-mono flex-shrink-0">{formatBytes(item.bytes)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No data stored yet.</div>
                )}
            </div>
        </div>
    );
};