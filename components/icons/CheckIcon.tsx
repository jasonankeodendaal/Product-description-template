

import React from 'react';

// FIX: Update component props to accept all standard SVG attributes for flexibility.
export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" {...props}>
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);