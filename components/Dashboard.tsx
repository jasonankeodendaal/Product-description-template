import React, { useState } from 'react';
import { Template, Recording, Photo, Note } from '../App';
import { XIcon } from './icons/XIcon';
import { DataManagement } from './DataManagement';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { createBackup } from '../utils/dataUtils';
import { SiteSettings } from '../constants';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CodeIcon } from './icons/CodeIcon';
import { NavButton } from './NavButton';
import { AboutThisApp } from './AboutThisApp';
import { SetupGuide } from './SetupGuide';

interface DashboardProps {
  onClose: () => void;
  onLock: () => void;
  templates: Template[];
  recordings: Recording[];
  photos: Photo[];
  notes: Note[];
  siteSettings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onRestore: (data: File) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSyncDirectory: () => void;
  onDisconnectDirectory: () => void;
  onClearLocalData: () => void;
  onApiConnect: (apiUrl: string, apiKey: string) => Promise<void>;
  onApiDisconnect: () => void;
  isApiConnecting: boolean;
  isApiConnected: boolean;
}

type Section = 'data' | 'settings' | 'setup' | 'about';

export const Dashboard: React.FC<DashboardProps> = ({ 
  onClose, 
  onLock,
  templates,
  recordings,
  photos,
  notes,
  siteSettings,
  onUpdateSettings,
  onRestore,
  directoryHandle,
  onSyncDirectory,
  onDisconnectDirectory,
  onClearLocalData,
  onApiConnect,
  onApiDisconnect,
  isApiConnecting,
  isApiConnected,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('about');

  const handleBackup = async () => {
    try {
        await createBackup(siteSettings, templates, recordings, photos, notes);
    } catch (err) {
        alert(`Error creating backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
        <header className="p-5 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text-primary)]">Dashboard</h2>
            <p className="text-[var(--theme-text-secondary)] mt-1 text-sm">Manage your application's data, settings, and local folder connection.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLock} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 transition-opacity">Lock Dashboard</button>
            <button onClick={onClose} className="text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            <aside className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-[var(--theme-border)] flex-shrink-0">
                <nav className="space-y-2">
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                    <NavButton active={activeSection === 'data'} onClick={() => setActiveSection('data')} icon={<DatabaseIcon />}>Data Management</NavButton>
                    <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} icon={<SettingsIcon />}>Site & Creator Settings</NavButton>
                    <NavButton active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} icon={<CodeIcon />}>Setup Guide</NavButton>
                </nav>
            </aside>

            <main className="flex-grow md:overflow-y-auto p-4 md:p-6 bg-[var(--theme-bg)]/30">
                {activeSection === 'data' && (
                    <DataManagement 
                        templates={templates}
                        recordings={recordings}
                        photos={photos}
                        notes={notes}
                        onBackup={handleBackup}
                        onRestore={onRestore}
                        directoryHandle={directoryHandle}
                        onSyncDirectory={onSyncDirectory}
                        onDisconnectDirectory={onDisconnectDirectory}
                        onClearLocalData={onClearLocalData}
                        siteSettings={siteSettings}
                        onUpdateSettings={onUpdateSettings}
                        onApiConnect={onApiConnect}
                        onApiDisconnect={onApiDisconnect}
                        isApiConnecting={isApiConnecting}
                        isApiConnected={isApiConnected}
                    />
                )}
                {activeSection === 'settings' && (
                    <SiteSettingsEditor 
                        settings={siteSettings}
                        onSave={onUpdateSettings}
                    />
                )}
                {activeSection === 'setup' && <SetupGuide />}
                {activeSection === 'about' && <AboutThisApp onNavigateToSetup={() => setActiveSection('setup')} />}
            </main>
        </div>
      </div>
    </div>
  );
};