import React from 'react';

export const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="search-handle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78746F"/>
                <stop offset="100%" stopColor="#3F3C3A"/>
            </linearGradient>
             <radialGradient id="search-lens-grad" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
            <filter id="search-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#search-shadow)">
            <path d="M16.65 16.65L21 21" stroke="url(#search-handle-grad)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="11" cy="11" r="8" fill="#FFF" stroke="#78746F" strokeWidth="2.5"/>
            <circle cx="11" cy="11" r="7.5" fill="url(#search-lens-grad)"/>
        </g>
    </svg>
);