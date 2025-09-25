import React from 'react';

export const PhotosToolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="photo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="photo-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#photo-shadow)" className="holographic-effect">
            <path d="M19.82,6.36,18.3,4.45A3,3,0,0,0,16,3H8A3,3,0,0,0,5.7,4.45L4.18,6.36A3,3,0,0,0,2,9V18a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V9A3,3,0,0,0,19.82,6.36ZM12,17a5,5,0,1,1,5-5A5,5,0,0,1,12,17Z" fill="url(#photo-grad-1)"/>
            <circle cx="12" cy="12" r="3" fill="url(#photo-grad-1)"/>
        </g>
    </svg>
);
