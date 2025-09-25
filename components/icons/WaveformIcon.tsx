import React from 'react';

export const WaveformIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>{`
            @keyframes draw-wave {
                to { stroke-dashoffset: 0; }
            }
            .wave-path {
                stroke-dasharray: 100;
                stroke-dashoffset: 100;
                animation: draw-wave 1.5s ease-in-out infinite alternate;
            }
        `}</style>
        <path className="wave-path" d="M2 20H5L10 5L16 35L24 12L30 28L35 20H38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);