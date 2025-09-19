import React from 'react';
import { View } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';
import { UserIcon } from './icons/UserIcon';

interface SidebarProps {
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
    <li>
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                isActive
                    ? 'bg-[var(--theme-green)] text-black font-semibold'
                    : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:text-[var(--theme-text-primary)]'
            }`}
        >
            <div className="w-6 h-6">{icon}</div>
            <span>{label}</span>
        </button>
    </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenDashboard, onOpenInfo, onOpenCreatorInfo }) => {
  return (
    <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 bg-[var(--theme-dark-bg)] border-r border-[var(--theme-border)]/50 p-4 flex flex-col">
      <nav className="flex-grow">
        <ul className="space-y-2">
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
                label="Photo Library"
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
             <NavItem 
                label="Image Squarer"
                icon={<ImageIcon />}
                isActive={currentView === 'image-tool'}
                onClick={() => onNavigate('image-tool')}
            />
        </ul>
      </nav>
      <div className="flex-shrink-0 border-t border-[var(--theme-border)]/50 pt-4">
         <ul className="space-y-2">
            <NavItem 
                label="Creator Info"
                icon={<UserIcon />}
                isActive={false}
                onClick={onOpenCreatorInfo}
            />
            <NavItem 
                label="Dashboard"
                icon={<DatabaseIcon />}
                isActive={false}
                onClick={onOpenDashboard}
            />
             <NavItem 
                label="About & Setup"
                icon={<QuestionCircleIcon />}
                isActive={false}
                onClick={onOpenInfo}
            />
        </ul>
      </div>
    </aside>
  );
};