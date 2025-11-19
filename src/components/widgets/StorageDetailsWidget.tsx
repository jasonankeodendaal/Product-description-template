
import React, { useEffect, useState } from 'react';
import { SiteSettings } from '../../constants';
import { StorageUsage } from '../../types';
import { 
    HardDriveIcon, 
    FolderSyncIcon, 
    CloudIcon, 
    PhotoIcon, 
    RecordingIcon, 
    NotepadIcon, 
    CalendarIcon, 
    ClockIcon 
} from '../icons';

const formatBytes = (bytes: number, decimals = 1): string => {
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
            return { icon: <FolderSyncIcon />, text: 'Local Folder Sync' };
        case 'api':
            return { icon: <CloudIcon isConnected={isConnected} />, text: isConnected ? 'API Sync Active' : 'API Disconnected' };
        default:
            return { icon: <HardDriveIcon />, text: 'Browser Storage' };
    }
};

const categoryIcons: { [key: string]: React.ReactNode } = {
    'Photos': <PhotoIcon className="w-3 h-3 text-purple-400" />,
    'Recordings': <RecordingIcon className="w-3 h-3 text-pink-400" />,
    'Notes': <NotepadIcon className="w-3 h-3 text-sky-400" />,
    'Calendar': <CalendarIcon className="w-3 h-3 text-emerald-400" />,
    'Logs & Templates': <ClockIcon className="w-3 h-3 text-orange-400" />,
};

export const StorageDetailsWidget: React.FC<{ storageUsage: StorageUsage, siteSettings: SiteSettings }> = ({ storageUsage, siteSettings }) => {
    const { total, breakdown } = storageUsage;
    const syncInfo = getSyncInfo(siteSettings.syncMode, true);
    const hasData = total > 0;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-2">
                <div className="text-orange-400 w-5 h-5 animate-pulse-slow">{syncInfo.icon}</div>
                <div>
                    <h3 className="text-white font-bold text-xs">{syncInfo.text}</h3>
                </div>
            </div>

            <div className="flex-grow my-1 flex flex-col md:flex-row items-center justify-around gap-2 overflow-hidden">
                {!hasData ? (
                     <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No data stored yet.</div>
                ) : (
                    <>
                         <div className="w-full h-full flex flex-col justify-center items-center">
                             <div className="text-center">
                                <span className="font-bold text-white text-2xl md:text-3xl animate-pulse-slow"><AnimatedValue value={total} /></span>
                                <p className="text-gray-400 text-sm"> Total Used</p>
                            </div>
                            <div className="w-full space-y-0.5 overflow-y-auto no-scrollbar mt-2 px-1">
                                {breakdown.map((item, index) => (
                                    <div 
                                        key={item.name} 
                                        className="flex items-center gap-1.5 text-[10px] py-0.5 px-1 bg-white/5 rounded-md animate-list-item-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center">{categoryIcons[item.name]}</div>
                                        <span className="flex-grow truncate text-gray-300">{item.name}</span>
                                        <span className="font-mono text-gray-400 text-[9px]">{formatBytes(item.bytes)}</span>
                                        <div className="w-8 text-right font-semibold" style={{ color: item.fill }}>{total > 0 ? `${Math.round((item.bytes / total) * 100)}%` : '0%'}</div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </>
                )}
            </div>
        </div>
    );
};
