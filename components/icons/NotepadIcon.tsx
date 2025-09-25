import React from 'react';

export const NotepadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M15,2H9A3,3,0,0,0,6,5V19a3,3,0,0,0,3,3h6a3,3,0,0,0,3-3V5A3,3,0,0,0,15,2Zm0,17H9a1,1,0,0,1-1-1V5A1,1,0,0,1,9,4h6a1,1,0,0,1,1,1V18A1,1,0,0,1,15,19Z"/>
        <path fill="currentColor" d="M10,8h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2Z"/>
        <path fill="currentColor" d="M14,10H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z"/>
        <path fill="currentColor" d="M14,14H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z"/>
    </svg>
);