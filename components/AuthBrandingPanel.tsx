import React from 'react';
import { CreatorDetails } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface AuthBrandingPanelProps {
    creator: CreatorDetails;
}

const ContactButton: React.FC<{ href: string; icon: React.ReactNode; text: string; }> = ({ href, icon, text }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="auth-contact-button flex items-center justify-center gap-2 text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-all duration-200 transform hover:scale-105 hover:border-orange-500/50"
    >
        {icon}
        <span className="font-semibold">{text}</span>
    </a>
);

export const AuthBrandingPanel: React.FC<AuthBrandingPanelProps> = ({ creator }) => {
    return (
        <div className="auth-branding-panel flex w-full md:w-1/2 bg-gray-900/50 p-6 md:p-12 flex-col justify-center gap-10 relative overflow-hidden text-center min-h-[220px] md:min-h-0">
            <div className="absolute inset-0 -z-10 bg-grid-orange-500/10 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_70%)]"></div>
            
            <div className="z-10">
                {creator.logoSrc && (
                    <img src={creator.logoSrc} alt={`${creator.name} Logo`} className="h-20 sm:h-24 md:h-28 w-auto logo-glow-effect mb-4 mx-auto" />
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{creator.name}</h1>
                <p className="text-lg sm:text-xl text-orange-300/80 mt-2">{creator.slogan}</p>
            </div>

            <div className="auth-contact-button-container z-10 flex flex-row flex-wrap items-center justify-center gap-3">
                {creator.tel && (
                    <ContactButton href={`tel:${creator.tel}`} icon={<PhoneIcon className="h-5 w-5"/>} text={creator.tel} />
                )}
                {creator.email && (
                    <ContactButton href={`mailto:${creator.email}`} icon={<MailIcon className="h-5 w-5"/>} text={creator.email} />
                )}
                {creator.whatsapp && (
                    <ContactButton href={creator.whatsapp} icon={<WhatsappIcon className="h-5 w-5" />} text="WhatsApp" />
                )}
                {creator.whatsapp2 && (
                    <ContactButton href={creator.whatsapp2} icon={<WhatsappIcon className="h-5 w-5" />} text="WhatsApp 2" />
                )}
            </div>
        </div>
    );
};