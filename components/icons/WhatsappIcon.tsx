import React from 'react';

export const WhatsappIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="waGradientNew" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#40C351" />
                <stop offset="100%" stopColor="#25D366" />
            </linearGradient>
            <filter id="waShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <g filter="url(#waShadow)">
            <path fill="url(#waGradientNew)" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91z" />
            <path fill="#FFF" d="M9.25 7.92c-.22-.44-.45-.45-.66-.45h-.54c-.22 0-.48.06-.72.33-.24.27-.95.92-.95 2.25 0 1.33.97 2.6 1.1 2.78.13.18 1.8 2.82 4.4 3.9 2.6 1.08 2.6.72 3.08.7.48-.02 1.42-.58 1.62-.95s.2-1.33.14-1.47c-.06-.14-.24-.22-.52-.36-.28-.14-1.65-.82-1.9-.92-.25-.1-.44-.14-.63.14-.18.28-.72.92-.88 1.1-.16.18-.32.2-.6.06-.28-.13-1.17-.42-2.23-1.37-.82-.74-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.56s.28-.34.42-.5c.14-.17.18-.28.28-.47s.05-.33-.02-.46c-.07-.14-.63-1.52-.87-2.1z"/>
        </g>
    </svg>
);
