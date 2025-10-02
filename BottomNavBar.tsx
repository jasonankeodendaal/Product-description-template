import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View } from '../App';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ImageIcon } from './icons/ImageIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';

interface BottomNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
    const navRef = useRef<HTMLElement>(null);
    const [pathD, setPathD] = useState('');
    const [navWidth, setNavWidth] = useState(0);

    const navItems = useMemo(() => [
        { view: 'home', label: 'Home', icon: HomeIcon },
        { view: 'recordings', label: 'Recordings', icon: RecordingIcon },
        { view: 'browser', label: 'Browser', icon: FolderOpenIcon },
        { view: 'notepad', label: 'Notepad', icon: NotepadIcon },
        { view: 'photos', label: 'Photos', icon: PhotoIcon },
    ], []);

    const activeIndex = useMemo(() => navItems.findIndex(item => item.view === currentView), [currentView, navItems]);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const newWidth = entries[0].contentRect.width;
                if (newWidth > 0) {
                    setNavWidth(newWidth);
                }
            }
        });
        if (navRef.current) {
            observer.observe(navRef.current);
        }
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (navWidth > 0 && activeIndex > -1) {
            const itemCount = navItems.length;
            const itemWidth = navWidth / itemCount;
            const center = itemWidth * activeIndex + itemWidth / 2;
            
            const scoopWidth = 80;
            const scoopDepth = 28;
            const topMargin = 16;
            const navHeight = 64;

            // FIX: Define startX and endX for the SVG path calculation. These variables determine the start and end points of the "scoop" effect.
            const startX = center - scoopWidth / 2;
            const endX = center + scoopWidth / 2;

            const d = `
                M 0,${topMargin}
                L ${startX},${topMargin}
                C ${startX + 10},${topMargin} ${startX + 12},${topMargin + scoopDepth} ${center},${topMargin + scoopDepth}
                C ${endX - 12},${topMargin + scoopDepth} ${endX - 10},${topMargin} ${endX},${topMargin}
                L ${navWidth},${topMargin}
                L ${navWidth},${navHeight}
                L 0,${navHeight} Z
            `;
            setPathD(d);
        } else if (navWidth > 0) {
            // Path for when no item is selected (or an unlisted view)
            const topMargin = 16;
            const navHeight = 64;
             const d = `
                M 0,${topMargin}
                L ${navWidth},${topMargin}
                L ${navWidth},${navHeight}
                L 0,${navHeight} Z
            `;
            setPathD(d);
        }
    }, [activeIndex, navWidth, navItems.length]);

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 lg:hidden">
            <nav ref={navRef} className="relative w-full h-16">
                <div className="absolute inset-0">
                    <svg width="100%" height="100%" viewBox={`0 0 ${navWidth} 64`} preserveAspectRatio="none">
                        <path d={pathD} fill="var(--theme-card-bg)" className="transition-all duration-300 ease-out" style={{ filter: 'drop-shadow(0 -5px 10px rgba(0,0,0,0.3))' }} />
                    </svg>
                </div>
                
                <div className="relative w-full h-full flex items-center">
                    {navItems.map((item, index) => {
                        const isActive = activeIndex === index;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.view}
                                onClick={() => onNavigate(item.view as View)}
                                className="relative flex-1 h-full flex items-center justify-center z-10"
                                aria-label={item.label}
                            >
                                <div className={`transition-all duration-300 ease-out ${isActive ? '-translate-y-4' : 'translate-y-0'}`}>
                                    <Icon className={`h-7 w-7 transition-all duration-300 ${isActive ? 'text-[var(--theme-orange)] drop-shadow-[0_0_8px_var(--theme-orange)]' : 'text-gray-400'}`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </footer>
    );
};