import React, { useState, useRef, useEffect } from 'react';
import { SiteSettings } from '../constants';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { UserIcon } from './icons/UserIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';
import { View } from '../App';

interface MobileHeaderProps {
  siteSettings: SiteSettings;
  onNavigate: (view: View) => void;
  onOpenDashboard: () => void;
  onOpenInfo: () => void;
  onOpenCreatorInfo: () => void;
}

const MoreMenuItem: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[var(--theme-text-primary)] hover:bg-[var(--theme-card-bg)]/50"
    >
        <div className="w-6 h-6 text-[var(--theme-text-secondary)]">{icon}</div>
        <span>{label}</span>
    </button>
);

export const MobileHeader: React.FC<MobileHeaderProps> = ({ siteSettings, onNavigate, onOpenDashboard, onOpenInfo, onOpenCreatorInfo }) => {
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
                <img src={siteSettings.logoSrc} alt="Company Logo" className="h-12 w-auto rounded-md" />
            ) : (
                <div className="h-12 w-12 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-lg font-bold">
                    {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                </div>
            )}
            <span className="text-lg font-semibold text-[var(--theme-text-primary)]">{siteSettings.companyName}</span>
        </div>
        
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
                        <li><MoreMenuItem label="Creator Info" icon={<UserIcon />} onClick={() => { onOpenCreatorInfo(); setIsMoreMenuOpen(false); }} /></li>
                        <li><MoreMenuItem label="Dashboard" icon={<DatabaseIcon />} onClick={() => { onOpenDashboard(); setIsMoreMenuOpen(false); }} /></li>
                        <li><MoreMenuItem label="About & Setup" icon={<QuestionCircleIcon />} onClick={() => { onOpenInfo(); setIsMoreMenuOpen(false); }} /></li>
                    </ul>
                </div>
            )}
        </div>
        </div>
    </header>
    );
};
