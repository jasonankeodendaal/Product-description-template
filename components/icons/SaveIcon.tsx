import React from 'react';

export const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                .save-icon-main { transition: transform 0.15s ease-out; }
                .group:hover .save-icon-main { transform: translateY(1px); }
            `}
        </style>
        <defs>
            <linearGradient id="save-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4CAF50"/>
                <stop offset="100%" stopColor="#60814A"/>
            </linearGradient>
            <filter id="save-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g className="save-icon-main" filter="url(#save-shadow)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="url(#save-grad)" stroke="#FFFFFF" strokeWidth="1.5"></path>
            <polyline points="17 21 17 13 7 13 7 21" fill="#3F3C3A" stroke="#FFFFFF" strokeWidth="1.5"></polyline>
            <polyline points="7 3 7 8 15 8" fill="#BDC3C7" stroke="#FFFFFF" strokeWidth="1.5"></polyline>
        </g>
    </svg>
);