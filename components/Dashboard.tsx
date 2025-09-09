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
import { SetupGuide } from './SetupGuide';
import { CodeIcon } from './icons/CodeIcon';

interface DashboardProps {
  onClose: () => void;
  onLock: () => void;
  templates: Template[];
  recordings: Recording[];
  photos: Photo[];
  notes: Note[];
  siteSettings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onRestore: (data: any) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSyncDirectory: () => void;
  onDisconnectDirectory: () => void;
  onClearLocalData: () => void;
}

type Section = 'data' | 'settings' | 'setup' | 'about';

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 relative ${
            active 
                ? 'bg-[var(--theme-blue)]/10 text-[var(--theme-blue)]' 
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:text-[var(--theme-text-primary)]'
        }`}
        role="tab"
        aria-selected={active}
    >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[var(--theme-blue)] rounded-r-full"></div>}
        <div className="w-5 h-5">{icon}</div>
        <span>{children}</span>
    </button>
);

const AboutThisApp: React.FC = () => (
    <div className="space-y-6 text-[var(--theme-text-primary)] leading-relaxed animate-fade-in-down max-w-3xl">
        <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">About This Application</h2>
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">The Goal</h3>
                <p>This application is a suite of tools designed to streamline content creation and data management by leveraging AI and local-first data principles.</p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">Core Features</h3>
                <ul className="list-disc list-inside mt-2 pl-4 text-[var(--theme-text-secondary)] space-y-2">
                    <li><strong>AI Description Generator:</strong> Takes raw product info and meticulously reformats it into a professional layout using your templates. It focuses on preserving your wording while adding missing public data like warranties via web search.</li>
                    <li><strong>Recording Manager:</strong> A tool for voice memos. Record audio, add notes and tags, attach images, and get an automatic AI-powered transcription.</li>
                    <li><strong>Photo Manager:</strong> Organize images into folders, add detailed notes, and capture photos directly from your device's camera.</li>
                    <li><strong>Notepad:</strong> A simple, effective place to jot down ideas and categorize them for later use.</li>
                </ul>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">Your Data, Your Control</h3>
                <p>This application runs entirely in your browser. For advanced persistence and backups, you can connect a local folder on your computer. All data processing and storage are under your control, ensuring privacy and ownership.</p>
            </div>
        </div>
    </div>
);


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
  onClearLocalData
}) => {
  const [activeSection, setActiveSection] = useState<Section>('data');

  const handleBackup = async () => {
    try {
        await createBackup(siteSettings, templates, recordings, photos, notes);
    } catch (err) {
        alert(`Error creating backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)]/80 border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
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
                    <NavButton active={activeSection === 'data'} onClick={() => setActiveSection('data')} icon={<DatabaseIcon />}>Data Management</NavButton>
                    <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} icon={<SettingsIcon />}>Site & Creator Settings</NavButton>
                    <NavButton active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} icon={<CodeIcon />}>Setup Guide</NavButton>
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                </nav>
            </aside>

            <main className="flex-grow md:overflow-y-auto p-6 bg-[var(--theme-bg)]/30">
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
                    />
                )}
                {activeSection === 'settings' && (
                    <SiteSettingsEditor 
                        settings={siteSettings}
                        onSave={onUpdateSettings}
                    />
                )}
                {activeSection === 'setup' && <SetupGuide />}
                {activeSection === 'about' && <AboutThisApp />}
            </main>
        </div>
      </div>
    </div>
  );
};
