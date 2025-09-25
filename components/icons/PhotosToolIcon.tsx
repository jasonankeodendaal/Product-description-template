
import React from 'react';

export const PhotosToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-photo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>
             <linearGradient id="grad-photo-mountains" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#D1D5DB" />
            </linearGradient>
        </defs>
        <rect x="6" y="6" width="52" height="52" rx="8" fill="url(#grad-photo-bg)" />
        <path d="M14,48 L28,30 L38,42 L44,34 L54,48 Z" fill="url(#grad-photo-mountains)" />
        <circle cx="22" cy="22" r="6" fill="#FFF" />
    </svg>
);