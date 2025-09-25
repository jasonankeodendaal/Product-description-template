import React from 'react';
import { CreatorDetails } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface AuthBrandingPanelProps {
    creator: CreatorDetails;
}

const ContactInfo: React.FC<{ href: string; icon: React.ReactNode; text: string; }> = ({ href, icon, text }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
        {icon}
        <span>{text}</span>
    </a>
);

export const AuthBrandingPanel: React.FC<AuthBrandingPanelProps> = ({ creator }) => {
    return (
        <div className="hidden md:flex w-1/2 bg-gray-900/50 p-8 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-grid-orange-500/10 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_70%)]"></div>
            
            <div className="z-10">
                {creator.logoSrc && (
                    <img src={creator.logoSrc} alt={`${creator.name} Logo`} className="h-24 w-auto logo-glow-effect mb-4" />
                )}
                <h1 className="text-4xl font-bold text-white">{creator.name}</h1>
                <p className="text-lg text-orange-300/80 mt-1">{creator.slogan}</p>
            </div>

            <div className="z-10 space-y-3">
                {creator.tel && (
                    <ContactInfo href={`tel:${creator.tel}`} icon={<PhoneIcon />} text={creator.tel} />
                )}
                {creator.email && (
                    <ContactInfo href={`mailto:${creator.email}`} icon={<MailIcon />} text={creator.email} />
                )}
                {creator.whatsapp && (
                    <ContactInfo href={creator.whatsapp} icon={<WhatsappIcon className="h-5 w-5" />} text="WhatsApp" />
                )}
                {creator.whatsapp2 && (
                    <ContactInfo href={creator.whatsapp2} icon={<WhatsappIcon className="h-5 w-5" />} text="WhatsApp 2" />
                )}
            </div>
        </div>
    );
};