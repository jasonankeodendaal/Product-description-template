import React from 'react';

export const PublishToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="pub-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="pub-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#pub-shadow)" className="holographic-effect">
            <path d="M17 18c-2 0-2-2-4-2s-2 2-4 2" fill="url(#pub-grad-1)" />
            <line x1="8" y1="14" x2="8" y2="14" stroke="url(#pub-grad-1)" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="16" y1="14" x2="16" y2="14" stroke="url(#pub-grad-1)" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M14 5L12 3 10 5" fill="none" stroke="url(#pub-grad-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 8a7 7 0 0 0-14 0" fill="none" stroke="url(#pub-grad-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" fill="url(#pub-grad-1)" />
        </g>
    </svg>
);
