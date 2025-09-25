import React from 'react';

export const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-bright-orange)" />
                <stop offset="100%" stopColor="var(--theme-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#icon-grad)" d="M12,3C7.58,3,4,4.79,4,7v10c0,2.21,3.58,4,8,4s8-1.79,8-4V7C20,4.79,16.42,3,12,3z M12,8c-3.31,0-6-0.89-6-2s2.69-2,6-2s6,0.89,6,2S15.31,8,12,8z M18,12c0,1.1-2.69,2-6,2s-6-0.9-6-2v-1.5c1.1,0.83,3.38,1.5,6,1.5s4.9-0.67,6-1.5V12z M18,16c0,1.1-2.69,2-6,2s-6-0.9-6-2v-1.5c1.1,0.83,3.38,1.5,6,1.5s4.9-0.67,6-1.5V16z" />
    </svg>
);