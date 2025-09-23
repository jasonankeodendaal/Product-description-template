import React from 'react';

export const WaveformIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="100%" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M2 20H10L15 5L25 35L35 12L42 28L50 20H200" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);