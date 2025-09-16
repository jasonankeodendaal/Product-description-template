import React from 'react';

export const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <style>
            {`
                @keyframes pulse {
                    50% { transform: scale(0.9); }
                }
                .plus-icon {
                    transform-origin: center;
                }
                .group:hover .plus-icon {
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `}
        </style>
        <g className="plus-icon">
            <path d="M12 5V19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>
);