import React, { useState, useEffect } from 'react';
import { View, Note, Photo, Recording, LogEntry, CalendarEvent, UserRole } from '../App';
import { SiteSettings } from '../constants';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { HomeTile } from './HomeTile';
import { GeneratorTile } from './tiles/GeneratorTile';
import { RecordingsTile } from './tiles/RecordingsTile';
import { PhotosTile } from './tiles/PhotosTile';
import { NotepadTile } from './tiles/NotepadTile';
import { ImageToolTile } from './tiles/ImageToolTile';
import { DashboardTile } from './tiles/DashboardTile';
import { StorageUsage } from '../utils/storageUtils';
import { XIcon } from './icons/XIcon';
import { StorageBreakdownWidget } from './widgets/StorageBreakdownWidget';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';

interface HomeProps {
    onNavigate: (view: View) => void;
    notes: Note[];
    photos: Photo[];
    recordings: Recording[];
    logEntries: LogEntry[];
    onSaveLogEntry: (type: LogEntry['type']) => Promise<void>;
    siteSettings: SiteSettings;
    onOpenCalendar: () => void;
    onOpenDashboard: () => void;
    calendarEvents: CalendarEvent[];
    getWeatherInfo: (location: { city?: string; lat?: number; lon?: number }) => Promise<any>;
    storageUsage: StorageUsage;
    onLogout: () => void;
    userRole: UserRole;
}

const LogoutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);


export const Home: React.FC<HomeProps> = (props) => {
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 5000); // Hide after 5 seconds
        return () => clearTimeout(timer);
    }, []);
    
    const tiles = [
        { component: <ClockWidget />, className: "col-span-2 row-span-1" },
        { component: <WeatherWidget getWeatherInfo={props.getWeatherInfo} siteSettings={props.siteSettings} />, className: "col-span-2 row-span-1" },
        { component: (
            <button onClick={() => props.onNavigate('timesheet')} className="w-full h-full bg-emerald-600 text-white p-4 flex flex-col justify-between hover:bg-emerald-700 transition-colors">
                <ClockIcon className="w-6 h-6 text-white" />
                <span className="font-bold text-lg self-start">View All Logs</span>
            </button>
          ), className: "col-span-2 row-span-1" 
        },
        { component: (
            <button onClick={() => props.onOpenCalendar()} className="w-full h-full bg-cyan-500 text-white p-4 flex flex-col justify-between hover:bg-cyan-600 transition-colors">
                <CalendarIcon className="w-8 h-8 text-white"/>
                <span className="font-bold text-2xl self-start">Open Calendar</span>
            </button>
          ), className: "col-span-3 row-span-2" 
        },
        { component: <StorageBreakdownWidget storageUsage={props.storageUsage} />, className: "col-span-3 row-span-2" },
        { component: <GeneratorTile onNavigate={props.onNavigate} />, className: "col-span-1 row-span-1" },
        { component: <RecordingsTile onNavigate={props.onNavigate} count={props.recordings.length} />, className: "col-span-1 row-span-1" },
        { component: <PhotosTile onNavigate={props.onNavigate} count={props.photos.length} />, className: "col-span-1 row-span-1" },
        { component: <NotepadTile onNavigate={props.onNavigate} count={props.notes.length} />, className: "col-span-1 row-span-1" },
        { component: <ImageToolTile onNavigate={props.onNavigate} />, className: "col-span-1 row-span-1" },
        { component: <DashboardTile onOpenDashboard={props.onOpenDashboard} />, className: "col-span-1 row-span-1" },
    ];

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-3 font-inter relative">
             {showWelcome && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-auto animate-fade-in-down">
                    <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-green)] text-[var(--theme-text-primary)] text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
                        <span>Logged in as: <span className="capitalize font-bold text-[var(--theme-green)]">{props.userRole}</span></span>
                        <button onClick={() => setShowWelcome(false)} className="text-[var(--theme-text-secondary)] hover:text-white">
                            <XIcon />
                        </button>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-6 grid-rows-4 h-full gap-2 sm:gap-3">
                 {tiles.map((tile, index) => (
                    <HomeTile 
                        key={index} 
                        className={tile.className}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                       {tile.component}
                    </HomeTile>
                ))}
            </div>
            <button
                onClick={props.onLogout}
                className="fixed bottom-28 sm:bottom-28 lg:bottom-6 right-4 sm:right-6 z-40 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 fab-shadow"
                aria-label="Logout"
            >
                <LogoutIcon />
            </button>
        </div>
    );
};