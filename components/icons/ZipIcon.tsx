import React from 'react';

export const ZipIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="zip-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6B7280" />
                <stop offset="100%" stopColor="#4B5563" />
            </linearGradient>
            <linearGradient id="zip-grad-tag" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9FAFB" />
                <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
            <filter id="zip-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
            </filter>
        </defs>
        <g filter="url(#zip-shadow)">
            <path d="M20 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l5 5z" fill="url(#zip-grad-bg)" />
            <path d="M13 2v5h5" fill="#9CA3AF" />
            <rect x="8" y="11" width="8" height="6" rx="1" fill="url(#zip-grad-tag)" />
            <path d="M12 11v-1h-1v1h-1v1h1v1h1v-1h1v1h1v-1h-1z" fill="#4B5563" />
        </g>
    </svg>
);