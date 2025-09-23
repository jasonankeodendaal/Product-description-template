import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { HomeIcon } from './icons/HomeIcon';

interface BottomNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
    const navRef = useRef<HTMLElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({});

    const navItems = useMemo(() => [
        { view: 'home', label: 'Home', icon: <HomeIcon /> },
        { view: 'recordings', label: 'Recordings', icon: <RecordingIcon /> },
        { view: 'notepad', label: 'Notepad', icon: <NotepadIcon /> },
        { view: 'photos', label: 'Photos', icon: <PhotoIcon /> },
        { view: 'generator', label: 'Generator', icon: <SparklesIcon /> }
    ], []);

    const activeIndex = useMemo(() => navItems.findIndex(item => item.view === currentView), [currentView, navItems]);

    useEffect(() => {
        const calculateIndicator = () => {
            if (navRef.current && activeIndex > -1) {
                const navWidth = navRef.current.offsetWidth;
                const itemCount = navItems.length;
                const itemWidth = navWidth / itemCount;
                const newLeft = itemWidth * activeIndex;
                setIndicatorStyle({
                    transform: `translateX(${newLeft}px)`,
                    width: `${itemWidth}px`
                });
            }
        };

        calculateIndicator();

        const resizeObserver = new ResizeObserver(calculateIndicator);
        if (navRef.current) {
            resizeObserver.observe(navRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [activeIndex, navItems.length]);

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-30 lg:hidden p-4">
            <nav ref={navRef} className="relative w-full h-16 flex items-center bg-gray-900 rounded-full shadow-lg border border-white/10">
                
                {/* Moving Indicator */}
                <div
                    className="absolute top-0 h-full transition-transform duration-300 ease-out pointer-events-none"
                    style={indicatorStyle}
                >
                    {/* The actual orange circle, centered within the container and scaled based on active state */}
                    <div className={`
                        w-16 h-16 bg-[var(--theme-green)] rounded-full absolute top-1/2 left-1/2 
                        -translate-x-1/2 -translate-y-1/2 transition-transform duration-300
                        ${activeIndex > -1 ? 'scale-100' : 'scale-0'}
                    `}></div>
                </div>
                
                {/* Nav Items */}
                {navItems.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <button
                            key={item.view}
                            onClick={() => onNavigate(item.view as View)}
                            className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 z-10"
                            aria-label={item.label}
                        >
                            <div className={`transition-all duration-300 ease-out ${isActive ? '-translate-y-2' : ''}`}>
                                {React.cloneElement(item.icon, {
                                    className: `h-7 w-7 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-white'}`
                                })}
                            </div>
                            <span className={`absolute bottom-1 text-xs font-bold transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100 text-gray-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </footer>
    );
};