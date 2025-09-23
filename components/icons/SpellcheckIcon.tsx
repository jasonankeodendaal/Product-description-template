import React from 'react';

export const SpellcheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
        <path d="m3 21 6-6" />
        <path d="M5 12.5a7 7 0 0 1 14 0" />
        <path d="M12 21a7 7 0 0 0 7-7.5" />
        <path d="M12 3a7 7 0 0 0-7 7.5" />
        <path d="m14 6 2.5 2.5" />
        <path d="m14 8.5 2.5-2.5" />
    </svg>
);
