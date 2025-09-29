import React, { useState, useEffect, useMemo } from 'react';
import { createBackup } from '../utils/dataUtils';
import { Template, Recording, Photo, Note, NoteRecording, LogEntry, CalendarEvent, Video } from '../App';
import { DownloadIcon } from './icons/DownloadIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { SiteSettings } from '../constants';
import { CloudIcon } from './icons/CloudIcon';
import { Spinner } from './icons/Spinner';
import { ClockIcon } from './icons/ClockIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CodeIcon } from './icons/CodeIcon';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';
import { DropboxIcon } from './icons/DropboxIcon';

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
    googleDriveStatus: { connected: boolean, email?: string };
    onGoogleDriveConnect: () => void;
    onGoogleDriveDisconnect: () => void;
}

type DataManagementTab = 'sync' | 'backup' | 'api' | 'danger';

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

const SectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, description, icon, children }) => (
    <div className="bg-white/5 p-6 rounded-lg border border-[var(--theme-border)]/50">
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex-shrink-0 text-orange-400">{icon}</div>
            <div>
                <h4 className="text-lg font-bold text-white">{title}</h4>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
        </div>
        <div className="mt-4 pl-12">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }> = 
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
        siteSettings, onUpdateSettings, onApiConnect, onApiDisconnect, isApiConnecting, isApiConnected,
        googleDriveStatus, onGoogleDriveConnect, onGoogleDriveDisconnect
    } = props;
    
    const [activeTab, setActiveTab] = useState<DataManagementTab>('sync');
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [restoreError, setRestoreError] = useState('');
    
    const [apiSettings, setApiSettings] = useState({
        customApiEndpoint: siteSettings.customApiEndpoint || '',
        customApiAuthKey: siteSettings.customApiAuthKey || '',
    });

    const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setApiSettings(prev => ({ ...prev, [id]: value }));
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

    const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                setRestoreFile(file);
                setRestoreError('');
                if (window.confirm("Are you sure you want to restore from this backup? All current data will be overwritten and the local sync folder will be disconnected.")) {
                    onRestore(file);
                }
            } else {
                setRestoreError('Invalid file type. Please select a .zip backup file.');
                setRestoreFile(null);
            }
        }
        if (e.target) e.target.value = '';
    };

    const handleCreateBackup = async () => {
        try {
            // FIX: Added the missing 'videos' argument to the function call.
            await createBackup(siteSettings, templates, recordings, photos, videos, notes, noteRecordings, logEntries, calendarEvents);
        } catch (error) {
            alert(`Failed to create backup: ${error instanceof Error ? error.message : "An unknown error occurred"}`);
        }
    }

    const dataSummary = useMemo(() => [
        { icon: <TemplateIcon />, name: 'Templates', count: templates.length },
        { icon: <RecordingIcon />, name: 'Recordings', count: recordings.length },
        { icon: <PhotoIcon />, name: 'Photos', count: photos.length },
        { icon: <NotepadIcon />, name: 'Notes', count: notes.length },
        { icon: <ClockIcon />, name: 'Log Entries', count: logEntries.length },
        { icon: <CalendarIcon />, name: 'Events', count: calendarEvents.length },
    ], [templates, recordings, photos, notes, logEntries, calendarEvents]);


    const renderTabContent = () => {
        const contentKey = activeTab; // Key for re-rendering with animation
        const commonClasses = "space-y-6 animate-fade-in-down";
        switch (activeTab) {
            case 'sync': return (
                <div key={contentKey} className={commonClasses}>
                     <SectionCard title="Browser Storage (Default)" description="Data is saved privately in this browser. Fast, simple, and works offline." icon={<HardDriveIcon />}>
                        <p className="text-sm text-gray-400">This is the default mode. No setup required. Ideal for single-device use.</p>
                    </SectionCard>
                    <SectionCard title="Cloud Sync" description="Connect to cloud services to sync your data across all devices, including mobile and tablets." icon={<CloudIcon isConnected={googleDriveStatus.connected} />}>
                        <div className="space-y-4">
                            {/* Google Drive */}
                            <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                                <GoogleDriveIcon />
                                <div className="flex-grow">
                                    <h5 className="font-semibold text-white">Google Drive</h5>
                                    {googleDriveStatus.connected ? (
                                         <p className="text-xs text-gray-400 truncate">Connected as: {googleDriveStatus.email}</p>
                                    ) : (
                                         <p className="text-xs text-gray-400">Syncs data to a private app folder.</p>
                                    )}
                                </div>
                                {googleDriveStatus.connected ? (
                                    <button onClick={onGoogleDriveDisconnect} className="text-sm font-semibold text-gray-400 hover:text-white flex-shrink-0">Disconnect</button>
                                ) : (
                                    <button onClick={onGoogleDriveConnect} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm flex-shrink-0">Connect</button>
                                )}
                            </div>
                            {/* Dropbox */}
                             <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg opacity-60">
                                <DropboxIcon />
                                <div className="flex-grow">
                                    <h5 className="font-semibold text-white">Dropbox</h5>
                                    <p className="text-xs text-gray-400">Integration coming soon!</p>
                                </div>
                                <button disabled className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg text-sm flex-shrink-0 cursor-not-allowed">Connect</button>
                            </div>
                        </div>
                    </SectionCard>
                     <SectionCard title="Local Folder Sync (Desktop Only)" description="Saves data to a folder on your computer. Great for local backups and use with desktop-based cloud clients." icon={<FolderSyncIcon />}>
                        <div className="flex flex-col gap-4">
                            {directoryHandle ? (
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-semibold text-green-400">Connected to: <span className="font-mono bg-black/30 px-2 py-1 rounded">{directoryHandle.name}</span></p>
                                    <button onClick={onDisconnectDirectory} className="text-sm font-semibold text-gray-400 hover:text-white">Disconnect</button>
                                </div>
                            ) : (
                                <button onClick={onSyncDirectory} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 self-start">
                                    <FolderIcon /> Connect to Folder...
                                </button>
                            )}
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
            );
            case 'api': return (
                 <div key={contentKey} className={commonClasses}>
                    <SectionCard title="Backend & API Settings" description="Configure your API Key for AI features and an optional custom sync server." icon={<CodeIcon />}>
                         <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-orange-400 mb-1">Authentication Key (Required)</h4>
                                <p className="text-sm text-gray-400 mb-3">To fix <strong className="text-red-400">'Unauthorized'</strong> errors, provide the secret key configured on your server (e.g., Vercel `API_SECRET_KEY`).</p>
                                <InputField 
                                    id="customApiAuthKey" 
                                    label="Auth Key" 
                                    value={apiSettings.customApiAuthKey} 
                                    onChange={handleApiSettingsChange} 
                                    placeholder="Paste your secret key" 
                                    type="password"
                                />
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="font-semibold text-orange-400 mb-1">Custom API Server (Advanced)</h4>
                                <p className="text-sm text-gray-400 mb-3">For team sync, enter your custom API URL. Leave blank for standard Vercel use with Google Drive sync.</p>
                                <div className="flex items-end gap-4">
                                    <div className="flex-grow">
                                        <InputField 
                                            id="customApiEndpoint" 
                                            label="Custom API URL" 
                                            value={apiSettings.customApiEndpoint} 
                                            onChange={handleApiSettingsChange} 
                                            placeholder="e.g., https://my-sync-server.com" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleConnectClick} 
                                        disabled={isApiConnecting || !apiSettings.customApiEndpoint || !apiSettings.customApiAuthKey} 
                                        className="bg-orange-500 hover:bg-orange-600 text-black font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed h-11 flex-shrink-0 min-w-[140px]"
                                    >
                                    {isApiConnecting ? <><Spinner /> Connecting...</> : 'Connect'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-white/10">
                                <button onClick={handleApiSettingsSave} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg text-sm">Save Settings</button>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            );
            case 'danger': return (
                <div key={contentKey} className={commonClasses}>
                    <SectionCard title="Clear All Local Data" description="Permanently delete all data from your browser. This action cannot be undone." icon={<TrashIcon />}>
                        <button onClick={onClearLocalData} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 flex-shrink-0">
                            Clear Browser Data
                        </button>
                    </SectionCard>
                </div>
            );
            default: return null;
        }
    }

    return (
        <div className="flex flex-col h-full">
            <nav className="flex-shrink-0 px-4 pt-4 border-b border-white/10">
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-3">
                    <TabButton title="Sync & Cloud" isActive={activeTab === 'sync'} onClick={() => setActiveTab('sync')} />
                    <TabButton title="Backup & Restore" isActive={activeTab === 'backup'} onClick={() => setActiveTab('backup')} />
                    <TabButton title="API Settings" isActive={activeTab === 'api'} onClick={() => setActiveTab('api')} />
                    <TabButton title="Danger Zone" isActive={activeTab === 'danger'} onClick={() => setActiveTab('danger')} />
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                {renderTabContent()}
            </main>
        </div>
    );
};
