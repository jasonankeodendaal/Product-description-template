import React from 'react';

export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
        <style>
            {`
                .gleam {
                    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                    transform-origin: center;
                    transform: translateX(-150%) skewX(-30deg);
                }
                .group:hover .gleam {
                    transform: translateX(150%) skewX(-30deg);
                }
            `}
        </style>
        <defs>
            <filter id="camera-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3"/>
            </filter>
            <radialGradient id="lens-gradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.9"/>
                <stop offset="60%" stopColor="#10B981" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#2B2826" stopOpacity="0.9"/>
            </radialGradient>
            <linearGradient id="body-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78746F"/>
                <stop offset="100%" stopColor="#3F3C3A"/>
            </linearGradient>
        </defs>
        <g filter="url(#camera-shadow)">
            <rect x="2" y="5" width="20" height="14" rx="3" fill="url(#body-gradient)"/>
            <circle cx="12" cy="12" r="6" fill="#111"/>
            <circle cx="12" cy="12" r="5.5" fill="url(#lens-gradient)"/>
            <circle cx="12" cy="12" r="2" fill="#000" opacity="0.8"/>
            <rect x="17" y="6" width="3" height="1.5" rx="1" fill="#2B2826"/>
        </g>
        <g clipPath="url(#lens-clip)">
            <path d="M12 12m-5.5 0a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0" id="lens-clip-path" />
            <rect className="gleam" x="0" y="0" width="8" height="24" fill="white" opacity="0.2"/>
        </g>
        <clipPath id="lens-clip">
            <use href="#lens-clip-path" />
        </clipPath>
    </svg>
);