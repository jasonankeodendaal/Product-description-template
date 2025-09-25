import React from 'react';

export const NotepadToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="note-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter id="note-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#note-shadow)" className="holographic-effect">
            <path d="M15,2H9A3,3,0,0,0,6,5V19a3,3,0,0,0,3,3h6a3,3,0,0,0,3-3V5A3,3,0,0,0,15,2Zm0,17H9a1,1,0,0,1-1-1V5A1,1,0,0,1,9,4h6a1,1,0,0,1,1,1V18A1,1,0,0,1,15,19Z" fill="url(#note-grad-1)"/>
            <path d="M10,8h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2Z" fill="url(#note-grad-1)"/>
            <path d="M14,10H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z" fill="url(#note-grad-1)"/>
            <path d="M14,14H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z" fill="url(#note-grad-1)"/>
        </g>
    </svg>
);
