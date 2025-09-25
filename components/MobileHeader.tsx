import React, { useState, useRef, useEffect } from 'react';
import { SiteSettings } from '../constants';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';
import { View } from '../App';
import { DownloadIcon } from './icons/DownloadIcon';
import { RotateIcon } from './icons/RotateIcon';

interface MobileHeaderProps {
  siteSettings: SiteSettings;
  onNavigate: (view: View) => void;
  onOpenDashboard: () => void;
  onOpenInfo: () => void;
  showInstallButton: boolean;
  onInstallClick: () => void;
  onToggleOrientation: () => void;
  isLandscapeLocked: boolean;
}

const MoreMenuItem: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; isActive?: boolean }> = ({ label, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--theme-card-bg)]/50 ${isActive ? 'text-[var(--theme-orange)]' : 'text-[var(--theme-text-primary)]'}`}
    >
        <div className={`w-6 h-6 ${isActive ? 'text-[var(--theme-orange)]' : 'text-[var(--theme-text-secondary)]'}`}>{icon}</div>
        <span>{label}</span>
    </button>
);

export const MobileHeader: React.FC<MobileHeaderProps> = ({ siteSettings, onNavigate, onOpenDashboard, onOpenInfo, showInstallButton, onInstallClick, onToggleOrientation, isLandscapeLocked }) => {
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
                    <img src={siteSettings.logoSrc} alt="Company Logo" className="h-14 w-auto rounded-md logo-glow-effect" />
                ) : (
                    <div className="h-14 w-14 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-lg font-bold">
                        {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                    </div>
                )}
                <span className="text-lg font-semibold text-[var(--theme-text-primary)]">{siteSettings.companyName}</span>
            </div>
            
            <div className="flex items-center gap-2">
                 {showInstallButton && (
                    <button
                        onClick={onInstallClick}
                        className="flex items-center gap-2 bg-[var(--theme-green)] text-black font-bold py-2 px-3 rounded-full text-sm animate-fade-in-down shadow-lg hover:opacity-90 transition-opacity"
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
                            className="absolute top-full right-0 mt-2 w-60 bg-[var(--theme-dark-bg)] rounded-xl shadow-2xl border border-[var(--theme-border)]/50 overflow-hidden z-30 animate-fade-in-down"
                        >
                            <ul>
                                <li><MoreMenuItem label="Image Squarer" icon={<ImageIcon />} onClick={() => { onNavigate('image-tool'); setIsMoreMenuOpen(false); }} /></li>
                                <li><MoreMenuItem label="Lock Landscape" icon={<RotateIcon />} onClick={() => { onToggleOrientation(); setIsMoreMenuOpen(false); }} isActive={isLandscapeLocked} /></li>
                                <li><MoreMenuItem label="Dashboard" icon={<DatabaseIcon />} onClick={() => { onOpenDashboard(); setIsMoreMenuOpen(false); }} /></li>
                                <li><MoreMenuItem label="About & Setup" icon={<QuestionCircleIcon />} onClick={() => { onOpenInfo(); setIsMoreMenuOpen(false); }} /></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </header>
    );
};