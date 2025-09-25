
import React from 'react';

export const NotepadToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-note-paper" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" />
                <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
            <linearGradient id="grad-note-lines" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFF" stopOpacity="0.4" />
            </linearGradient>
        </defs>
        <path d="M12,6 H52 A4,4 0 0 1 56,10 V58 A4,4 0 0 1 52,62 H12 A4,4 0 0 1 8,58 V10 A4,4 0 0 1 12,6 Z" fill="url(#grad-note-paper)" />
        <rect x="18" y="4" width="28" height="8" rx="2" fill="#4B5563" />
        <g stroke="url(#grad-note-lines)" strokeWidth="2" strokeLinecap="round">
            <path d="M20,24 L44,24" />
            <path d="M20,34 L44,34" />
            <path d="M20,44 L36,44" />
        </g>
    </svg>
);