
import React, { useRef, useState, MouseEvent } from 'react';

interface HomeTileProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const HomeTile: React.FC<HomeTileProps> = ({ children, className, style, ...props }) => {
    const tileRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!tileRef.current) return;
        const { left, top, width, height } = tileRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        // Calculate rotation based on mouse position (max 10 degrees)
        const rotateY = x * 20; 
        const rotateX = -y * 20;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleMouseLeave = () => {
        setTransform('');
    };

    return (
        <div
            ref={tileRef}
            className={`home-tile tile-3d-effect glass-panel rounded-2xl overflow-hidden relative group animate-tile-in ${className || ''}`}
            style={{ ...style, transform }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            <div className="holographic-sheen"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="relative z-10 w-full h-full tile-content-3d">
                 {children}
            </div>
        </div>
    );
};
