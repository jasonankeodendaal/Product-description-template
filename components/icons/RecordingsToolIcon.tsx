import React from 'react';

export const RecordingsToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="rec-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
            <filter id="rec-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#rec-shadow)" className="holographic-effect">
            <path d="M12,15a4,4,0,0,0,4-4V5A4,4,0,0,0,8,5v6A4,4,0,0,0,12,15Z" fill="url(#rec-grad-1)"/>
            <path d="M19,11a1,1,0,0,0-1,1,6,6,0,0,1-12,0,1,1,0,0,0-2,0,8,8,0,0,0,7,7.93V22H11a1,1,0,0,0,0,2h8a1,1,0,0,0,0-2H15V19.93A8,8,0,0,0,19,11Z" fill="url(#rec-grad-1)"/>
        </g>
    </svg>
);
