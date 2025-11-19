
import React from 'react';
import { SiteSettings } from '../../constants';
import { HardDriveIcon } from '../icons/HardDriveIcon';
import { FolderSyncIcon } from '../icons/FolderSyncIcon';
import { CloudIcon } from '../icons/CloudIcon';
import { Spinner } from '../icons/Spinner';
import { useRecharts } from '../../hooks/useRecharts';

interface StorageWidgetProps {
    siteSettings: SiteSettings;
    itemCounts: {
        notes: number;
        photos: number;
        recordings: number;
    };
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({ siteSettings, itemCounts }) => {
    const { lib: Recharts, loading, error } = useRecharts();

    const totalItems = itemCounts.notes + itemCounts.photos + itemCounts.recordings;
    const storageCap = 500; // Arbitrary cap for progress visualization
    const progress = Math.min((totalItems / storageCap) * 100, 100);

    const getSyncInfo = () => {
        switch (siteSettings.syncMode) {
            case 'folder':
                return { icon: <FolderSyncIcon />, text: 'Local Folder Sync', details: 'Data is safe on your machine.' };
            case 'api':
                return { icon: <CloudIcon isConnected={true} />, text: 'API Sync Active', details: 'Synced across all devices.' };
            default:
                return { icon: <HardDriveIcon />, text: 'Browser Storage', details: 'Data is local to this browser.' };
        }
    };
    
    const syncInfo = getSyncInfo();

    const chartData = [
        { name: 'Notes', count: itemCounts.notes, fill: '#38bdf8' },
        { name: 'Photos', count: itemCounts.photos, fill: '#a78bfa' },
        { name: 'Records', count: itemCounts.recordings, fill: '#f472b6' },
    ];

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col">
            <div className="flex items-center gap-3">
                <div className="text-emerald-400">{syncInfo.icon}</div>
                <div>
                    <h3 className="text-white font-bold">{syncInfo.text}</h3>
                    <p className="text-gray-400 text-xs">{syncInfo.details}</p>
                </div>
            </div>
            <div className="flex-grow my-2 h-16">
                {loading || error || !Recharts ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                        {loading ? 'Loading chart...' : 'Chart failed.'}
                    </div>
                ) : (
                    <Recharts.ResponsiveContainer width="100%" height="100%">
                         <Recharts.BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                            <Recharts.XAxis type="number" hide />
                            <Recharts.YAxis type="category" dataKey="name" hide />
                            <Recharts.Tooltip 
                                cursor={false}
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }}
                            />
                            <Recharts.Bar dataKey="count" barSize={15} radius={[0, 5, 5, 0]} />
                        </Recharts.BarChart>
                    </Recharts.ResponsiveContainer>
                )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{totalItems} Items</span>
                <span>{storageCap} Item Capacity</span>
            </div>
        </div>
    );
};
