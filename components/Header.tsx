import React, { useState, useRef, useEffect } from 'react';
import { SiteSettings } from '../constants';
import { CompanyInfoDropdown } from './CompanyInfoDropdown';
import { CloudIcon } from './icons/CloudIcon';

interface HeaderProps {
  siteSettings: SiteSettings;
  isApiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(({ 
    siteSettings,
    isApiConnected
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
    <header className="bg-[var(--theme-card-bg)]/80 backdrop-blur-sm border-b border-[var(--theme-border)]/50 sticky top-0 z-20 flex-shrink-0">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center h-[76px]">
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--theme-green)] rounded-md p-1"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
            {siteSettings.logoSrc ? (
                <img src={siteSettings.logoSrc} alt="Company Logo" className="h-14 w-auto rounded-md" />
            ) : (
                <div className="h-14 w-14 rounded-md bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-xl font-bold">
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
        </div>
      </div>
    </header>
  );
});