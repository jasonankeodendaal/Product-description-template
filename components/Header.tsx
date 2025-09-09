import React, { useState, useRef, useEffect } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { MicIcon } from './icons/MicIcon';
import { SiteSettings } from '../constants';
import { CompanyInfoDropdown } from './CompanyInfoDropdown';
import { ImageIcon } from './icons/ImageIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { HamburgerIcon } from './icons/HamburgerIcon';
import { CloudIcon } from './icons/CloudIcon';

interface HeaderProps {
  onSettingsClick: () => void;
  onRecordingsClick: () => void;
  onImageToolClick: () => void;
  onPhotoManagerClick: () => void;
  onNotepadClick: () => void;
  siteSettings: SiteSettings;
  isApiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(({ 
    onSettingsClick, 
    onRecordingsClick, 
    onImageToolClick, 
    onPhotoManagerClick,
    onNotepadClick,
    siteSettings,
    isApiConnected
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleMenuClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[var(--theme-card-bg)]/50 backdrop-blur-sm border-b border-[var(--theme-border)]/50 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--theme-blue)] rounded-md p-1"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
            {siteSettings.logoSrc ? (
                <img src={siteSettings.logoSrc} alt="Company Logo" className="h-12 w-auto rounded-md" />
            ) : (
                <div className="h-12 w-12 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-xl font-bold">
                    {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                </div>
            )}
            <span className="hidden sm:inline text-xl font-semibold text-[var(--theme-text-primary)]">{siteSettings.companyName}</span>
            </button>
            {isDropdownOpen && <CompanyInfoDropdown settings={siteSettings} onClose={() => setIsDropdownOpen(false)} />}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            {siteSettings.syncMode === 'api' && (
              <div className="relative group">
                <CloudIcon isConnected={isApiConnected} />
                <div className="absolute top-full right-0 mt-2 w-max bg-black/80 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {isApiConnected ? 'Connected to API' : 'API Connection Failed'}
                </div>
              </div>
            )}
            <button onClick={onSettingsClick} className="p-2 rounded-full hover:bg-[var(--theme-bg)] transition-colors" aria-label="Open Settings"><SettingsIcon /></button>
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="p-2 rounded-full hover:bg-[var(--theme-bg)] transition-colors" 
                    aria-label="Open tools menu"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                >
                    <HamburgerIcon />
                </button>
                {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-60 bg-[var(--theme-card-bg)] rounded-lg shadow-xl border border-[var(--theme-border)] z-30 origin-top-right animate-fade-in-down">
                        <ul className="p-2 space-y-1">
                            <li><button onClick={() => handleMenuClick(onNotepadClick)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[var(--theme-bg)] transition-colors text-left text-[var(--theme-text-primary)]"><NotepadIcon /><span>Notepad</span></button></li>
                            <li><button onClick={() => handleMenuClick(onPhotoManagerClick)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[var(--theme-bg)] transition-colors text-left text-[var(--theme-text-primary)]"><PhotoIcon /><span>Photo Manager</span></button></li>
                            <li><button onClick={() => handleMenuClick(onImageToolClick)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[var(--theme-bg)] transition-colors text-left text-[var(--theme-text-primary)]"><ImageIcon /><span>Image Squarer</span></button></li>
                            <li><button onClick={() => handleMenuClick(onRecordingsClick)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[var(--theme-bg)] transition-colors text-left text-[var(--theme-text-primary)]"><MicIcon /><span>Recordings</span></button></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
});