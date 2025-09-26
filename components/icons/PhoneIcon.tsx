import React from 'react';

export const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="phoneRealistic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#D6D6D6" />
            </linearGradient>
            <filter id="phoneRealisticShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#phoneRealisticShadow)">
            <path fill="url(#phoneRealistic)" d="M19.98 15.37c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.5 1.5A15.253 15.253 0 0 1 7.35 8.06l1.5-1.5c.31-.31.36-.76.24-1.17C8.74 4.26 8.53 3.08 8.53 1.85a1 1 0 0 0-1-1H4.01a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.02a1 1 0 0 0-1-1z" />
        </g>
    </svg>
);
