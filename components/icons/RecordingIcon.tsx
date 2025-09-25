import React from 'react';

export const RecordingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-orange)" />
                <stop offset="100%" stopColor="var(--theme-bright-orange)" />
            </linearGradient>
        </defs>
        <g fill="url(#g)">
            <path d="M12,15a4,4,0,0,0,4-4V5A4,4,0,0,0,8,5v6A4,4,0,0,0,12,15Z"/>
            <path d="M19,11a1,1,0,0,0-1,1,6,6,0,0,1-12,0,1,1,0,0,0-2,0,8,8,0,0,0,7,7.93V22H11a1,1,0,0,0,0,2h8a1,1,0,0,0,0-2H15V19.93A8,8,0,0,0,19,11Z"/>
        </g>
    </svg>
);