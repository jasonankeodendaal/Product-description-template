import React from 'react';

export const TourToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="tour-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="tour-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#tour-shadow)" className="holographic-effect">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.18-.65-.87-2.14-1.42-2.95-1.92s-1.42-2.3-1.92-2.95c-.87-.65-2.32-.6-3.18.05.79-4.48 4.48-6.85 4.48-6.85s2.37 3.69 6.85 4.48c-.65.87-.6 2.32.05 3.18.87.65 2.3.71 3.18.05.84-.71 1.42-2.14 1.92-2.95s2.3-.5 2.95-1.92c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.18.05-.87-.65-1.42-2.14-1.92-2.95s-2.3-1.42-2.95-1.92c-.65-.87-2.14-.6-3.18.05z" fill="url(#tour-grad-1)"/>
        </g>
    </svg>
);
