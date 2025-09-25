import React from 'react';

export const PhotosIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                @keyframes photo-float-1 {
                    0%, 100% { transform: translate(-2px, -2px) rotate(-5deg); }
                    50% { transform: translate(0px, 0px) rotate(-2deg); }
                }
                @keyframes photo-float-2 {
                    0%, 100% { transform: translate(2px, -2px) rotate(5deg); }
                    50% { transform: translate(0px, 0px) rotate(2deg); }
                }
                @keyframes photo-float-3 {
                    0%, 100% { transform: translate(0px, 2px) rotate(0deg); }
                    50% { transform: translate(-1px, 0px) rotate(1deg); }
                }
                .photo-1 { animation: photo-float-1 6s ease-in-out infinite; }
                .photo-2 { animation: photo-float-2 7s ease-in-out infinite; }
                .photo-3 { animation: photo-float-3 5s ease-in-out infinite; }
            `}
        </style>
        <defs>
            <filter id="photo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
            <linearGradient id="photo-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316"/>
                <stop offset="100%" stopColor="#EA580C"/>
            </linearGradient>
        </defs>
        <g filter="url(#photo-shadow)">
            <g className="photo-3" transform-origin="center">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#E9E2D5"/>
                <rect x="7" y="7" width="10" height="8" fill="url(#photo-fill-grad)"/>
            </g>
            <g className="photo-2" transform-origin="center">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#E9E2D5"/>
                <rect x="7" y="7" width="10" height="8" fill="url(#photo-fill-grad)"/>
            </g>
            <g className="photo-1" transform-origin="center">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#FFFFFF"/>
                <rect x="7" y="7" width="10" height="8" fill="url(#photo-fill-grad)"/>
            </g>
        </g>
    </svg>
);