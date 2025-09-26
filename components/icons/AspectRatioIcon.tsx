import React from 'react';

export const AspectRatioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 12h10" />
        <path d="M10 9l-3 3 3 3" />
        <path d="M14 15l3-3-3-3" />
    </svg>
);