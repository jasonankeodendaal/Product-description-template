import React, { useState } from 'react';
import { Template, Recording } from '../App';
import { DownloadIcon } from './icons/DownloadIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { XIcon } from './icons/XIcon';

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

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-[var(--theme-dark-bg)] p-6 rounded-lg border border-[var(--theme-border)]">
        <div className="flex items-center gap-3">
            <div className="text-[var(--theme-yellow)]">{icon}</div>
            <h3 className="text-lg font-semibold text-[var(--theme-yellow)]">{title}</h3>
        </div>
        <div className="mt-4 pl-9 space-y-4">
            {children}
        </div>
    </div>
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

    const hasLocalSettings = !!localStorage.getItem('siteSettings');

    return (
        <div className="space-y-6">
            <Section title="Connection Status" icon={directoryHandle ? <FolderSyncIcon /> : <HardDriveIcon />}>
                {directoryHandle ? (
                     <div>
                        <p className="font-semibold text-emerald-400">Synced with Local Folder</p>
                        <p className="text-sm text-slate-400">All data is being saved to and loaded from: <span className="font-mono bg-slate-900 px-1 rounded">{directoryHandle.name}</span>.</p>
                         <button onClick={onDisconnectDirectory} className="mt-3 text-sm font-semibold text-[var(--theme-red)] hover:underline flex items-center gap-1">
                            <XIcon /> Disconnect Folder
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="font-semibold text-sky-400">Local Backup Mode</p>
                        <p className="text-sm text-slate-400">All data is being saved to your browser's local storage. Connect a folder for persistent, cross-device data synchronization.</p>
                        <button onClick={onSyncDirectory} className="mt-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <FolderIcon /> Connect to Folder...
                        </button>
                    </div>
                )}
            </Section>

            <Section title="Local Storage Details" icon={<HardDriveIcon />}>
                 <p className="text-sm text-slate-400">The following data is currently stored in this browser:</p>
                 <ul className="text-sm space-y-2 text-slate-300 list-disc list-inside">
                     <li>
                        <span className="font-semibold">Site Settings:</span> {hasLocalSettings ? '1 Record' : '0 Records'}
                    </li>
                    <li>
                        <span className="font-semibold">Saved Templates:</span> {templates.length} {templates.length === 1 ? 'Template' : 'Templates'}
                    </li>
                    <li>
                        <span className="font-semibold">Audio Recordings:</span> {recordings.length} {recordings.length === 1 ? 'Recording' : 'Recordings'}
                    </li>
                 </ul>
                 <div className="pt-3">
                    <button onClick={onClearLocalData} className="text-sm font-semibold text-[var(--theme-red)] hover:underline flex items-center gap-1">
                        <TrashIcon /> Clear All Local Data
                    </button>
                 </div>
            </Section>

            <Section title="Backup & Restore" icon={<DownloadIcon />}>
                 <div>
                    <p className="text-sm text-slate-300 mb-2">Save all settings, templates, and recordings to a single backup file.</p>
                    <button onClick={onBackup} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                        <DownloadIcon /> Download Full Backup
                    </button>
                </div>
                <div className="pt-5 border-t border-[var(--theme-border)]">
                    <p className="text-sm text-slate-300 mb-2">Restore data from a backup file. <span className="font-semibold text-[var(--theme-yellow)]">This will overwrite all existing data.</span></p>
                    <div className="flex items-center gap-2">
                            <label htmlFor="restore-upload" className="cursor-pointer bg-[var(--theme-blue)] hover:opacity-90 text-white font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                            <RestoreIcon /> Choose Backup File...
                        </label>
                        <input id="restore-upload" type="file" className="sr-only" onChange={handleRestoreFileSelect} accept=".json" />
                            {restoreFile && <span className="text-sm text-slate-400 truncate">{restoreFile.name}</span>}
                    </div>
                        {restoreError && <p className="text-[var(--theme-red)] text-sm mt-2">{restoreError}</p>}
                </div>
            </Section>
        </div>
    );
};