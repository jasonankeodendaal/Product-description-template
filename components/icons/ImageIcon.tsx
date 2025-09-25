import React from 'react';

export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" {...props}>
        <style>{`
            @keyframes scan-light {
                0% { transform: translateY(-10%); }
                50% { transform: translateY(110%); }
                100% { transform: translateY(-10%); }
            }
            .scan-line {
                animation: scan-light 3s ease-in-out infinite;
                stroke: var(--theme-orange);
                filter: drop-shadow(0 0 2px var(--theme-orange));
            }
             @keyframes subtle-zoom-still {
                0%, 100% { transform: scale(1) translate(0,0); }
                50% { transform: scale(1.05) translate(-1%, 1%); }
            }
            .landscape-path {
                animation: subtle-zoom-still 10s ease-in-out infinite;
                transform-origin: center;
            }
        `}</style>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline className="landscape-path" points="21 15 16 10 5 21"></polyline>
        <line className="scan-line" x1="3" y1="6" x2="21" y2="6" strokeWidth="1.5" />
    </svg>
);