
import React from 'react';

export const ImageToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-img-tool-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </linearGradient>
        </defs>
        <path d="M48,8 H16 L8,16 V48 L16,56 H48 L56,48 V16 Z" fill="url(#grad-img-tool-1)" />
        <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
            <path d="M20,44 V24 A4,4 0 0 1 24,20 H44" />
            <path d="M44,20 L38,14" />
            <path d="M44,20 L50,26" />
        </g>
    </svg>
);