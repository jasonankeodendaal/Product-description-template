import React from 'react';
import { SiteSettings } from '../constants';
import { CloudIcon } from './icons/CloudIcon';
import { View } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { RotateIcon } from './icons/RotateIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';

interface HeaderProps {
  siteSettings: SiteSettings;
  isApiConnected: boolean;
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenDashboard: () => void;
  onOpenInfo: () => void;
  showInstallButton: boolean;
  onInstallClick: () => void;
  onToggleOrientation: () => void;
  isLandscapeLocked: boolean;
  onOpenCreatorInfo: () => void;
}

const HeaderNavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
            isActive
                ? 'bg-[var(--theme-orange)] text-black'
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:text-[var(--theme-text-primary)]'
        }`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
    </button>
);

const UtilityButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; isActive?: boolean }> = ({ label, icon, onClick, isActive }) => (
    <button onClick={onClick} className={`group flex flex-col items-center justify-center transition-colors ${isActive ? 'text-[var(--theme-orange)]' : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'}`} title={label}>
        <div className="w-6 h-6">{icon}</div>
    </button>
);

const StorageIndicator: React.FC<{ siteSettings: SiteSettings, isApiConnected: boolean }> = ({ siteSettings, isApiConnected }) => {
    const getStatus = () => {
        switch (siteSettings.syncMode) {
            case 'folder':
                return { color: 'bg-green-500 animate-storage-pulse', title: 'Data is syncing to a local folder.' };
            case 'api':
                return isApiConnected 
                    ? { color: 'bg-green-500 animate-storage-pulse', title: `Connected to API: ${siteSettings.customApiEndpoint}` }
                    : { color: 'bg-yellow-500', title: `API connection failed: ${siteSettings.customApiEndpoint}` };
            default:
                return { color: 'bg-gray-500', title: 'Data is saved in this browser only.' };
        }
    };
    const { color, title } = getStatus();

    return (
        <div className="relative group" title={title}>
            <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
        </div>
    );
};


export const Header: React.FC<HeaderProps> = React.memo(({ 
    siteSettings,
    isApiConnected,
    currentView,
    onNavigate,
    onOpenDashboard,
    onOpenInfo,
    showInstallButton,
    onInstallClick,
    onToggleOrientation,
    isLandscapeLocked,
}) => {
  
  return (
    <header className="border-b border-white/10 flex-shrink-0 hidden lg:flex">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[76px]">
        <div className="relative">
            <div 
                className="flex items-center gap-3"
            >
            {siteSettings.logoSrc ? (
                <img src={siteSettings.logoSrc} alt="Company Logo" className="h-16 w-auto rounded-md" />
            ) : (
                <div className="h-16 w-16 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-xl font-bold">
                    {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                </div>
            )}
            <span className="hidden sm:inline text-xl font-semibold text-[var(--theme-text-primary)]">{siteSettings.companyName}</span>
            </div>
        </div>

        <nav className="hidden xl:flex items-center gap-1.5">
            <HeaderNavItem label="Home" icon={<HomeIcon />} isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
            <HeaderNavItem label="Generator" icon={<SparklesIcon />} isActive={currentView === 'generator'} onClick={() => onNavigate('generator')} />
            <HeaderNavItem label="Recordings" icon={<RecordingIcon />} isActive={currentView === 'recordings'} onClick={() => onNavigate('recordings')} />
            <HeaderNavItem label="Photos" icon={<PhotoIcon />} isActive={currentView === 'photos'} onClick={() => onNavigate('photos')} />
            <HeaderNavItem label="Browser" icon={<FolderOpenIcon />} isActive={currentView === 'browser'} onClick={() => onNavigate('browser')} />
            <HeaderNavItem label="Notepad" icon={<NotepadIcon />} isActive={currentView === 'notepad'} onClick={() => onNavigate('notepad')} />
            <HeaderNavItem label="Timesheet" icon={<ClockIcon />} isActive={currentView === 'timesheet'} onClick={() => onNavigate('timesheet')} />
            <HeaderNavItem label="Image Tool" icon={<ImageIcon />} isActive={currentView === 'image-tool'} onClick={() => onNavigate('image-tool')} />
        </nav>

        <div className="flex items-center gap-4">
             {showInstallButton && (
                <button
                    onClick={onInstallClick}
                    className="flex items-center gap-2 bg-[var(--theme-orange)] text-black font-bold py-2 px-4 rounded-full text-sm animate-fade-in-down shadow-lg hover:opacity-90 transition-opacity"
                    aria-label="Install App"
                >
                    <DownloadIcon />
                    <span>Install App</span>
                </button>
            )}
            <StorageIndicator siteSettings={siteSettings} isApiConnected={isApiConnected} />
            <UtilityButton label="Lock Landscape" icon={<RotateIcon />} onClick={onToggleOrientation} isActive={isLandscapeLocked} />
            <UtilityButton label="Dashboard" icon={<DatabaseIcon />} onClick={onOpenDashboard} />
            <UtilityButton label="About & Setup" icon={<QuestionCircleIcon />} onClick={onOpenInfo} />
        </div>
      </div>
    </header>
  );
});
