import React from 'react';

export const MagicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                .magic-sparkle {
                    transform-origin: center;
                    transition: transform 0.3s ease;
                }
                @keyframes magic-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.15); opacity: 0.8; }
                }
                .group:hover .magic-sparkle {
                    animation: magic-pulse 1s ease-in-out infinite;
                    transform: rotate(15deg);
                }
            `}
        </style>
        <defs>
            <linearGradient id="magic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047"/>
                <stop offset="100%" stopColor="#F59E0B"/>
            </linearGradient>
            <filter id="magic-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#F59E0B" floodOpacity="0.7"/>
            </filter>
        </defs>
        <g className="magic-sparkle" filter="url(#magic-shadow)" fill="url(#magic-grad)" stroke="#FFF" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.5 4.5-4.5 1.5 4.5 1.5 1.5 4.5 1.5-4.5 4.5-1.5-4.5-1.5z"/>
            <path d="M5 21l0.5-1.5-1.5-0.5 1.5-0.5-0.5-1.5 0.5 1.5 1.5 0.5-1.5 0.5z" />
            <path d="M19 21l0.5-1.5-1.5-0.5 1.5-0.5-0.5-1.5 0.5 1.5 1.5 0.5-1.5 0.5z" />
        </g>
    </svg>
);