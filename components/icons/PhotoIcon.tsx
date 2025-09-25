import React from 'react';

export const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
        <style>{`
            @keyframes camera-flash {
                0%, 50%, 100% { opacity: 0; transform: scale(0.5); }
                5%, 10% { opacity: 1; transform: scale(1); }
            }
            @keyframes lens-flare {
                0%, 100% { transform: translate(-10px, 10px) scale(0); }
                5% { transform: translate(0, 0) scale(1); }
                15%, 100% { opacity: 0; }
            }
            .camera-flash-element {
                animation: camera-flash 4s ease-in-out infinite;
                transform-origin: center;
            }
            .lens-flare-element {
                animation: lens-flare 4s ease-in-out infinite;
                transform-origin: center;
                opacity: 0;
            }
        `}</style>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" fill="currentColor" opacity="0.8" />
        <circle cx="12" cy="13" r="3" fill="black" />
        <path className="camera-flash-element" d="M12 13 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" fill="white" />
        <path className="lens-flare-element" d="M15 10 l3 -3" stroke="white" stroke-width="2" />
    </svg>
);