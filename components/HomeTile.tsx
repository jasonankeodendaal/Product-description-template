
import React from 'react';

interface HomeTileProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const HomeTile: React.FC<HomeTileProps> = ({ children, className, style, ...props }) => {
    return (
        <div
            className={`home-tile rounded-xl overflow-hidden relative group animate-tile-in transition-transform duration-300 ease-in-out hover:-translate-y-1 ${className || ''}`}
            style={style}
            {...props}
        >
            <div className="absolute inset-0 home-tile-bg-effect z-0"></div>
            <div className="relative z-10 w-full h-full">
                 {children}
            </div>
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl group-hover:ring-orange-400/50 transition-shadow pointer-events-none duration-300"></div>
        </div>
    );
};