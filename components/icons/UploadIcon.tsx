import React from 'react';

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <style>
            {`
                @keyframes upload-arrow-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                .upload-icon-cloud {
                    stroke: var(--theme-text-secondary);
                    fill: var(--theme-text-secondary);
                    fill-opacity: 0.1;
                    transition: all 0.3s ease-out;
                }
                .upload-icon-arrow {
                    stroke: var(--theme-orange);
                    stroke-width: 2.5;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    animation: upload-arrow-float 2s ease-in-out infinite;
                    transform-origin: center;
                }
                .upload-icon-container:hover .upload-icon-cloud {
                    stroke: var(--theme-orange);
                    fill: var(--theme-orange);
                }
                .upload-icon-container:hover .upload-icon-arrow {
                    animation-duration: 1s;
                }
            `}
        </style>
        <g className="upload-icon-container">
            <path className="upload-icon-cloud" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" strokeWidth="1.5" />
            <path className="upload-icon-arrow" d="M12 15V7m0 0l-3 3m3-3l3 3" />
        </g>
    </svg>
);
