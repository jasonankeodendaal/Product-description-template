import React, { useState, useRef, useEffect } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { MicIcon } from './icons/MicIcon';
import { SiteSettings } from '../constants';
import { CompanyInfoDropdown } from './CompanyInfoDropdown';
import { ImageIcon } from './icons/ImageIcon';

interface HeaderProps {
  onSettingsClick: () => void;
  onRecordingsClick: () => void;
  onImageToolClick: () => void;
  siteSettings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onSettingsClick, onRecordingsClick, onImageToolClick, siteSettings }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
            {siteSettings.logoSrc ? (
                <img src={siteSettings.logoSrc} alt="Company Logo" className="h-12 w-auto rounded-md" />
            ) : (
                <div className="h-12 w-12 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 text-xl font-bold">
                    {siteSettings.companyName ? siteSettings.companyName.charAt(0) : '?'}
                </div>
            )}
            <span className="text-xl font-semibold text-slate-200">{siteSettings.companyName}</span>
            </button>
            {isDropdownOpen && (
                <CompanyInfoDropdown settings={siteSettings} onClose={() => setIsDropdownOpen(false)} />
            )}
        </div>
        <div className="flex items-center gap-2">
            <button 
              onClick={onImageToolClick} 
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Open Image Tool"
            >
              <ImageIcon />
            </button>
            <button 
              onClick={onRecordingsClick} 
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Open Recordings"
            >
              <MicIcon />
            </button>
            <button 
              onClick={onSettingsClick} 
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Open Settings"
            >
              <SettingsIcon />
            </button>
        </div>
      </div>
    </header>
  );
});