import React from 'react';
import { View } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ClockIcon } from './icons/ClockIcon';

interface BottomNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onNewNote: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 w-full h-16 transition-colors duration-200 group relative ${
            isActive ? 'text-white' : 'text-slate-300/80 hover:text-white'
        }`}
    >
        <div className={`w-7 h-7 transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-110'}`}>{icon}</div>
        <span className="text-xs font-semibold">{label}</span>
        {isActive && <div className="absolute bottom-1.5 h-1 w-1 bg-white rounded-full"></div>}
    </button>
);

const PlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate, onNewNote }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 lg:hidden px-4 pb-4 pt-2">
      <div className="relative w-full h-20">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(4,120,87,0.6)] to-[rgba(52,211,153,0.7)] backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.4)] border border-white/10">
            <nav className="h-full flex justify-around items-center">
                <div className="w-1/6"><NavItem label="Home" icon={<HomeIcon />} isActive={currentView === 'home'} onClick={() => onNavigate('home')} /></div>
                <div className="w-1/6"><NavItem label="Generator" icon={<SparklesIcon />} isActive={currentView === 'generator'} onClick={() => onNavigate('generator')} /></div>
                <div className="w-1/6"><NavItem label="Recordings" icon={<RecordingIcon />} isActive={currentView === 'recordings'} onClick={() => onNavigate('recordings')} /></div>
                <div className="w-1/6"><NavItem label="Photos" icon={<PhotoIcon />} isActive={currentView === 'photos'} onClick={() => onNavigate('photos')} /></div>
                <div className="w-1/6"><NavItem label="Timesheet" icon={<ClockIcon />} isActive={currentView === 'timesheet'} onClick={() => onNavigate('timesheet')} /></div>
                <div className="w-1/6"></div>
            </nav>
          </div>
           {currentView === 'notepad' ? (
                <div className="absolute right-0 top-0">
                    <button 
                        onClick={onNewNote}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex flex-col items-center justify-center text-black shadow-lg border-4 border-slate-950"
                    >
                        <PlusIcon />
                        <span className="text-xs font-bold -mt-1">New Note</span>
                    </button>
                </div>
            ) : (
                <div className="absolute right-0 top-0">
                     <button
                        onClick={() => onNavigate('notepad')}
                        className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-950"
                     >
                        <NotepadIcon className="w-7 h-7 text-white"/>
                    </button>
                </div>
            )}
      </div>
    </footer>
  );
};