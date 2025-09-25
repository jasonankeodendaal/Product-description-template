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

const ContactLink: React.FC<{ href: string; icon: React.ReactNode; text: string; }> = ({ href, icon, text }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full max-w-xs flex items-center justify-center gap-3 text-lg text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-6 py-3 transition-all duration-200 transform hover:scale-105 hover:border-orange-500/50"
    >
        {icon}
        <span className="font-semibold">{text}</span>
    </a>
);


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
        className={`bg-gray-900/50 backdrop-blur-xl w-full max-w-lg rounded-t-2xl md:rounded-xl shadow-2xl border-t-2 md:border border-orange-500/30 relative overflow-hidden ${isClosing ? 'creator-modal-animate-out' : 'creator-modal-animate-in'}`}
      >
        <div className="absolute inset-0 -z-10 bg-grid-orange-500/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"></div>
        <div className="p-8 text-center">
            {creator.logoSrc && (
            <img src={creator.logoSrc} alt={`${creator.name} logo`} className="h-32 w-32 mx-auto rounded-full object-cover border-4 border-orange-500/50 p-1 shadow-lg" />
            )}
            <h2 className="text-4xl font-bold text-white mt-4">{creator.name}</h2>
            <p className="text-orange-300/80 mt-1 text-lg font-light">{creator.slogan}</p>
            
            <div className="mt-8 pt-6 border-t border-orange-500/20 flex flex-col items-center gap-3">
                 {creator.tel && (
                    <ContactLink href={`tel:${creator.tel}`} icon={<PhoneIcon className="h-5 w-5" />} text={creator.tel} />
                )}
                {creator.email && (
                    <ContactLink href={`mailto:${creator.email}`} icon={<MailIcon className="h-5 w-5" />} text={creator.email} />
                )}
                {creator.whatsapp && (
                    <ContactLink href={creator.whatsapp} icon={<WhatsappIcon className="h-5 w-5" />} text="WhatsApp" />
                )}
                {creator.whatsapp2 && (
                    <ContactLink href={creator.whatsapp2} icon={<WhatsappIcon className="h-5 w-5" />} text="WhatsApp 2" />
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
