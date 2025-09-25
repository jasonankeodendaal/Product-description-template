import React from 'react';

export const NotepadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--theme-text-secondary)]" {...props}>
        <style>{`
            @keyframes write-line-1 {
                0%, 100% { stroke-dashoffset: 8; }
                50% { stroke-dashoffset: 0; }
            }
             @keyframes write-line-2 {
                0%, 100% { stroke-dashoffset: 5; }
                50% { stroke-dashoffset: 0; }
            }
            .writing-line-1 {
                stroke-dasharray: 8;
                stroke-dashoffset: 8;
                animation: write-line-1 2.5s ease-in-out infinite;
            }
             .writing-line-2 {
                stroke-dasharray: 5;
                stroke-dashoffset: 5;
                animation: write-line-2 2.5s ease-in-out infinite;
                animation-delay: 0.5s;
            }
        `}</style>
        <path d="M13.5 2H6.5C5.5 2 5 2.5 5 3.5V20.5C5 21.5 5.5 22 6.5 22H17.5C18.5 22 19 21.5 19 20.5V8.5L13.5 2Z" />
        <polyline points="13 2 13 9 20 9" />
        <line className="writing-line-1" x1="8" y1="14" x2="16" y2="14" />
        <line className="writing-line-2" x1="8" y1="18" x2="13" y2="18" />
    </svg>
);