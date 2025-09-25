
import React from 'react';

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="url(#main-orange-gradient)" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
        <path fill="url(#main-orange-gradient)" d="M16,11H13V8a1,1,0,0,0-2,0v4a1,1,0,0,0,1,1h4a1,1,0,0,0,0-2Z"/>
    </svg>
);