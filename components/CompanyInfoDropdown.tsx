import React from 'react';
import { SiteSettings } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface CompanyInfoDropdownProps {
  settings: SiteSettings;
  onClose: () => void;
}

export const CompanyInfoDropdown: React.FC<CompanyInfoDropdownProps> = ({ settings, onClose }) => {
  return (
    <div 
        className="absolute top-full mt-2 w-80 bg-[var(--theme-card-bg)] rounded-lg shadow-xl border border-[var(--theme-border)] z-30 origin-top-left animate-fade-in-down"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside from closing the dropdown
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {settings.logoSrc && (
            <img src={settings.logoSrc} alt="Company Logo" className="h-12 w-12 object-contain rounded-md bg-[var(--theme-bg)] p-1" />
          )}
          <div>
            <h2 className="text-md font-bold text-[var(--theme-blue)]">{settings.companyName}</h2>
            <p className="text-[var(--theme-text-secondary)] text-xs">{settings.slogan}</p>
          </div>
        </div>

        {(settings.tel || settings.email || settings.website) && (
          <div className="space-y-3 mt-4 border-t border-[var(--theme-border)]/50 pt-4">
            {settings.tel && (
              <a href={`tel:${settings.tel}`} className="flex items-center gap-3 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-blue)] transition-colors">
                <PhoneIcon /> <span>{settings.tel}</span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-blue)] transition-colors">
                <MailIcon /> <span>{settings.email}</span>
              </a>
            )}
            {settings.website && (
              <a href={settings.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-blue)] transition-colors">
                <GlobeIcon /> <span>Visit Website</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};