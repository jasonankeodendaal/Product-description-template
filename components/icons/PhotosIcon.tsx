import React from 'react';

export const PhotosIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                .photo-1, .photo-2, .photo-3 {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-origin: center;
                }
                .group:hover .photo-1 { transform: translate(-2px, -2px) rotate(-5deg) scale(1.05); }
                .group:hover .photo-2 { transform: translate(2px, -2px) rotate(5deg) scale(1.05); }
                .group:hover .photo-3 { transform: translate(0px, 2px) rotate(0deg) scale(1.05); }
            `}
        </style>
        <defs>
            <filter id="photo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
            <linearGradient id="photo-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB"/>
                <stop offset="100%" stopColor="#4682B4"/>
            </linearGradient>
        </defs>
        <g filter="url(#photo-shadow)">
            <g className="photo-3" transform="rotate(-2, 12, 12)">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#E9E2D5"/>
                <rect x="7" y="7" width="10" height="8" fill="url(#photo-fill-grad)"/>
            </g>
            <g className="photo-2" transform="rotate(5, 12, 12)">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#E9E2D5"/>
                <rect x="7" y="7" width="10" height="8" fill="url(#photo-fill-grad)"/>
            </g>
            <g className="photo-1" transform="rotate(-5, 12, 12)">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#FFFFFF"/>
                <rect x="7" y="7" width="10" height="8" fill="url(#photo-fill-grad)"/>
            </g>
        </g>
    </svg>
);