import React from 'react';
import { View } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';

interface BottomNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
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

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--theme-bg)]/80 backdrop-blur-lg lg:hidden shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.2)]">
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
      </nav>
    </footer>
  );
};