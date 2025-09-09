import React from 'react';
import { Template, Recording } from '../App';
import { XIcon } from './icons/XIcon';
import { DataManagement } from './DataManagement';
import { createBackup } from '../utils/dataUtils';

interface DashboardProps {
  onClose: () => void;
  onLock: () => void;
  templates: Template[];
  recordings: Recording[];
  onRestore: (data: any) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSyncDirectory: () => void;
  onDisconnectDirectory: () => void;
  onClearLocalData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onClose, 
  onLock,
  templates,
  recordings,
  onRestore,
  directoryHandle,
  onSyncDirectory,
  onDisconnectDirectory,
  onClearLocalData
}) => {
  
  const handleBackup = async () => {
    try {
        await createBackup(templates, recordings);
    } catch (err) {
        alert(`Error creating backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full max-w-3xl rounded-lg shadow-2xl border border-[var(--theme-border)] max-h-[90vh] flex flex-col">
        <header className="p-5 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Data Management Dashboard</h2>
            <p className="text-slate-400 mt-1 text-sm">Manage your application's connection, backups, and local data.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close"><XIcon /></button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6">
            <DataManagement 
                templates={templates}
                recordings={recordings}
                onBackup={handleBackup}
                onRestore={onRestore}
                directoryHandle={directoryHandle}
                onSyncDirectory={onSyncDirectory}
                onDisconnectDirectory={onDisconnectDirectory}
                onClearLocalData={onClearLocalData}
            />
        </main>

        <footer className="p-5 mt-auto border-t border-[var(--theme-border)] bg-black/20 flex justify-between items-center flex-shrink-0">
          <button onClick={onLock} style={{color: 'var(--theme-red)'}} className="text-sm font-semibold hover:underline transition-colors">Lock Dashboard</button>
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-md text-sm">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};