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
    <div className={`bg-[var(--theme-card-bg)]/50 p-6 rounded-lg border border-[var(--theme-border)]/50 ${className}`}>
        {children}
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">{children}</h3>
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
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <TemplateIcon />
                            <div>
                                <p className="font-semibold text-[var(--theme-text-primary)]">{templates.length}</p>
                                <p className="text-xs text-[var(--theme-text-secondary)]">Saved Template{templates.length !== 1 && 's'}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <RecordingIcon />
                            <div>
                                <p className="font-semibold text-[var(--theme-text-primary)]">{recordings.length}</p>
                                <p className="text-xs text-[var(--theme-text-secondary)]">Audio Recording{recordings.length !== 1 && 's'}</p>
                            </div>
                        </div>
                    </div>
                </InfoCard>
            </div>

            <InfoCard>
                <SectionTitle>Backup & Restore</SectionTitle>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-[var(--theme-text-secondary)] mb-2">Save all settings, templates, and recordings to a single backup file.</p>
                        <button onClick={onBackup} className="bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <DownloadIcon /> Download Full Backup
                        </button>
                    </div>
                    <div className="pt-5 border-t border-[var(--theme-border)]/50 md:pt-0 md:border-t-0 md:pl-6 md:border-l md:border-[var(--theme-border)]/50">
                        <p className="text-sm text-[var(--theme-text-secondary)] mb-2">Restore data from a backup file. This will <span className="font-semibold text-[var(--theme-yellow)]">overwrite all</span> existing data.</p>
                         <label htmlFor="restore-upload" className="cursor-pointer bg-[var(--theme-blue)] hover:opacity-90 text-white font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <RestoreIcon /> Choose Backup File...
                        </label>
                        <input id="restore-upload" type="file" className="sr-only" onChange={handleRestoreFileSelect} accept=".json" />
                        {restoreError && <p className="text-[var(--theme-red)] text-sm mt-2">{restoreError}</p>}
                    </div>
                </div>
            </InfoCard>

            <div className="bg-[var(--theme-red)]/10 p-6 rounded-lg border border-[var(--theme-red)]/30">
                <SectionTitle>Danger Zone</SectionTitle>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-[var(--theme-red)]">Clear All Local Data</p>
                        <p className="text-sm text-[var(--theme-red)]/80 mt-1">This will permanently delete all templates, settings, and recordings from your browser. This action cannot be undone.</p>
                    </div>
                    <button onClick={onClearLocalData} className="bg-[var(--theme-red)]/80 hover:bg-[var(--theme-red)] text-white font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2 flex-shrink-0">
                        <TrashIcon /> Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};