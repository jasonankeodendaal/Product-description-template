import React from 'react';

export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-orange)" />
                <stop offset="100%" stopColor="var(--theme-bright-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#g)" d="M12.71,2.29a1,1,0,0,0-1.42,0l-9,9A1,1,0,0,0,3,13H4v7a1,1,0,0,0,1,1H9V16a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v5h4a1,1,0,0,0,1-1V13h1a1,1,0,0,0,.71-1.71Z"/>
    </svg>
);