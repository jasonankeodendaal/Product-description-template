import React, { useEffect, useState } from 'react';
import { SiteSettings } from '../../constants';
import { StorageUsage } from '../../utils/storageUtils';
import { HardDriveIcon } from '../icons/HardDriveIcon';
import { FolderSyncIcon } from '../icons/FolderSyncIcon';
import { CloudIcon } from '../icons/CloudIcon';
import { useRecharts } from '../../hooks/useRecharts';
import { Spinner } from '../icons/Spinner';
import { PhotoIcon } from '../icons/PhotoIcon';
import { RecordingIcon } from '../icons/RecordingIcon';
import { NotepadIcon } from '../icons/NotepadIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';

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
        let start = displayValue;
        const end = value;
        if (start === end) return;

        let startTime: number | null = null;
        const duration = 1000;

        const animationFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            setDisplayValue(current);
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            } else {
                setDisplayValue(end);
            }
        };
        const handle = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(handle);
    }, [value, displayValue]);

    return <span>{formatBytes(displayValue)}</span>;
};

const getSyncInfo = (syncMode: SiteSettings['syncMode'], isConnected: boolean) => {
    switch (syncMode) {
        case 'folder':
            return { icon: <FolderSyncIcon />, text: 'Local Folder Sync', details: 'Data is safe on your machine.' };
        case 'api':
            return { icon: <CloudIcon isConnected={isConnected} />, text: isConnected ? 'API Sync Active' : 'API Disconnected', details: isConnected ? 'Synced across all devices.' : 'Connection failed.' };
        default:
            return { icon: <HardDriveIcon />, text: 'Browser Storage', details: 'Data is local to this browser.' };
    }
};

const categoryIcons: { [key: string]: React.ReactNode } = {
    'Photos': <PhotoIcon className="w-4 h-4 text-purple-400" />,
    'Recordings': <RecordingIcon className="w-4 h-4 text-pink-400" />,
    'Notes': <NotepadIcon className="w-4 h-4 text-sky-400" />,
    'Calendar': <CalendarIcon className="w-4 h-4 text-emerald-400" />,
    'Logs & Templates': <ClockIcon className="w-4 h-4 text-orange-400" />,
};

export const StorageDetailsWidget: React.FC<{ storageUsage: StorageUsage, siteSettings: SiteSettings }> = ({ storageUsage, siteSettings }) => {
    const Recharts = useRecharts();
    const { total, breakdown } = storageUsage;
    const syncInfo = getSyncInfo(siteSettings.syncMode, true);
    const hasData = total > 0;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-3">
                <div className="text-emerald-400 w-8 h-8 animate-pulse-slow">{syncInfo.icon}</div>
                <div>
                    <h3 className="text-white font-bold">{syncInfo.text}</h3>
                    <p className="text-gray-400 text-xs">{syncInfo.details}</p>
                </div>
            </div>

            <div className="flex-grow my-2 flex flex-col md:flex-row items-center justify-around gap-2 overflow-hidden">
                {hasData && Recharts ? (
                    <>
                        <div className="w-full md:w-2/5 h-28 md:h-full relative">
                            <Recharts.ResponsiveContainer width="100%" height="100%">
                                <Recharts.PieChart>
                                    <Recharts.Pie data={breakdown} dataKey="bytes" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" paddingAngle={5} stroke="none">
                                        {breakdown.map((entry, index) => (
                                            <Recharts.Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Recharts.Pie>
                                </Recharts.PieChart>
                            </Recharts.ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="font-bold text-white text-lg lg:text-xl animate-pulse-slow"><AnimatedValue value={total} /></span>
                                <p className="text-gray-400 text-xs">Total Used</p>
                            </div>
                        </div>
                        <div className="w-full md:w-3/5 space-y-1.5 overflow-y-auto no-scrollbar">
                            {breakdown.map((item, index) => (
                                <div 
                                    key={item.name} 
                                    className="flex items-center gap-2 text-xs p-1 bg-white/5 rounded-md animate-list-item-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{categoryIcons[item.name]}</div>
                                    <span className="flex-grow truncate text-gray-300">{item.name}</span>
                                    <span className="font-mono text-gray-400">{formatBytes(item.bytes)}</span>
                                    <div className="w-10 text-right font-semibold" style={{ color: item.fill }}>{total > 0 ? `${Math.round((item.bytes / total) * 100)}%` : '0%'}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        {hasData && !Recharts ? <Spinner /> : 'No data stored yet.'}
                    </div>
                )}
            </div>
        </div>
    );
};