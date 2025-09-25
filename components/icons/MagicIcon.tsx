import React from 'react';

export const MagicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
        <style>{`
            @keyframes magic-glow {
                50% { filter: drop-shadow(0 0 4px currentColor); }
            }
            .magic-icon-animate {
                animation: magic-glow 2s ease-in-out infinite;
            }
        `}</style>
        <g className="magic-icon-animate">
            <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 21l1.9-5.8 5.8-1.9-5.8-1.9z" />
            <path d="M22 12h-2" />
            <path d="m19.1 19.1-.4-.4" />
            <path d="M12 22v-2" />
            <path d="m4.9 19.1.4-.4" />
            <path d="M2 12h2" />
            <path d="m4.9 4.9.4.4" />
        </g>
    </svg>
);
