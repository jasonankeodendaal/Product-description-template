import React from 'react';

export const AndroidIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="android-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3DDC84" />
                <stop offset="100%" stopColor="#37B370" />
            </linearGradient>
            <filter id="android-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
            </filter>
        </defs>
        <g filter="url(#android-shadow)">
            <path
                fill="url(#android-grad)"
                d="M17.6,12.2h-2.4v-2c0-0.3-0.2-0.5-0.5-0.5h-1.3c-0.3,0-0.5,0.2-0.5,0.5v2H10V9.8c0-0.3-0.2-0.5-0.5-0.5H8.2 c-0.3,0-0.5,0.2-0.5,0.5v2.3H5.4c-0.3,0-0.5,0.2-0.5,0.5v1.3c0,0.3,0.2,0.5,0.5,0.5h2.3v3.8c0,0.3,0.2,0.5,0.5,0.5h1.3 c0.3,0,0.5-0.2,0.5-0.5V14h2.9v3.8c0,0.3,0.2,0.5,0.5,0.5h1.3c0.3,0,0.5-0.2,0.5-0.5v-3.8h2.3c0.3,0,0.5-0.2,0.5-0.5v-1.3 C18.1,12.4,17.9,12.2,17.6,12.2z"
            />
            <path
                fill="#FFFFFF"
                d="M8.7,8.6c-0.4,0-0.8-0.4-0.8-0.8c0-0.4,0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8C9.5,8.2,9.1,8.6,8.7,8.6z"
            />
            <path
                fill="#FFFFFF"
                d="M14.3,8.6c-0.4,0-0.8-0.4-0.8-0.8c0-0.4,0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8 C15.1,8.2,14.7,8.6,14.3,8.6z"
            />
            <path
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.5"
                strokeLinecap="round"
                d="M6.5,5.5 L4.5,3.5 M16.5,5.5 L18.5,3.5"
            />
        </g>
    </svg>
);