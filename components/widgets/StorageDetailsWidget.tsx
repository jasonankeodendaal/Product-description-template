import React, { useEffect, useState } from 'react';
import { SiteSettings } from '../../constants';
import { StorageUsage } from '../../utils/storageUtils';
import { HardDriveIcon } from '../icons/HardDriveIcon';
import { FolderSyncIcon } from '../icons/FolderSyncIcon';
import { CloudIcon } from '../icons/CloudIcon';

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
    }, [value]);

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

export const StorageDetailsWidget: React.FC<{ storageUsage: StorageUsage, siteSettings: SiteSettings }> = ({ storageUsage, siteSettings }) => {
    const { total, breakdown } = storageUsage;
    // Assuming API is connected if mode is API, as we don't have the live status here. This is a display component.
    const syncInfo = getSyncInfo(siteSettings.syncMode, true);

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <div className="text-emerald-400 w-8 h-8 animate-[hologram-pulse_4s_ease-in-out_infinite]">{syncInfo.icon}</div>
                    <div>
                        <h3 className="text-white font-bold">{syncInfo.text}</h3>
                        <p className="text-gray-400 text-xs">{syncInfo.details}</p>
                    </div>
                </div>
            </div>

            <div className="my-2">
                <div className="text-center">
                    <span className="font-bold text-white text-3xl"><AnimatedValue value={total} /></span>
                    <p className="text-gray-400 text-sm">Total Storage Used</p>
                </div>
            </div>

            <div className="space-y-1 text-xs text-gray-300 overflow-y-auto no-scrollbar max-h-24">
                {breakdown.length > 0 ? breakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}></div>
                        <span className="flex-grow font-medium">{item.name}</span>
                        <span className="font-mono text-gray-400">{item.count} items</span>
                        <span className="font-mono w-20 text-right">{formatBytes(item.bytes)}</span>
                    </div>
                )) : (
                     <p className="text-center text-gray-500 py-4">No data stored yet.</p>
                )}
            </div>
        </div>
    );
};