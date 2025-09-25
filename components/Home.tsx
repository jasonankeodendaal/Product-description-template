

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
import { StorageDetailsWidget } from './widgets/StorageDetailsWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { TimesheetWidget } from './widgets/TimesheetWidget';
import { MessageOfTheDay } from './MessageOfTheDay';
import { LogoutTile } from './tiles/LogoutTile';

interface HomeProps {
    onNavigate: (view: View) => void;
    notes: Note[];
    photos: Photo[];
    recordings: Recording[];
    logEntries: LogEntry[];
    onSaveLogEntry: (type: LogEntry['type']) => Promise<void>;
    siteSettings: SiteSettings;
    onOpenDashboard: () => void;
    calendarEvents: CalendarEvent[];
    getWeatherInfo: (location: { city?: string; lat?: number; lon?: number }) => Promise<any>;
    storageUsage: StorageUsage;
    onLogout: () => void;
    userRole: UserRole;
}

export const Home: React.FC<HomeProps> = (props) => {
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 5000); // Hide after 5 seconds
        return () => clearTimeout(timer);
    }, []);
    

    return (
        <div className="flex-1 p-1.5 font-inter relative overflow-hidden">
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5 h-full">
                {/* Large Widgets */}
                <HomeTile className="col-span-2 md:col-span-2 lg:col-span-2 row-span-2" style={{ animationDelay: '50ms' }}>
                    <StorageDetailsWidget storageUsage={props.storageUsage} siteSettings={props.siteSettings} />
                </HomeTile>
                <HomeTile className="col-span-2 md:col-span-2 lg:col-span-2 row-span-2" style={{ animationDelay: '100ms' }}>
                    <CalendarWidget onOpenCalendar={() => props.onNavigate('calendar')} events={props.calendarEvents} />
                </HomeTile>
                <HomeTile className="col-span-2 md:col-span-4 lg:col-span-2 row-span-2" style={{ animationDelay: '150ms' }}>
                    <TimesheetWidget logEntries={props.logEntries} onSaveLogEntry={props.onSaveLogEntry} onNavigate={props.onNavigate} />
                </HomeTile>
                
                {/* Medium Widgets */}
                <HomeTile className="col-span-2 md:col-span-2 lg:col-span-3" style={{ animationDelay: '200ms' }}>
                    <MessageOfTheDay />
                </HomeTile>
                <HomeTile className="col-span-1 md:col-span-1 lg:col-span-1" style={{ animationDelay: '250ms' }}>
                    <ClockWidget />
                </HomeTile>
                <HomeTile className="col-span-1 md:col-span-1 lg:col-span-2" style={{ animationDelay: '300ms' }}>
                    <WeatherWidget getWeatherInfo={props.getWeatherInfo} siteSettings={props.siteSettings} />
                </HomeTile>
                
                {/* Small Nav Tiles */}
                <HomeTile className="col-span-1 md:col-span-1" style={{ animationDelay: '350ms' }}><GeneratorTile onNavigate={props.onNavigate} /></HomeTile>
                <HomeTile className="col-span-1 md:col-span-1" style={{ animationDelay: '400ms' }}><RecordingsTile onNavigate={props.onNavigate} count={props.recordings.length} /></HomeTile>
                <HomeTile className="col-span-1 md:col-span-1" style={{ animationDelay: '450ms' }}><PhotosTile onNavigate={props.onNavigate} count={props.photos.length} /></HomeTile>
                <HomeTile className="col-span-1 md:col-span-1" style={{ animationDelay: '500ms' }}><NotepadTile onNavigate={props.onNavigate} count={props.notes.length} /></HomeTile>
                <HomeTile className="col-span-1 md:col-span-1" style={{ animationDelay: '550ms' }}><ImageToolTile onNavigate={props.onNavigate} /></HomeTile>
                <HomeTile className="col-span-1 md:col-span-1" style={{ animationDelay: '600ms' }}><DashboardTile onOpenDashboard={props.onOpenDashboard} /></HomeTile>
                <HomeTile className="col-span-2 md:col-span-2" style={{ animationDelay: '650ms' }}><LogoutTile onLogout={props.onLogout} /></HomeTile>
            </div>
        </div>
    );
};