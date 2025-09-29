import React from 'react';

// FIX: Update component props to accept all standard SVG attributes for flexibility.
export const SnowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 17.58A5 5 0 0 0 15.07 15H9.93A5 5 0 0 0 6 21.07" />
        <path d="M8 17.5V14.5" />
        <path d="M12 19.5V16.5" />
        <path d="M16 17.5V14.5" />
        <path d="m10.5 15.5-1-1" />
        <path d="m14.5 15.5-1-1" />
        <path d="m10.5 19.5-1-1" />
        <path d="m14.5 19.5-1-1" />
        <path d="M12 12V3" />
        <path d="m15 6-3-3-3 3" />
        <path d="M12 12h5" />
        <path d="m19 9-2 3 2 3" />
        <path d="M12 12H7" />
        <path d="m5 9 2 3-2 3" />
    </svg>
);