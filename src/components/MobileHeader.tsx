
import React, { useState, useRef, useEffect } from 'react';
import { SiteSettings } from '../constants';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RotateIcon } from './icons/RotateIcon';
import { UserIcon } from './icons/UserIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import type { View, UserRole } from '../types';

interface MobileHeaderProps {
  siteSettings: SiteSettings;
  onNavigate: (view: View) => void;
  onOpenDashboard: () => void;
  onOpenInfo: () => void;
  onOpenCreatorInfo: () => void;
  showInstallButton: boolean;
  onInstallClick: () => void;
  onToggleOrientation: () => void;
  isLandscapeLocked: boolean;
  userRole: UserRole;
  isApiConnected: boolean;
}

const MoreMenuItem: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; isActive?: boolean }> = ({ label, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-center transition-colors duration-200 group
            ${isActive 
                ? 'bg-orange-500/20 text-orange-400' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
    >
        <div className={`w-7 h-7 mb-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{icon}</div>
        <span className="text-xs font-semibold leading-tight">{label}</span>
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

export const MobileHeader: React.FC<MobileHeaderProps> = ({ siteSettings, onNavigate, onOpenDashboard, onOpenInfo, onOpenCreatorInfo, userRole, showInstallButton, onInstallClick, onToggleOrientation, isLandscapeLocked, isApiConnected }) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
    <header className="bg-[var(--theme-card-bg)]/80 backdrop-blur-sm border-b border-[var(--theme-border)]/50 fixed top-0 z-20 w-full lg:hidden">
        <div className="container mx-auto px-4 flex justify-between items-center h-[76px]">
            <div className="flex items-center gap-3">
                {siteSettings.logoSrc ? (
                    <img src={siteSettings.logoSrc} alt="Company Logo" className="h-14 w-auto rounded-md" />
                ) : (
                    <div className="h-14 w-14 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-lg font-bold">
                        {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                    </div>
                )}
                <span className="text-lg font-semibold text-[var(--theme-text-primary)]">{siteSettings.companyName}</span>
            </div>
            
            <div className="flex items-center gap-2">
                 <StorageIndicator siteSettings={siteSettings} isApiConnected={isApiConnected} />
                 {showInstallButton && (
                    <button
                        onClick={onInstallClick}
                        className="flex items-center gap-2 bg-[var(--theme-orange)] text-black font-bold py-2 px-3 rounded-full text-sm animate-fade-in-down shadow-lg hover:opacity-90 transition-opacity"
                        aria-label="Install App"
                    >
                        <DownloadIcon />
                        <span className="pr-1">Install</span>
                    </button>
                )}
                <div className="relative" ref={moreMenuRef}>
                    <button 
                        onClick={() => setIsMoreMenuOpen(prev => !prev)}
                        className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                    >
                        <MoreVerticalIcon />
                    </button>
                    {isMoreMenuOpen && (
                        <div 
                            className="absolute top-full right-0 mt-2 w-64 bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 p-2 z-30 animate-fade-in-down"
                        >
                            <div className="grid grid-cols-3 gap-2">
                                {userRole === 'creator' && (
                                    <MoreMenuItem label="Creator" icon={<UserIcon />} onClick={() => { onOpenCreatorInfo(); setIsMoreMenuOpen(false); }} />
                                )}
                                <MoreMenuItem label="Browser" icon={<FolderOpenIcon />} onClick={() => { onNavigate('browser'); setIsMoreMenuOpen(false); }} />
                                <MoreMenuItem label="Image Tool" icon={<ImageIcon />} onClick={() => { onNavigate('image-tool'); setIsMoreMenuOpen(false); }} />
                                <MoreMenuItem label="Dashboard" icon={<DatabaseIcon />} onClick={() => { onOpenDashboard(); setIsMoreMenuOpen(false); }} />
                                <MoreMenuItem label="Lock" icon={<RotateIcon />} onClick={() => { onToggleOrientation(); setIsMoreMenuOpen(false); }} isActive={isLandscapeLocked} />
                                <MoreMenuItem label="About" icon={<QuestionCircleIcon />} onClick={() => { onOpenInfo(); setIsMoreMenuOpen(false); }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </header>
    );
};
