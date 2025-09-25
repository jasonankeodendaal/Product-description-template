import React from 'react';

export const CloudIcon: React.FC<{ isConnected: boolean } & React.SVGProps<SVGSVGElement>> = ({ isConnected, className, ...props }) => {
    const colorClass = isConnected ? 'text-[var(--theme-green)]' : 'text-[var(--theme-red)]';
    const fillId = isConnected ? 'icon-grad-connected' : 'icon-grad-disconnected';
    
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            className={className || `h-6 w-6 transition-colors ${colorClass}`}
            {...props}
        >
            <defs>
                <linearGradient id="icon-grad-connected" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="icon-grad-disconnected" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
            </defs>
            <path fill={`url(#${fillId})`} d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
    );
};
