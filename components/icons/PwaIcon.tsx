import React from 'react';

export const PwaIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="pwa-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1F2937" />
                <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="pwa-grad-plus" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="pwa-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
            </filter>
        </defs>
        <g filter="url(#pwa-shadow)">
            <rect width="20" height="20" x="2" y="2" rx="4" fill="url(#pwa-grad-bg)" />
            <g transform="translate(4 4) scale(0.75)">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <circle cx="17.5" cy="17.5" r="5.5" fill="url(#pwa-grad-plus)" stroke="white" strokeWidth="1.5" />
            <path d="M17.5 15 v5 M15 17.5 h5" stroke="black" strokeWidth="2" strokeLinecap="round"/>
        </g>
    </svg>
);