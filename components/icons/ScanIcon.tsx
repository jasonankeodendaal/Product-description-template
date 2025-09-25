import React from 'react';

export const ScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
         <defs>
            <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-bright-orange)" />
                <stop offset="100%" stopColor="var(--theme-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#icon-grad)" d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 0v10h2V7c0-2.2-1.8-4-4-4H5C2.8 3 1 4.8 1 7v10h2V7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2zM7 12h10v1H7v-1z"/>
    </svg>
);