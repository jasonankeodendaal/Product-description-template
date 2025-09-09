import React, { useState } from 'react';
import { Template, Recording } from '../App';
import { DownloadIcon } from './icons/DownloadIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { XIcon } from './icons/XIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { RecordingIcon } from './icons/RecordingIcon';

interface DataManagementProps {
    templates: Template[];
    recordings: Recording[];
    onBackup: () => void;
    onRestore: (data: any) => void;
    directoryHandle: FileSystemDirectoryHandle | null;
    onClearLocalData: () => void;
    onSyncDirectory: () => void;
    onDisconnectDirectory: () => void;
}

const InfoCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 ${className}`}>
        {children}
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-slate-200 mb-4">{children}</h3>
);


export const DataManagement: React.FC<DataManagementProps> = ({
    templates,
    recordings,
    onBackup,
    onRestore,
    directoryHandle,
    onClearLocalData,
    onSyncDirectory,
    onDisconnectDirectory
}) => {
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [restoreError, setRestoreError] = useState('');

    const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'application/json') {
                setRestoreFile(file);
                setRestoreError('');
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target?.result as string);
                        if (window.confirm("Are you sure you want to restore from this backup? All current data will be overwritten and the local sync folder will be disconnected.")) {
                            onRestore(data);
                        }
                    } catch (err) { setRestoreError('Invalid backup file format.'); setRestoreFile(null); }
                };
                reader.onerror = () => { setRestoreError('Failed to read the file.'); setRestoreFile(null); };
                reader.readAsText(file);
            } else {
                setRestoreError('Invalid file type. Please select a .json backup file.');
                setRestoreFile(null);
            }
        }
        e.target.value = '';
    };

    return (
        <div className="space-y-6 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard className="md:col-span-2">
                    <SectionTitle>Connection Status</SectionTitle>
                    {directoryHandle ? (
                        <div className="flex items-start gap-4">
                            <FolderSyncIcon />
                            <div>
                                <p className="font-semibold text-emerald-400 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                                    Synced with Local Folder
                                </p>
                                <p className="text-sm text-slate-400 mt-1">Data is synced with: <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-300">{directoryHandle.name}</span>.</p>
                                <button onClick={onDisconnectDirectory} className="mt-3 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1">
                                    <XIcon /> Disconnect
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-start gap-4">
                            <HardDriveIcon />
                            <div>
                                <p className="font-semibold text-sky-400 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full"></span>
                                    Local Browser Mode
                                </p>
                                <p className="text-sm text-slate-400 mt-1">Data is saved in this browser. Connect a folder for persistent, cross-device access.</p>
                                <button onClick={onSyncDirectory} className="mt-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                                    <FolderIcon /> Connect to Folder...
                                </button>
                            </div>
                        </div>
                    )}
                </InfoCard>

                <InfoCard>
                    <SectionTitle>Data Summary</SectionTitle>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <TemplateIcon />
                            <div>
                                <p className="font-semibold text-slate-200">{templates.length}</p>
                                <p className="text-xs text-slate-400">Saved Template{templates.length !== 1 && 's'}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <RecordingIcon />
                            <div>
                                <p className="font-semibold text-slate-200">{recordings.length}</p>
                                <p className="text-xs text-slate-400">Audio Recording{recordings.length !== 1 && 's'}</p>
                            </div>
                        </div>
                    </div>
                </InfoCard>
            </div>

            <InfoCard>
                <SectionTitle>Backup & Restore</SectionTitle>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-slate-300 mb-2">Save all settings, templates, and recordings to a single backup file.</p>
                        <button onClick={onBackup} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <DownloadIcon /> Download Full Backup
                        </button>
                    </div>
                    <div className="pt-5 border-t border-slate-700/50 md:pt-0 md:border-t-0 md:pl-6 md:border-l md:border-slate-700/50">
                        <p className="text-sm text-slate-300 mb-2">Restore data from a backup file. This will <span className="font-semibold text-yellow-400">overwrite all</span> existing data.</p>
                         <label htmlFor="restore-upload" className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <RestoreIcon /> Choose Backup File...
                        </label>
                        <input id="restore-upload" type="file" className="sr-only" onChange={handleRestoreFileSelect} accept=".json" />
                        {restoreError && <p className="text-red-400 text-sm mt-2">{restoreError}</p>}
                    </div>
                </div>
            </InfoCard>

            <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/30">
                <SectionTitle>Danger Zone</SectionTitle>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-red-300">Clear All Local Data</p>
                        <p className="text-sm text-red-400/80 mt-1">This will permanently delete all templates, settings, and recordings from your browser. This action cannot be undone.</p>
                    </div>
                    <button onClick={onClearLocalData} className="bg-red-600/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2 flex-shrink-0">
                        <TrashIcon /> Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};