
import React from 'react';

export const DashboardToolIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-dash-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>
        </defs>
        <rect x="6" y="10" width="24" height="44" rx="4" fill="url(#grad-dash-1)" />
        <rect x="34" y="10" width="24" height="20" rx="4" fill="url(#grad-dash-1)" />
        <rect x="34" y="34" width="24" height="20" rx="4" fill="url(#grad-dash-1)" />
    </svg>
);