import React, { useState, useEffect } from 'react';
import { createBackup } from '../utils/dataUtils';
import { Template, Recording, Photo, Note, NoteRecording, LogEntry, CalendarEvent, Video } from '../src/types';
import { DownloadIcon } from './icons/DownloadIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { SiteSettings } from '../constants';
import { Spinner } from './icons/Spinner';
import { CodeIcon } from './icons/CodeIcon';
import { ServerIcon } from './icons/ServerIcon';

interface DataManagementProps {
    templates: Template[];
    recordings: Recording[];
    photos: Photo[];
    videos: Video[];
    notes: Note[];
    noteRecordings: NoteRecording[];
    logEntries: LogEntry[];
    calendarEvents: CalendarEvent[];
    onRestore: (data: File) => void;
    directoryHandle: FileSystemDirectoryHandle | null;
    onClearLocalData: () => void;
    onSyncDirectory: () => void;
    onDisconnectDirectory: () => void;
    siteSettings: SiteSettings;
    onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
    onApiConnect: (apiUrl: string, apiKey: string) => Promise<void>;
    onApiDisconnect: () => void;
    isApiConnecting: boolean;
    isApiConnected: boolean;
}

type DataManagementTab = 'sync' | 'backup' | 'api' | 'ftp' | 'danger';

const TabButton: React.FC<{
    title: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
            isActive
                ? 'bg-orange-500 text-black shadow-lg'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
        {title}
    </button>
);

const SectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode; badge?: string; }> = ({ title, description, icon, children, badge }) => (
    <div className="bg-white/5 p-6 rounded-lg border border-[var(--theme-border)]/50">
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 flex-shrink-0 text-orange-400">{icon}</div>
                <div>
                    <h4 className="text-lg font-bold text-white">{title}</h4>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>
            {badge && <span className="text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">{badge}</span>}
        </div>
        <div className="mt-4 pl-12">
            {children}
        </div>
    </div>
);

const Alert: React.FC<{ type: 'info' | 'warning' | 'tip', children: React.ReactNode }> = ({ type, children }) => {
    const colors = {
        info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        tip: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    }
    return (
        <div className={`p-4 rounded-lg border ${colors[type]}`}>
            <p className="text-sm">{children}</p>
        </div>
    )
};


const InputField: React.FC<{ label: string; id: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }> = 
    ({ label, id, value, onChange, placeholder, type="text" }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 transition-shadow duration-200 h-11"
        />
    </div>
);

