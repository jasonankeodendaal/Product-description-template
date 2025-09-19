import React, { useState, useRef, useEffect } from 'react';
import { View } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { UserIcon } from './icons/UserIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';

interface BottomNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenDashboard: () => void;
  onOpenInfo: () => void;
  onOpenCreatorInfo: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 w-full h-16 transition-colors duration-200 group ${
            isActive ? 'text-[var(--theme-green)]' : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
        }`}
    >
        <div className={`w-7 h-7 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);


const MoreMenuItem: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[var(--theme-text-primary)] hover:bg-[var(--theme-card-bg)]/50"
    >
        <div className="w-6 h-6 text-[var(--theme-text-secondary)]">{icon}</div>
        <span>{label}</span>
    </button>
);


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate, onOpenDashboard, onOpenInfo, onOpenCreatorInfo }) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--theme-bg)]/80 backdrop-blur-lg lg:hidden shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.2)]">
      {isMoreMenuOpen && (
          <div 
            ref={moreMenuRef}
            className="absolute bottom-full right-2 mb-2 w-60 bg-[var(--theme-dark-bg)] rounded-xl shadow-2xl border border-[var(--theme-border)]/50 overflow-hidden animate-fade-in-down"
          >
              <ul>
                  <li><MoreMenuItem label="Image Tool" icon={<ImageIcon />} onClick={() => { onNavigate('image-tool'); setIsMoreMenuOpen(false); }} /></li>
                  <li><MoreMenuItem label="Creator Info" icon={<UserIcon />} onClick={() => { onOpenCreatorInfo(); setIsMoreMenuOpen(false); }} /></li>
                  <li><MoreMenuItem label="Dashboard" icon={<DatabaseIcon />} onClick={() => { onOpenDashboard(); setIsMoreMenuOpen(false); }} /></li>
                  <li><MoreMenuItem label="About & Setup" icon={<QuestionCircleIcon />} onClick={() => { onOpenInfo(); setIsMoreMenuOpen(false); }} /></li>
              </ul>
          </div>
      )}
      <nav className="mx-auto w-full max-w-md px-2 flex justify-around items-center">
          <NavItem 
              label="Generator"
              icon={<SparklesIcon />}
              isActive={currentView === 'generator'}
              onClick={() => onNavigate('generator')}
          />
          <NavItem 
              label="Recordings"
              icon={<RecordingIcon />}
              isActive={currentView === 'recordings'}
              onClick={() => onNavigate('recordings')}
          />
           <NavItem 
              label="Photos"
              icon={<PhotoIcon />}
              isActive={currentView === 'photos'}
              onClick={() => onNavigate('photos')}
          />
          <NavItem 
              label="Notepad"
              icon={<NotepadIcon />}
              isActive={currentView === 'notepad'}
              onClick={() => onNavigate('notepad')}
          />
           <button 
                onClick={() => setIsMoreMenuOpen(prev => !prev)}
                className={`flex flex-col items-center justify-center gap-1 w-full h-16 transition-colors duration-200 group ${isMoreMenuOpen ? 'text-[var(--theme-green)]' : 'text-[var(--theme-text-secondary)]'}`}
            >
               <div className="w-7 h-7"><MoreVerticalIcon/></div>
               <span className="text-xs font-semibold">More</span>
            </button>
      </nav>
    </footer>
  );
};