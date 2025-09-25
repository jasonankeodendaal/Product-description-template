
import React from 'react';

export const RecordingsToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-rec-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" />
                <stop offset="100%" stopColor="#E0E0E0" />
            </linearGradient>
            <linearGradient id="grad-rec-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="26" fill="#FFF" opacity="0.1" />
        <path d="M12,32 L20,24 L24,36 L32,20 L40,44 L44,28 L52,32" stroke="url(#grad-rec-1)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12,32 L20,24 L24,36 L32,20 L40,44 L44,28 L52,32" stroke="url(#grad-rec-2)" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(2px)' }} />
    </svg>
);