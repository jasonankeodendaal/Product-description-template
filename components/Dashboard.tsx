import React, { useState } from 'react';
import { Template, Recording, Photo, Note, NoteRecording, LogEntry, UserRole, CalendarEvent } from '../App';
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
import { AndroidIcon } from './icons/AndroidIcon';
import { AppPublishingGuide } from './AppPublishingGuide';
import { UserIcon } from './icons/UserIcon';

interface DashboardProps {
  onClose: () => void;
  templates: Template[];
  recordings: Recording[];
  photos: Photo[];
  notes: Note[];
  noteRecordings: NoteRecording[];
  logEntries: LogEntry[];
  calendarEvents: CalendarEvent[];
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
  onDownloadSource: () => void;
  userRole: UserRole;
  onInitiatePinReset: () => void;
  onOpenCreatorInfo: () => void;
}

type Section = 'data' | 'settings' | 'setup' | 'about' | 'publishing';

export const Dashboard: React.FC<DashboardProps> = ({ 
  onClose, 
  templates,
  recordings,
  photos,
  notes,
  noteRecordings,
  logEntries,
  calendarEvents,
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
  onDownloadSource,
  userRole,
  onInitiatePinReset,
  onOpenCreatorInfo,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('about');

  const handleBackup = async () => {
    try {
        await createBackup(siteSettings, templates, recordings, photos, notes, noteRecordings, logEntries, calendarEvents);
    } catch (err) {
        alert(`Error creating backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in relative">
        <div className="absolute inset-0 -z-10 bg-grid-orange-500/10 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_70%)]"></div>

        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="w-8 h-8 text-[var(--theme-orange)]" />
            <div>
                <h2 className="text-xl font-bold text-[var(--theme-text-primary)]">Dashboard</h2>
                <p className="text-[var(--theme-text-secondary)] mt-1 text-sm">Manage your application's data, settings, and local folder connection.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            <aside className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-[var(--theme-border)] flex-shrink-0 bg-black/20">
                <nav className="space-y-2">
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                    <NavButton active={activeSection === 'data'} onClick={() => setActiveSection('data')} icon={<DatabaseIcon />}>Data Management</NavButton>
                    <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} icon={<SettingsIcon />}>Site & Creator Settings</NavButton>
                    {userRole === 'creator' && (
                      <>
                        <NavButton active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} icon={<CodeIcon />}>Setup Guide</NavButton>
                        <NavButton active={activeSection === 'publishing'} onClick={() => setActiveSection('publishing')} icon={<AndroidIcon />}>App Publishing (APK)</NavButton>
                        <div className="pt-2 mt-2 border-t border-white/10">
                          <NavButton active={false} onClick={onOpenCreatorInfo} icon={<UserIcon />}>Creator Info</NavButton>
                        </div>
                      </>
                    )}
                </nav>
            </aside>

            <main className="flex-grow md:overflow-y-auto p-6 bg-black/20">
                {activeSection === 'data' && (
                    <DataManagement 
                        templates={templates}
                        recordings={recordings}
                        photos={photos}
                        notes={notes}
                        noteRecordings={noteRecordings}
                        logEntries={logEntries}
                        calendarEvents={calendarEvents}
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
                        userRole={userRole}
                        onInitiatePinReset={onInitiatePinReset}
                    />
                )}
                {activeSection === 'setup' && userRole === 'creator' && <SetupGuide />}
                {activeSection === 'about' && <AboutThisApp onNavigateToSetup={() => setActiveSection('setup')} />}
                {activeSection === 'publishing' && userRole === 'creator' && <AppPublishingGuide onDownloadSource={onDownloadSource} />}
            </main>
        </div>
      </div>
    </div>
  );
};