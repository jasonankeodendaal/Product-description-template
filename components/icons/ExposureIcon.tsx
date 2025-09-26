import React from 'react';

export const ExposureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 18V6" />
        <path d="M15 9l-3-3-3 3" />
        <path d="M9 15l3 3 3-3" />
    </svg>
);