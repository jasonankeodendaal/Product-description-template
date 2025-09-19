import React, { useState, useEffect, useRef } from 'react';
import { CreatorDetails } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { XIcon } from './icons/XIcon';

interface CreatorInfoProps {
  creator: CreatorDetails;
  onClose: () => void;
}

export const CreatorInfo: React.FC<CreatorInfoProps> = ({ creator, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center" 
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-[var(--theme-card-bg)] w-full max-w-lg rounded-t-2xl md:rounded-xl shadow-2xl border-t-2 md:border border-[var(--theme-border)]/50 relative overflow-hidden ${isClosing ? 'creator-modal-animate-out' : 'creator-modal-animate-in'}`}
      >
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
                {creator.logoSrc && (
                <img src={creator.logoSrc} alt={`${creator.name} logo`} className="h-28 w-28 rounded-full object-cover border-4 border-[var(--theme-green)] p-1" />
                )}
                <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-[var(--theme-text-primary)]">{creator.name}</h2>
                <p className="text-[var(--theme-text-secondary)] mt-1 text-md">{creator.slogan}</p>
                </div>
            </div>
            <div className="mt-6 border-t border-[var(--theme-border)]/50 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {creator.tel && (
                <a href={`tel:${creator.tel}`} className="flex items-center gap-3 text-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-green)] transition-colors group">
                    <PhoneIcon /> <span>{creator.tel}</span>
                </a>
                )}
                {creator.email && (
                <a href={`mailto:${creator.email}`} className="flex items-center gap-3 text-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-green)] transition-colors group">
                    <MailIcon /> <span>{creator.email}</span>
                </a>
                )}
                {creator.whatsapp && (
                <a href={creator.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-green)] transition-colors group">
                    <WhatsappIcon className="h-5 w-5 text-current" /> <span>WhatsApp</span>
                </a>
                )}
                {creator.whatsapp2 && (
                <a href={creator.whatsapp2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-green)] transition-colors group">
                    <WhatsappIcon className="h-5 w-5 text-current" /> <span>WhatsApp 2</span>
                </a>
                )}
            </div>
        </div>
        <button onClick={handleClose} className="absolute top-4 right-4 text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
            <XIcon />
        </button>
      </div>
    </div>
  );
};
