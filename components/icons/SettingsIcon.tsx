import React from 'react';

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-bright-orange)" />
                <stop offset="100%" stopColor="var(--theme-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#icon-grad)" d="M19.4,12.5c0.2-0.5,0.2-1,0-1.5l1.9-1.9c0.5-0.5,0.5-1.2,0-1.7l-2-2c-0.5-0.5-1.2-0.5-1.7,0l-1.9,1.9 c-0.5-0.2-1-0.2-1.5,0L10.3,6c-0.5-0.5-1.2-0.5-1.7,0l-2,2c-0.5,0.5-0.5,1.2,0,1.7l1.9,1.9c-0.2,0.5-0.2,1,0,1.5L6,13.7 c-0.5,0.5-0.5,1.2,0,1.7l2,2c0.5,0.5,1.2,0.5,1.7,0l1.9-1.9c0.5,0.2,1,0.2,1.5,0l1.9,1.9c0.5,0.5,1.2,0.5,1.7,0l2-2 c0.5-0.5,0.5-1.2,0-1.7L19.4,12.5z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S13.93,15.5,12,15.5z"/>
    </svg>
);
