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
            @keyframes data-flow {
                0%, 100% { cy: 19; opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                90% { cy: 5; opacity: 0; }
            }
            .data-bit {
                animation: data-flow 2.5s ease-in-out infinite;
                fill: var(--theme-green);
                stroke-width: 0;
            }
        `}</style>
        <g className="db-animate">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
            <path d="M3 12A9 3 0 0 0 21 12"></path>
        </g>
        <circle cx="8" cy="19" r="0.8" className="data-bit" style={{animationDelay: '0s'}} />
        <circle cx="12" cy="19" r="0.8" className="data-bit" style={{animationDelay: '0.5s'}} />
        <circle cx="16" cy="19" r="0.8" className="data-bit" style={{animationDelay: '1s'}} />
    </svg>
);