export const DataManagement: React.FC<DataManagementProps> = (props) => {
    const {
        templates, recordings, photos, videos, notes, noteRecordings, logEntries, calendarEvents,
        onRestore, directoryHandle, onClearLocalData, onSyncDirectory, onDisconnectDirectory,
        siteSettings, onUpdateSettings, onApiConnect, onApiDisconnect, isApiConnecting, isApiConnected
    } = props;
    
    const [activeTab, setActiveTab] = useState<DataManagementTab>('sync');
    const [restoreError, setRestoreError] = useState('');
    
    const [apiSettings, setApiSettings] = useState({
        customApiEndpoint: siteSettings.customApiEndpoint || '',
        customApiAuthKey: siteSettings.customApiAuthKey || '',
    });

    const [ftpSettings, setFtpSettings] = useState({
        ftpHost: siteSettings.ftpHost || '',
        ftpPort: siteSettings.ftpPort || 21,
        ftpUser: siteSettings.ftpUser || '',
        ftpPassword: siteSettings.ftpPassword || '',
        ftpPath: siteSettings.ftpPath || '/',
        ftpProtocol: siteSettings.ftpProtocol || 'ftp',
    });

    useEffect(() => {
        setFtpSettings({
            ftpHost: siteSettings.ftpHost || '',
            ftpPort: siteSettings.ftpPort || 21,
            ftpUser: siteSettings.ftpUser || '',
            ftpPassword: siteSettings.ftpPassword || '',
            ftpPath: siteSettings.ftpPath || '/',
            ftpProtocol: siteSettings.ftpProtocol || 'ftp',
        });
        setApiSettings({
            customApiEndpoint: siteSettings.customApiEndpoint || '',
            customApiAuthKey: siteSettings.customApiAuthKey || '',
        });
    }, [siteSettings]);


    const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setApiSettings(prev => ({ ...prev, [id]: value }));
    };
    
    const handleFtpSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFtpSettings(prev => ({ ...prev, [id]: id === 'ftpPort' ? parseInt(value, 10) : value }));
    };

    const handleApiSettingsSave = async () => {
        await onUpdateSettings({ 
            ...siteSettings, 
            customApiEndpoint: apiSettings.customApiEndpoint,
            customApiAuthKey: apiSettings.customApiAuthKey
        });
        alert("Settings saved. You can now try connecting to the API server.");
    };

    const handleConnectClick = () => {
        if (apiSettings.customApiEndpoint && apiSettings.customApiAuthKey) {
            onApiConnect(apiSettings.customApiEndpoint, apiSettings.customApiAuthKey);
        } else {
            alert("Please enter both an API URL and an Auth Key to connect.");
        }
    };
    
    const handleSaveFtpSettings = async (setActive: boolean = false) => {
        const newSettings = { ...siteSettings, ...ftpSettings };
        if (setActive) {
            newSettings.syncMode = 'ftp';
        }
        await onUpdateSettings(newSettings);
        alert(setActive ? "FTP set as active sync method." : "FTP settings saved.");
    };

    const handleDisconnectFtp = async () => {
        await onUpdateSettings({ ...siteSettings, syncMode: 'local' });
        alert("Disconnected from FTP. Sync mode set back to Local Browser.");
    };


    const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                setRestoreError('');
                if (window.confirm("Are you sure you want to restore from this backup? All current data will be overwritten and the local sync folder will be disconnected.")) {
                    onRestore(file);
                }
            } else {
                setRestoreError('Invalid file type. Please select a .zip backup file.');
            }
        }
        if (e.target) e.target.value = '';
    };

    const handleCreateBackup = async () => {
        try {
            await createBackup(siteSettings, templates, recordings, photos, videos, notes, noteRecordings, logEntries, calendarEvents);
        } catch (error) {
            alert(`Failed to create backup: ${error instanceof Error ? error.message : "An unknown error occurred"}`);
        }
    }

    const renderTabContent = () => {
        const contentKey = activeTab; // Key for re-rendering with animation
        const commonClasses = "space-y-6 animate-fade-in-down";
        switch (activeTab) {
            case 'sync': return (
                <div key={contentKey} className={commonClasses}>
                     <SectionCard title="Browser Storage (Default)" description="Data is saved privately in this browser. Fast, simple, and works offline." icon={<HardDriveIcon />}>
                        <p className="text-sm text-gray-400">This is the default mode. No setup required. Ideal for single-device use.</p>
                    </SectionCard>
                    <SectionCard title="Local Folder Sync" description="Saves data to a folder on your device. Great for local backups and use with cloud clients." icon={<FolderSyncIcon />}>
                        <div className="flex flex-col gap-4">
                            {directoryHandle ? (
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-semibold text-green-400">Connected to: <span className="font-mono bg-black/30 px-2 py-1 rounded">{directoryHandle.name}</span></p>
                                    <button onClick={onDisconnectDirectory} className="text-sm font-semibold text-gray-400 hover:text-white">Disconnect</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={onSyncDirectory}
                                    title="Connect to a folder on your device. Note: This feature is not supported on all mobile browsers (e.g., Safari on iOS)."
                                    className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 self-start disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FolderIcon /> Connect to Folder...
                                </button>
                            )}
                             <Alert type="tip">
                                On mobile, this feature is available on browsers like Chrome for Android. It is not available on iOS.
                            </Alert>
                        </div>
                    </SectionCard>
                </div>
            );
            case 'backup': return (
                 <div key={contentKey} className={commonClasses}>
                    <SectionCard title="Download Full Backup" description="Save all app data (notes, photos, recordings, settings) to a single portable .zip file." icon={<DownloadIcon />}>
                        <button onClick={handleCreateBackup} className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2">
                            Download Backup
                        </button>
                    </SectionCard>
                     <SectionCard title="Restore from Backup" description="This will overwrite all current data in the app. This action cannot be undone." icon={<RestoreIcon />}>
                        <label htmlFor="restore-upload" className="cursor-pointer bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2">
                            Choose Backup File...
                        </label>
                        <input id="restore-upload" type="file" className="sr-only" onChange={handleRestoreFileSelect} accept=".zip" />
                        {restoreError && <p className="text-red-400 text-sm mt-2">{restoreError}</p>}
                    </SectionCard>
                </div>
