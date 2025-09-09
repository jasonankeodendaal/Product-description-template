import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../constants';
import { InfoIcon } from './icons/InfoIcon';
import { XIcon } from './icons/XIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface CreatorInfoProps {
  settings: SiteSettings;
}

export const CreatorInfo: React.FC<CreatorInfoProps> = React.memo(({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const hasCreatorInfo = settings.creator?.name || settings.creator?.tel || settings.creator?.email || settings.creator?.whatsapp || settings.creator?.whatsapp2;

  if (!hasCreatorInfo) {
    return null;
  }
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false); // Reset for next open
    }, 300); // Match animation duration (0.3s)
  };

  const ActionButton: React.FC<{ href: string; icon: React.ReactNode; label: string; isExternal?: boolean; }> = ({ href, icon, label, isExternal }) => (
    <a 
      href={href}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      className="flex-1 min-w-[90px] flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-[var(--theme-bg)]/50 hover:bg-[var(--theme-bg)] transition-all transform hover:scale-105"
    >
      {icon}
      <span className="text-[var(--theme-text-primary)] font-semibold">{label}</span>
    </a>
  );
  
  const animationClass = isClosing ? 'creator-modal-animate-out' : 'creator-modal-animate-in';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-[var(--theme-yellow)] hover:opacity-90 text-[var(--theme-bg)] font-bold rounded-full py-2 px-4 shadow-lg transition-transform transform hover:scale-110 flex items-center gap-2"
        aria-label="Show creator information"
      >
        <InfoIcon />
        <span className="text-sm">Creator</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center" 
          aria-modal="true" 
          role="dialog"
          onClick={handleClose}
        >
          <div 
            className={`bg-gradient-to-b from-[var(--theme-card-bg)] to-[var(--theme-dark-bg)] w-full md:w-full max-w-full md:max-w-sm rounded-t-2xl md:rounded-xl shadow-2xl border-t border-x md:border border-[var(--theme-border)]/50 relative text-center overflow-hidden ${animationClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Draggable area for mobile swipe-down hint */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 flex justify-center items-center md:hidden">
              <div className="w-10 h-1.5 bg-[var(--theme-border)]/50 rounded-full"></div>
            </div>

            <div className="h-28 bg-black/20 relative">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-10">
                    <defs>
                        <pattern id="creator-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                        <path d="M 0 10 L 10 0 M 10 20 L 20 10" stroke="var(--theme-yellow)" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#creator-pattern)" />
                </svg>
            </div>
            
            <div className="absolute top-[70px] left-1/2 -translate-x-1/2">
              {settings.creator.logoSrc ? (
                  <img src={settings.creator.logoSrc} alt="Creator Logo" className="h-24 w-24 object-cover rounded-full bg-[var(--theme-bg)] p-1 border-4 border-[var(--theme-card-bg)] shadow-lg" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] text-3xl font-bold border-4 border-[var(--theme-card-bg)] shadow-lg">
                  {settings.creator.name ? settings.creator.name.charAt(0) : '?'}
                </div>
              )}
            </div>
            
            {/* Increased bottom padding for mobile safe area */}
            <div className="pt-16 pb-8 px-6">
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mt-4">{settings.creator.name}</h2>
                {settings.creator.slogan && <p className="text-[var(--theme-text-secondary)] text-sm mt-1">{settings.creator.slogan}</p>}
                
                <div className="mt-6 border-t border-[var(--theme-border)]/50 pt-6 flex flex-wrap justify-center gap-3 text-sm">
                    {settings.creator.tel && <ActionButton href={`tel:${settings.creator.tel}`} icon={<PhoneIcon />} label="Call" />}
                    {settings.creator.email && <ActionButton href={`mailto:${settings.creator.email}`} icon={<MailIcon />} label="Email" />}
                    {settings.creator.whatsapp && <ActionButton href={settings.creator.whatsapp.startsWith('http') ? settings.creator.whatsapp : `https://wa.me/${settings.creator.whatsapp.replace(/\D/g, '')}`} icon={<WhatsappIcon className="h-5 w-5 text-[var(--theme-text-secondary)]" />} label="WhatsApp" isExternal />}
                    {settings.creator.whatsapp2 && <ActionButton href={settings.creator.whatsapp2.startsWith('http') ? settings.creator.whatsapp2 : `https://wa.me/${settings.creator.whatsapp2.replace(/\D/g, '')}`} icon={<WhatsappIcon className="h-5 w-5 text-[var(--theme-text-secondary)]" />} label="WhatsApp 2" isExternal />}
                </div>
            </div>
            
            <button onClick={handleClose} className="absolute top-3 right-3 text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)] bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors" aria-label="Close">
              <XIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
});