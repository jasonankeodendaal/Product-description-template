import React, { useState } from 'react';
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

  const hasCreatorInfo = settings.creator?.name || settings.creator?.tel || settings.creator?.email || settings.creator?.whatsapp;

  if (!hasCreatorInfo) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-[var(--theme-yellow)] hover:opacity-90 text-slate-900 font-bold rounded-full py-2 px-4 shadow-lg transition-transform transform hover:scale-110 flex items-center gap-2"
        aria-label="Show creator information"
      >
        <InfoIcon />
        <span className="text-sm">Creator</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div 
            className="bg-[var(--theme-card-bg)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--theme-border)] relative p-8 text-center animate-modal-scale-in fixed top-1/2 left-1/2"
            style={{ transform: 'translate(-50%, -50%)' }} // Ensures perfect centering with animation
          >
            
            <div className="flex flex-col items-center -mt-20">
              {settings.creator.logoSrc ? (
                  <img src={settings.creator.logoSrc} alt="Creator Logo" className="h-24 w-24 object-cover rounded-full bg-slate-700 p-1 border-4 border-[var(--theme-card-bg)] shadow-lg" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-3xl font-bold border-4 border-[var(--theme-card-bg)] shadow-lg">
                  {settings.creator.name ? settings.creator.name.charAt(0) : '?'}
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-100 mt-4">{settings.creator.name}</h2>
              {settings.creator.slogan && <p className="text-slate-400 text-sm mt-1">{settings.creator.slogan}</p>}
            </div>

             <div className="space-y-3 mt-6 border-t border-[var(--theme-border)] pt-6 text-left">
                {settings.creator.tel && (
                    <a href={`tel:${settings.creator.tel}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <PhoneIcon /> <span className="text-slate-300">{settings.creator.tel}</span>
                    </a>
                )}
                {settings.creator.email && (
                    <a href={`mailto:${settings.creator.email}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <MailIcon /> <span className="text-slate-300">{settings.creator.email}</span>
                    </a>
                )}
                {settings.creator.whatsapp && (
                    <a href={`https://wa.me/${settings.creator.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <WhatsappIcon className="h-5 w-5 text-slate-500" /> <span className="text-slate-300">Contact on WhatsApp</span>
                    </a>
                )}
             </div>
            
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300" aria-label="Close">
              <XIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
});