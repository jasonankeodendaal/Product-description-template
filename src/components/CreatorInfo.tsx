
import React, { useState, useEffect } from 'react';
import { CreatorDetails } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { XIcon } from './icons/XIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface CreatorInfoProps {
  onClose: () => void;
  creatorDetails: CreatorDetails;
}

export const CreatorInfo: React.FC<CreatorInfoProps> = ({ onClose, creatorDetails }) => {
  const [isClosing, setIsClosing] = useState(false);
  const creator = creatorDetails;

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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`bg-gray-900/80 backdrop-blur-xl w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden ${isClosing ? 'creator-modal-animate-out' : 'creator-modal-animate-in'}`}
      >
        <div className="p-6">
            <div className="flex items-center gap-4">
                 {creator.logoSrc && (
                    <img src={creator.logoSrc} alt={`${creator.name} logo`} className="h-12 w-12 object-contain rounded-lg" />
                )}
                <div>
                    <h2 className="text-lg font-bold text-white">{creator.name}</h2>
                    <p className="text-orange-300/80 text-sm">{creator.slogan}</p>
                </div>
            </div>
            
            <hr className="border-t border-white/10 my-6" />
            
            <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                 {creator.tel && (
                    <a href={`tel:${creator.tel}`} className="flex items-center gap-2 text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors hover:border-orange-500/50">
                        <PhoneIcon className="w-5 h-5"/>
                        <span className="font-semibold">{creator.tel}</span>
                    </a>
                )}
                {creator.email && (
                     <a href={`mailto:${creator.email}`} className="flex items-center gap-2 text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors hover:border-orange-500/50">
                        <MailIcon className="w-5 h-5"/>
                        <span className="font-semibold">{creator.email}</span>
                    </a>
                )}
                 {creator.whatsapp && (
                     <a href={creator.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors hover:border-orange-500/50">
                        <WhatsappIcon className="w-5 h-5"/>
                        <span className="font-semibold">WhatsApp</span>
                    </a>
                )}
                 {creator.whatsapp2 && (
                     <a href={creator.whatsapp2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors hover:border-orange-500/50">
                        <WhatsappIcon className="w-5 h-5"/>
                        <span className="font-semibold">WhatsApp 2</span>
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
