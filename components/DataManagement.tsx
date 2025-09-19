import React, { useState } from 'react';
import { Template, Recording, Photo, Note } from '../App';
import { DownloadIcon } from './icons/DownloadIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { XIcon } from './icons/XIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { SiteSettings } from '../constants';
import { CloudIcon } from './icons/CloudIcon';

interface DataManagementProps {
    templates: Template[];
    recordings: Recording[];
    photos: Photo[];
    notes: Note[];
    onBackup: () => void;
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

const InfoCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[var(--theme-card-bg)]/50 p-6 rounded-lg border border-[var(--theme-border)]/50 ${className}`}>
        {children}
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">{children}</h3>
);

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }> = 
    ({ label, id, value, onChange, placeholder, type="text" }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-yellow)] transition-shadow duration-200 h-[42px]"
        />
    </div>
);


export const DataManagement: React.FC<DataManagementProps> = ({
    templates,
    recordings,
    photos,
    notes,
    onBackup,
    onRestore,
    directoryHandle,
    onClearLocalData,
    onSyncDirectory,
    onDisconnectDirectory,
    siteSettings,
    onUpdateSettings,
    onApiConnect,
    onApiDisconnect,
    isApiConnecting,
    isApiConnected,
}) => {
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
        alert("Settings saved. You can now try using the AI features again.");
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

    return (
        <div className="space-y-6 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard className="md:col-span-2">
                    <SectionTitle>Connection Status</SectionTitle>
                    {siteSettings.syncMode === 'api' ? (
                         <div className="flex items-start gap-4">
                           <CloudIcon isConnected={isApiConnected} />
                           <div>
                               <p className={`font-semibold flex items-center gap-2 ${isApiConnected ? 'text-[var(--theme-green)]' : 'text-[var(--theme-red)]'}`}>
                                   <span className="w-2.5 h-2.5 bg-current rounded-full"></span>
                                   {isApiConnected ? "Live Sync Active" : "API Connection Failed"}
                               </p>
                               <p className="text-sm text-[var(--theme-text-secondary)] mt-1">Data is synced with: <span className="font-mono bg-[var(--theme-bg)] px-1.5 py-0.5 rounded-md text-[var(--theme-text-primary)] break-all">{siteSettings.customApiEndpoint}</span>.</p>
                               <button onClick={onApiDisconnect} className="mt-3 text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors flex items-center gap-1">
                                   <XIcon /> Disconnect
                               </button>
                           </div>
                       </div>
                    ) : directoryHandle ? (
                        <div className="flex items-start gap-4">
                            <FolderSyncIcon />
                            <div>
                                <p className="font-semibold text-[var(--theme-green)] flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-current rounded-full"></span>
                                    Synced with Local Folder
                                </p>
                                <p className="text-sm text-[var(--theme-text-secondary)] mt-1">Data is synced with: <span className="font-mono bg-[var(--theme-bg)] px-1.5 py-0.5 rounded-md text-[var(--theme-text-primary)]">{directoryHandle.name}</span>.</p>
                                <button onClick={onDisconnectDirectory} className="mt-3 text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors flex items-center gap-1">
                                    <XIcon /> Disconnect
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-start gap-4">
                            <HardDriveIcon />
                            <div>
                                <p className="font-semibold text-[var(--theme-blue)] flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-current rounded-full"></span>
                                    Local Browser Mode
                                </p>
                                <p className="text-sm text-[var(--theme-text-secondary)] mt-1">Data is saved in this browser. Connect a folder for persistent, cross-device access.</p>
                                <button onClick={onSyncDirectory} className="mt-3 bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                                    <FolderIcon /> Connect to Folder...
                                </button>
                            </div>
                        </div>
                    )}
                </InfoCard>

                <InfoCard>
                    <SectionTitle>Data Summary</SectionTitle>
                    <div className="grid grid-cols-2 gap-y-3">
                        <div className="flex items-center gap-3"><TemplateIcon /><p>{templates.length} Template{templates.length !== 1 && 's'}</p></div>
                        <div className="flex items-center gap-3"><RecordingIcon /><p>{recordings.length} Recording{recordings.length !== 1 && 's'}</p></div>
                        <div className="flex items-center gap-3"><PhotoIcon /><p>{photos.length} Photo{photos.length !== 1 && 's'}</p></div>
                        <div className="flex items-center gap-3"><NotepadIcon /><p>{notes.length} Note{notes.length !== 1 && 's'}</p></div>
                    </div>
                </InfoCard>
            </div>
            
            <InfoCard>
                <SectionTitle>Backend &amp; API Settings</SectionTitle>
                <div className="space-y-6">
                    {/* Step 1: Auth Key */}
                    <div className="p-4 bg-[var(--theme-bg)]/50 rounded-md border border-[var(--theme-border)]/30">
                        <h4 className="font-semibold text-[var(--theme-text-primary)]">Step 1: Set Authentication Key (Required)</h4>
                        <p className="text-sm text-[var(--theme-text-secondary)]/80 mt-1 mb-3">
                            To fix <strong className="text-[var(--theme-red)]">'Unauthorized'</strong> errors, you must provide the secret key you configured on your server (e.g., your <code className="bg-black/30 px-1 py-0.5 rounded text-xs">API_SECRET_KEY</code> from Vercel).
                        </p>
                        <InputField 
                            id="customApiAuthKey" 
                            label="Backend Auth Key" 
                            value={apiSettings.customApiAuthKey} 
                            onChange={handleApiSettingsChange} 
                            placeholder="Paste your secret key here" 
                            type="password"
                        />
                    </div>

                    {/* Step 2: API Server URL */}
                    <div className="p-4 bg-[var(--theme-bg)]/50 rounded-md border border-[var(--theme-border)]/30">
                        <h4 className="font-semibold text-[var(--theme-text-primary)]">Step 2: Connect to Sync Server (Optional)</h4>
                        <p className="text-sm text-[var(--theme-text-secondary)]/80 mt-1 mb-3">
                            For multi-device or team sync, enter your custom API server URL below. If you are just using the app on Vercel, <strong className="text-[var(--theme-yellow)]">leave this field blank.</strong>
                        </p>
                        <div className="flex items-end gap-4">
                            <div className="flex-grow">
                                <InputField 
                                    id="customApiEndpoint" 
                                    label="Custom API Server URL" 
                                    value={apiSettings.customApiEndpoint} 
                                    onChange={handleApiSettingsChange} 
                                    placeholder="Leave blank for standard use" 
                                />
                            </div>
                            <button 
                                onClick={handleConnectClick} 
                                disabled={isApiConnecting || !apiSettings.customApiEndpoint || !apiSettings.customApiAuthKey} 
                                className="bg-[var(--theme-green)] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2 disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed h-[42px] flex-shrink-0"
                            >
                               {isApiConnecting ? 'Connecting...' : 'Connect & Sync'}
                            </button>
                        </div>
                         {siteSettings.syncMode === 'api' && isApiConnected && (
                            <p className="text-xs text-[var(--theme-green)] mt-2">Successfully connected and syncing with the server.</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                         <button 
                            onClick={handleApiSettingsSave} 
                            className="bg-[var(--theme-blue)] hover:opacity-90 text-white font-semibold py-2 px-6 rounded-md text-sm"
                        >
                            Save All Settings
                        </button>
                    </div>
                </div>
            </InfoCard>

            <InfoCard>
                <SectionTitle>Backup & Restore</SectionTitle>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-[var(--theme-text-secondary)] mb-2">Save all app data to a single backup file.</p>
                        <button onClick={onBackup} className="bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <DownloadIcon /> Download Full Backup (.zip)
                        </button>
                    </div>
                    <div className="pt-5 border-t border-[var(--theme-border)]/50 md:pt-0 md:border-t-0 md:pl-6 md:border-l md:border-[var(--theme-border)]/50">
                        <p className="text-sm text-[var(--theme-text-secondary)] mb-2">Restore data from a backup file. This will <span className="font-semibold text-[var(--theme-yellow)]">overwrite all</span> existing data.</p>
                         <label htmlFor="restore-upload" className="cursor-pointer bg-[var(--theme-blue)] hover:opacity-90 text-white font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <RestoreIcon /> Choose Backup File (.zip)...
                        </label>
                        <input id="restore-upload" type="file" className="sr-only" onChange={handleRestoreFileSelect} accept=".zip" />
                        {restoreError && <p className="text-[var(--theme-red)] text-sm mt-2">{restoreError}</p>}
                    </div>
                </div>
            </InfoCard>

            <div className="bg-[var(--theme-red)]/10 p-6 rounded-lg border border-[var(--theme-red)]/30">
                <SectionTitle>Danger Zone</SectionTitle>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-[var(--theme-red)]">Clear All Local Data</p>
                        <p className="text-sm text-[var(--theme-red)]/80 mt-1">This will permanently delete all data from your browser. This action cannot be undone.</p>
                    </div>
                    <button onClick={onClearLocalData} className="bg-[var(--theme-red)]/80 hover:bg-[var(--theme-red)] text-white font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2 flex-shrink-0">
                        <TrashIcon /> Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};