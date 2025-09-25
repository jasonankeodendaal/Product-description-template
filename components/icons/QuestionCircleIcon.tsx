import React from 'react';

export const QuestionCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-orange)" />
                <stop offset="100%" stopColor="var(--theme-bright-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#g)" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
        <path fill="url(#g)" d="M12,13a1,1,0,0,0,1-1V11a3,3,0,0,0-3-3H9a1,1,0,0,0,0,2h1a1,1,0,0,1,1,1v1A1,1,0,0,0,12,13Zm-1,3a1,1,0,1,0,1,1A1,1,0,0,0,11,16Z"/>
    </svg>
);