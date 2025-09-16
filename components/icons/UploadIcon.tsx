import React from 'react';

export const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <style>
            {`
                .upload-arrow { transition: transform 0.2s ease-out; }
                .group:hover .upload-arrow { transform: translateY(-2px); }
            `}
        </style>
        <defs>
            <radialGradient id="cloud-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="20%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="100%" stopColor="#BDC3C7"/>
            </radialGradient>
            <linearGradient id="arrow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60814A"/>
                <stop offset="100%" stopColor="#4CAF50"/>
            </linearGradient>
            <filter id="upload-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#upload-shadow)">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="url(#cloud-grad)" />
            <g className="upload-arrow" fill="url(#arrow-grad)" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 8v7a1 1 0 0 0 2 0V8l2.5 2.5a1 1 0 0 0 1.4-1.4l-4.2-4.2a1 1 0 0 0-1.4 0L7.1 9.1a1 1 0 0 0 1.4 1.4L11 8z"/>
            </g>
        </g>
    </svg>
);