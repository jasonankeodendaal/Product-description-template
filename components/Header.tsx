import React, { useState, useRef, useEffect } from 'react';
import { SiteSettings } from '../constants';
import { CompanyInfoDropdown } from './CompanyInfoDropdown';
import { CloudIcon } from './icons/CloudIcon';
import { View } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { HomeIcon } from './icons/HomeIcon';

interface HeaderProps {
  siteSettings: SiteSettings;
  isApiConnected: boolean;
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenDashboard: () => void;
  onOpenInfo: () => void;
  onOpenCreatorInfo: () => void;
  showInstallButton: boolean;
  onInstallClick: () => void;
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
                ? 'bg-[var(--theme-green)] text-black'
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:text-[var(--theme-text-primary)]'
        }`}
    >
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
    </button>
);

const UtilityButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors" title={label}>
        <div className="w-6 h-6">{icon}</div>
    </button>
);

export const Header: React.FC<HeaderProps> = React.memo(({ 
    siteSettings,
    isApiConnected,
    currentView,
    onNavigate,
    onOpenDashboard,
    onOpenInfo,
    onOpenCreatorInfo,
    showInstallButton,
    onInstallClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <header className="border-b border-white/10 flex-shrink-0 hidden lg:flex">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[76px]">
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--theme-green)] rounded-md p-1"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
            {siteSettings.logoSrc ? (
                <img src={siteSettings.logoSrc} alt="Company Logo" className="h-16 w-auto rounded-md logo-glow-effect" />
            ) : (
                <div className="h-16 w-16 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-xl font-bold">
                    {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                </div>
            )}
            <span className="hidden sm:inline text-xl font-semibold text-[var(--theme-text-primary)]">{siteSettings.companyName}</span>
            </button>
            {isDropdownOpen && <CompanyInfoDropdown settings={siteSettings} onClose={() => setIsDropdownOpen(false)} />}
        </div>

        <nav className="flex items-center gap-2">
            <HeaderNavItem label="Home" icon={<HomeIcon />} isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
            <HeaderNavItem label="Generator" icon={<SparklesIcon />} isActive={currentView === 'generator'} onClick={() => onNavigate('generator')} />
            <HeaderNavItem label="Recordings" icon={<RecordingIcon />} isActive={currentView === 'recordings'} onClick={() => onNavigate('recordings')} />
            <HeaderNavItem label="Photos" icon={<PhotoIcon />} isActive={currentView === 'photos'} onClick={() => onNavigate('photos')} />
            <HeaderNavItem label="Notepad" icon={<NotepadIcon />} isActive={currentView === 'notepad'} onClick={() => onNavigate('notepad')} />
            <HeaderNavItem label="Image Tool" icon={<ImageIcon />} isActive={currentView === 'image-tool'} onClick={() => onNavigate('image-tool')} />
        </nav>

        <div className="flex items-center gap-4">
             {showInstallButton && (
                <button
                    onClick={onInstallClick}
                    className="flex items-center gap-2 bg-[var(--theme-green)] text-black font-bold py-2 px-4 rounded-full text-sm animate-fade-in-down shadow-lg hover:opacity-90 transition-opacity"
                    aria-label="Install App"
                >
                    <DownloadIcon />
                    <span>Install App</span>
                </button>
            )}
            <UtilityButton label="Creator Info" icon={<UserIcon />} onClick={onOpenCreatorInfo} />
            <UtilityButton label="Dashboard" icon={<DatabaseIcon />} onClick={onOpenDashboard} />
            <UtilityButton label="About & Setup" icon={<QuestionCircleIcon />} onClick={onOpenInfo} />
            
            {siteSettings.syncMode === 'api' && (
              <div className="relative group ml-2">
                <CloudIcon isConnected={isApiConnected} />
                <div className="absolute top-full right-0 mt-2 w-max bg-black/80 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {isApiConnected ? 'Connected to API' : 'API Connection Failed'}
                </div>
              </div>
            )}
        </div>
      </div>
    </header>
  );
});