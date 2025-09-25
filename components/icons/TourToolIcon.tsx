
import React from 'react';

export const TourToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-tour-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" />
                <stop offset="100%" stopColor="#E0E0E0" />
            </linearGradient>
        </defs>
        <path d="M32,8 C19.85,8 10,17.85 10,30 C10,48 32,56 32,56 C32,56 54,48 54,30 C54,17.85 44.15,8 32,8 Z" fill="url(#grad-tour-1)" opacity="0.2" />
        <circle cx="32" cy="30" r="8" fill="#FFF" />
        <path d="M32,8 C19.85,8 10,17.85 10,30 C10,48 32,56 32,56 C32,56 54,48 54,30 C54,17.85 44.15,8 32,8 Z" stroke="#FFF" strokeWidth="3" fill="none" />
    </svg>
);