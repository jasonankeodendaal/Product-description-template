import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-orange)" />
                <stop offset="100%" stopColor="var(--theme-bright-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#g)" d="M12,0L9.9,8.1,0,10.2,8.1,12.3,10.2,22.5l2.1-8.1L22.5,12.3l-8.1-2.1Z" transform="translate(0.75 0.75) scale(0.9)"/>
    </svg>
);