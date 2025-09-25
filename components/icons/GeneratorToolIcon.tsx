
import React from 'react';

export const GeneratorToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-gen-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#333" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-gen-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" />
                <stop offset="100%" stopColor="#E0E0E0" />
            </linearGradient>
        </defs>
        <path d="M54.5,18.5l-22,12.5l-22-12.5l22-12.5L54.5,18.5z" fill="url(#grad-gen-1)" stroke="#FB923C" strokeWidth="2"/>
        <path d="M10.5,23v22l22,12.5l22-12.5V23L32.5,35.5L10.5,23z" fill="url(#grad-gen-2)" stroke="#FB923C" strokeWidth="2"/>
    </svg>
);