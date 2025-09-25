import React from 'react';

export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-orange)" />
                <stop offset="100%" stopColor="var(--theme-bright-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#g)" d="M19,2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V5A3,3,0,0,0,19,2Zm1,17a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4H19a1,1,0,0,1,1,1Z"/>
        <path fill="url(#g)" d="M16.29,9.29l-4,4a1,1,0,0,1-1.41,0l-2-2a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.41l2,2a3,3,0,0,0,4.24,0l4-4a1,1,0,1,0-1.41-1.41Z"/>
        <path fill="url(#g)" d="M8,11a2,2,0,1,0-2-2A2,2,0,0,0,8,11Z"/>
    </svg>
);