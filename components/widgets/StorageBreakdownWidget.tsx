import React, { useState, useEffect } from 'react';
import { StorageUsage } from '../../utils/storageUtils';
import { SiteSettings } from '../../constants';
import { HardDriveIcon } from '../icons/HardDriveIcon';
import { FolderSyncIcon } from '../icons/FolderSyncIcon';
import { CloudIcon } from '../icons/CloudIcon';

interface StorageBreakdownWidgetProps {
    storageUsage: StorageUsage;
    siteSettings: SiteSettings;
    isApiConnected: boolean;
}

const formatBytes = (bytes: number, decimals = 1): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getSyncInfo = (syncMode: SiteSettings['syncMode'], isConnected: boolean) => {
    switch (syncMode) {
        case 'folder':
            return { icon: <FolderSyncIcon />, text: 'Local Folder', color: 'text-green-400' };
        case 'api':
            return { icon: <CloudIcon isConnected={isConnected} />, text: isConnected ? 'API Sync' : 'API Offline', color: isConnected ? 'text-green-400' : 'text-yellow-400' };
        default:
            return { icon: <HardDriveIcon />, text: 'Browser Storage', color: 'text-sky-400' };
    }
};

export const StorageBreakdownWidget: React.FC<StorageBreakdownWidgetProps> = ({ storageUsage, siteSettings, isApiConnected }) => {
    const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);

    useEffect(() => {
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                setStorageEstimate({
                    usage: estimate.usage || 0,
                    quota: estimate.quota || 0,
                });
            });
        }
    }, []);

    const { total: appUsage, breakdown } = storageUsage;
    const syncInfo = getSyncInfo(siteSettings.syncMode, isApiConnected);

    const usagePercent = storageEstimate && storageEstimate.quota > 0
        ? (storageEstimate.usage / storageEstimate.quota) * 100
        : 0;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (usagePercent / 100) * circumference;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div className="flex justify-between items-start flex-shrink-0">
                <h3 className="text-white font-bold text-sm">Storage</h3>
                <div className={`flex items-center gap-2 text-xs font-semibold ${syncInfo.color}`}>
                    {syncInfo.icon}
                    <span className="hidden sm:inline">{syncInfo.text}</span>
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center my-1 sm:my-2">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                        <circle
                            className="text-gray-700"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="60"
                            cy="60"
                        />
                        <circle
                            className="text-orange-500"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="60"
                            cy="60"
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{`${Math.round(usagePercent)}%`}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">Quota</span>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 space-y-1">
                <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-300">
                        App Data: <span className="text-white font-bold">{formatBytes(appUsage)}</span>
                    </p>
                    {storageEstimate && (
                         <p className="text-[9px] sm:text-[10px] text-gray-400">
                            Browser: {formatBytes(storageEstimate.usage)} / {formatBytes(storageEstimate.quota)}
                        </p>
                    )}
                </div>
                {breakdown.length > 0 && appUsage > 0 && (
                    <div className="w-full bg-black/20 rounded-full h-1.5 flex overflow-hidden">
                        {breakdown.map(item => (
                            <div
                                key={item.name}
                                className="h-full"
                                style={{ width: `${(item.bytes / appUsage) * 100}%`, backgroundColor: item.fill }}
                                title={`${item.name}: ${formatBytes(item.bytes)}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};