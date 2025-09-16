import React from 'react';

export const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                .trash-lid {
                    transition: transform 0.2s ease-in-out;
                    transform-origin: 18px 5px;
                }
                .group:hover .trash-lid {
                    transform: rotate(-20deg);
                }
            `}
        </style>
        <defs>
            <linearGradient id="trash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D9534F"/>
                <stop offset="50%" stopColor="#AF412C"/>
                <stop offset="100%" stopColor="#D9534F"/>
            </linearGradient>
            <filter id="trash-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3"/>
            </filter>
        </defs>
        <g filter="url(#trash-shadow)" fill="url(#trash-grad)" stroke="#FFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path className="trash-lid" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </g>
    </svg>
);