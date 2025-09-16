import React from 'react';

export const LibraryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                .folder-top { transition: transform 0.2s ease-out; }
                .group:hover .folder-top { transform: translateY(-2px); }
            `}
        </style>
        <defs>
            <linearGradient id="folder-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5B86B3"/>
                <stop offset="100%" stopColor="#3A6187"/>
            </linearGradient>
            <linearGradient id="folder-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A79A7"/>
                <stop offset="100%" stopColor="#2F5070"/>
            </linearGradient>
            <filter id="folder-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#folder-shadow)">
            <path d="M4 8V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="url(#folder-grad-2)" transform="translate(0, 2)"/>
            <path className="folder-top" d="M4 7V5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="url(#folder-grad-1)"/>
        </g>
    </svg>
);