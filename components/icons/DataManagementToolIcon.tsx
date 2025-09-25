import React from 'react';

export const DataManagementToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="data-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <filter id="data-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#data-shadow)" className="holographic-effect">
            <ellipse cx="12" cy="5" rx="9" ry="3" fill="url(#data-grad-1)"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="url(#data-grad-1)"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="url(#data-grad-1)"></path>
        </g>
    </svg>
);
