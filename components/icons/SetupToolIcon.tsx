import React from 'react';

export const SetupToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="setup-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="setup-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#setup-shadow)" className="holographic-effect">
            <path d="M7 22h10v-2H7v2zm5-18L6 9.5V17h12V9.5L12 4zm-1.8 11.5c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2z" fill="url(#setup-grad-1)"/>
        </g>
    </svg>
);
