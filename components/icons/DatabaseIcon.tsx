import React from 'react';

export const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
        <style>{`
            @keyframes db-glow {
                0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
                50% { filter: drop-shadow(0 0 5px currentColor); }
            }
            .db-animate {
                animation: db-glow 3s ease-in-out infinite;
                color: var(--theme-green);
            }
        `}</style>
        <g className="db-animate">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
            <path d="M3 12A9 3 0 0 0 21 12"></path>
        </g>
    </svg>
);