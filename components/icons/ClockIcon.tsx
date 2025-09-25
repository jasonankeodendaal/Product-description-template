import React from 'react';

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
        <style>{`
            @keyframes tick-tock {
                to { transform: rotate(360deg); }
            }
            .clock-second-hand {
                animation: tick-tock 60s steps(60, end) infinite;
                transform-origin: center;
                stroke: var(--theme-red);
            }
        `}</style>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
        <line x1="12" y1="12" x2="12" y2="7" className="clock-second-hand" strokeWidth="1"/>
    </svg>
);