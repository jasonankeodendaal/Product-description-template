import React, { useState } from 'react';
import { View, Note, Photo, Recording, LogEntry, CalendarEvent, UserRole } from '../App';
import { SiteSettings } from '../constants';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { HomeTile } from './HomeTile';
import { StorageUsage } from '../utils/storageUtils';
import { StorageDetailsWidget } from './widgets/StorageDetailsWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { TimesheetWidget } from './widgets/TimesheetWidget';
import { MessageOfTheDay } from './MessageOfTheDay';
import { WelcomeScreen } from './WelcomeScreen';
import { GeneratorTile } from './tiles/GeneratorTile';
import { RecordingsTile } from './tiles/RecordingsTile';
import { PhotosTile } from './tiles/PhotosTile';
import { NotepadTile } from './tiles/NotepadTile';
import { ImageToolTile } from './tiles/ImageToolTile';
import { DashboardTile } from './tiles/DashboardTile';
import { TourTile } from './tiles/TourTile';
import { LogoutTile } from './tiles/LogoutTile';
import { FileBrowserTile } from './tiles/FileBrowserTile';

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
    onOpenOnboarding: () => void;
    onOpenCalendar: () => void;
}

export const Home: React.FC<HomeProps> = (props) => {
    const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('welcomeShown'));

    const handleDismissWelcome = () => {
        setShowWelcome(false);
        sessionStorage.setItem('welcomeShown', 'true');
    };
    

    return (
        <div className="flex-1 flex flex-col font-inter relative overflow-y-auto no-scrollbar">
             {showWelcome && (
                <WelcomeScreen
                    userRole={props.userRole}
                    creatorName={props.siteSettings.creator.name}
                    userName={props.siteSettings.userName || 'User'}
                    onDismiss={handleDismissWelcome}
                />
            )}

            <div className="p-2 w-full mx-auto">
                <div className="flex-shrink-0">
                    <MessageOfTheDay />
                </div>
                
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                    <HomeTile className="col-span-2 row-span-2" style={{ animationDelay: '50ms' }}>
                        <StorageDetailsWidget storageUsage={props.storageUsage} siteSettings={props.siteSettings} />
                    </HomeTile>
                    <HomeTile className="col-span-1 aspect-square" style={{ animationDelay: '100ms' }}>
                        <CalendarWidget onOpenCalendar={props.onOpenCalendar} events={props.calendarEvents} />
                    </HomeTile>
                    <HomeTile className="col-span-1 row-span-2" style={{ animationDelay: '150ms' }}>
                        <TimesheetWidget logEntries={props.logEntries} onSaveLogEntry={props.onSaveLogEntry} onNavigate={props.onNavigate} />
                    </HomeTile>
                    <HomeTile className="col-span-1 aspect-square" style={{ animationDelay: '200ms' }}><ClockWidget /></HomeTile>
                    <HomeTile className="col-span-1 row-span-2" style={{ animationDelay: '250ms' }}><WeatherWidget getWeatherInfo={props.getWeatherInfo} siteSettings={props.siteSettings} /></HomeTile>

                    <div className="col-span-full mt-2 mb-1 pl-1 text-lg font-bold text-white/90">Tools & Actions</div>

                    <HomeTile className="aspect-square" style={{ animationDelay: '300ms' }}><GeneratorTile onNavigate={props.onNavigate} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '350ms' }}><RecordingsTile onNavigate={props.onNavigate} count={props.recordings.length} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '400ms' }}><PhotosTile onNavigate={props.onNavigate} count={props.photos.length} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '450ms' }}><NotepadTile onNavigate={props.onNavigate} count={props.notes.length} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '500ms' }}><FileBrowserTile onNavigate={props.onNavigate} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '550ms' }}><ImageToolTile onNavigate={props.onNavigate} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '600ms' }}><DashboardTile onOpenDashboard={props.onOpenDashboard} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '650ms' }}><TourTile onOpenTour={props.onOpenOnboarding} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '700ms' }}><LogoutTile onLogout={props.onLogout} /></HomeTile>
                </div>
            </div>
        </div>
    );
};