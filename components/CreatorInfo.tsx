import React, { useState, useEffect } from 'react';
import { CreatorDetails } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { XIcon } from './icons/XIcon';

interface CreatorInfoProps {
  creator: CreatorDetails;
  onClose: () => void;
}

export const CreatorInfo: React.FC<CreatorInfoProps> = ({ creator, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

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
        className={`bg-gray-900/80 backdrop-blur-xl w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden ${isClosing ? 'creator-modal-animate-out' : 'animate-modal-scale-in'}`}
      >
        <div className="p-6">
            <div className="flex items-center gap-4">
                 {creator.logoSrc && (
                    <img src={creator.logoSrc} alt={`${creator.name} logo`} className="h-16 w-16 object-contain rounded-lg" />
                )}
                <div>
                    <h2 className="text-2xl font-bold text-white">{creator.name}</h2>
                    <p className="text-orange-300/80 text-sm">{creator.slogan}</p>
                </div>
            </div>
            
            <hr className="border-t border-white/10 my-6" />
            
            <div className="space-y-6">
                 {creator.tel && (
                    <div className="creator-contact-item">
                        <PhoneIcon />
                        <span>{creator.tel}</span>
                    </div>
                )}
                {creator.email && (
                    <div className="creator-contact-item">
                        <MailIcon />
                        <span>{creator.email}</span>
                    </div>
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