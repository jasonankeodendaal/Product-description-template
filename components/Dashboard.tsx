import React, { useState } from 'react';
import { Template, Recording, Photo, Note, NoteRecording, LogEntry, UserRole, CalendarEvent } from '../App';
import { XIcon } from './icons/XIcon';
import { DataManagement } from './DataManagement';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { SiteSettings } from '../constants';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CodeIcon } from './icons/CodeIcon';
import { AboutThisApp } from './AboutThisApp';
import { SetupGuide } from './SetupGuide';
import { AndroidIcon } from './icons/AndroidIcon';
import { AppPublishingGuide } from './AppPublishingGuide';
import { UserIcon } from './icons/UserIcon';
import { HomeTile } from './HomeTile';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

// Re-using home screen tile icons for consistency
import { DataManagementToolIcon } from './icons/DataManagementToolIcon';
import { SettingsToolIcon } from './icons/SettingsToolIcon';
import { SetupToolIcon } from './icons/SetupToolIcon';
import { PublishToolIcon } from './icons/PublishToolIcon';
import { AboutToolIcon } from './icons/AboutToolIcon';
import { CreatorToolIcon } from './icons/CreatorToolIcon';

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
  userRole: UserRole;
  onInitiatePinReset: () => void;
  onOpenCreatorInfo: () => void;
  googleDriveStatus: { connected: boolean, email?: string };
  onGoogleDriveConnect: () => void;
  onGoogleDriveDisconnect: () => void;
}

type DashboardView = 'main' | 'data' | 'settings' | 'setup' | 'about' | 'publishing';

const viewTitles: Record<DashboardView, string> = {
    main: 'Dashboard',
    data: 'Data Management',
    settings: 'Site & Creator Settings',
    setup: 'Setup Guide',
    about: 'About This App',
    publishing: 'App Publishing (APK)',
};

const DashboardTile: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; colorClass: string, delay: number }> = 
    ({ title, icon, onClick, colorClass, delay }) => (
    <HomeTile className="aspect-square" style={{ animationDelay: `${delay}ms`}}>
        <button onClick={onClick} className={`w-full h-full ${colorClass} text-white p-3 flex flex-col justify-between items-start gap-2 hover:opacity-90 transition-opacity`}>
            <div className="w-10 h-10 holographic-icon">{icon}</div>
            <span className="font-bold text-sm sm:text-base text-left holographic-text">{title}</span>
        </button>
    </HomeTile>
);

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const [dashboardView, setDashboardView] = useState<DashboardView>('main');
  const { onClose, userRole, onOpenCreatorInfo } = props;

  const handleBack = () => setDashboardView('main');

  const renderContent = () => {
    switch (dashboardView) {
        case 'data':
            return <DataManagement {...props} />;
        case 'settings':
            return <SiteSettingsEditor {...props} />;
        case 'setup':
            return <SetupGuide />;
        case 'about':
            return <AboutThisApp onNavigateToSetup={() => setDashboardView('setup')} />;
        case 'publishing':
            return <AppPublishingGuide />;
        default:
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <DashboardTile title="Data Management" icon={<DataManagementToolIcon />} onClick={() => setDashboardView('data')} colorClass="bg-orange-500" delay={50} />
                        <DashboardTile title="Site Settings" icon={<SettingsToolIcon />} onClick={() => setDashboardView('settings')} colorClass="bg-orange-600" delay={100} />
                        <DashboardTile title="About This App" icon={<AboutToolIcon />} onClick={() => setDashboardView('about')} colorClass="bg-amber-500" delay={150} />
                    </div>
                    {userRole === 'creator' && (
                        <div>
                            <h3 className="text-xl font-bold text-[var(--theme-orange)] mb-3 pl-2">Creator Zone</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                <DashboardTile title="Creator Info" icon={<CreatorToolIcon />} onClick={onOpenCreatorInfo} colorClass="bg-red-500" delay={200} />
                                <DashboardTile title="Setup Guide" icon={<SetupToolIcon />} onClick={() => setDashboardView('setup')} colorClass="bg-orange-700" delay={250} />
                                <DashboardTile title="App Publishing" icon={<PublishToolIcon />} onClick={() => setDashboardView('publishing')} colorClass="bg-amber-600" delay={300} />
                            </div>
                        </div>
                    )}
                </div>
            );
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in relative">
        <div className="absolute inset-0 -z-10 bg-grid-orange-500/10 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_70%)]"></div>

        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {dashboardView !== 'main' && (
                <button onClick={handleBack} className="p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white flex-shrink-0 mr-2">
                    <ChevronLeftIcon />
                </button>
            )}
            <DatabaseIcon className="w-8 h-8 text-[var(--theme-orange)] hidden sm:block" />
            <div className="truncate">
                <h2 className="text-xl font-bold text-[var(--theme-text-primary)] truncate">{viewTitles[dashboardView]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
          </div>
        </header>
        
        <main className="flex-grow overflow-y-auto">
            <div className={dashboardView !== 'main' ? 'p-6' : 'p-4'}>
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};