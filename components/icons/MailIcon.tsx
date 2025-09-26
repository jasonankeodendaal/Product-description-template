import React from 'react';

export const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="mailRealisticBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5F5F5"/>
                <stop offset="100%" stopColor="#E0E0E0"/>
            </linearGradient>
            <linearGradient id="mailRealisticFlap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="100%" stopColor="#F5F5F5"/>
            </linearGradient>
            <filter id="mailShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.15"/>
            </filter>
        </defs>
        <g filter="url(#mailShadow)">
            <path d="M22 8.44v9.56c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8.44l10 6.25L22 8.44z" fill="url(#mailRealisticBg)"/>
            <path d="M22 6.44l-10 6.25L2 6.44a2 2 0 0 1 1.7-.94h16.6c.6 0 1.1.4 1.1 1z" fill="url(#mailRealisticFlap)"/>
            <path d="M21.1 4H2.9C2.4 4 2 4.4 2 5v1.44l10 6.25L22 6.44V5c0-.6-.4-1-1-1z" fill="#000000" fillOpacity="0.05"/>
        </g>
    </svg>
);
