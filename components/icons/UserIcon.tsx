import React from 'react';

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-bright-orange)" />
                <stop offset="100%" stopColor="var(--theme-orange)" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="8" r="4" fill="url(#icon-grad)" />
        <path d="M12,14c-3.86,0-7,3.14-7,7v1h14v-1C19,17.14,15.86,14,12,14z" fill="url(#icon-grad)" />
    </svg>
);