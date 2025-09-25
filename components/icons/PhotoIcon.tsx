import React from 'react';

export const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M19.82,6.36,18.3,4.45A3,3,0,0,0,16,3H8A3,3,0,0,0,5.7,4.45L4.18,6.36A3,3,0,0,0,2,9V18a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V9A3,3,0,0,0,19.82,6.36ZM12,17a5,5,0,1,1,5-5A5,5,0,0,1,12,17Z"/>
        <circle fill="currentColor" cx="12" cy="12" r="3"/>
    </svg>
);