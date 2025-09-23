
import React from 'react';

interface HomeTileProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const HomeTile: React.FC<HomeTileProps> = ({ children, className, style, ...props }) => {
    return (
        <div
            className={`home-tile rounded-xl overflow-hidden relative group animate-tile-in ${className || ''}`}
            style={style}
            {...props}
        >
            {children}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl group-hover:ring-white/20 transition-shadow"></div>
        </div>
    );
};
