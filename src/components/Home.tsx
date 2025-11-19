
import React, { useState, useMemo, useEffect } from 'react';
import type { View, Note, Photo, Recording, LogEntry, CalendarEvent, UserRole } from '../types';
import { SiteSettings, CreatorDetails } from '../constants';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget, WeatherData } from './widgets/WeatherWidget';
import { HomeTile } from './HomeTile';
import { StorageUsage } from '../utils/storageUtils';
import { StorageBreakdownWidget } from './widgets/StorageBreakdownWidget';
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
import { WeatherForecastModal } from './widgets/WeatherForecastModal';
import { CalendarIcon } from './icons/CalendarIcon';

interface HomeProps {
    onNavigate: (view: View) => void;
    notes: Note[];
    photos: Photo[];
    recordings: Recording[];
    logEntries: LogEntry[];
    onSaveLogEntry: (type: LogEntry['type']) => Promise<void>;
    siteSettings: SiteSettings;
    creatorDetails: CreatorDetails;
    onOpenDashboard: () => void;
    calendarEvents: CalendarEvent[];
    getWeatherInfo: (location: { city?: string; lat?: number; lon?: number }, customApiUrl?: string | null, customApiAuthKey?: string | null) => Promise<any>;
    storageUsage: StorageUsage;
    onLogout: () => void;
    userRole: UserRole;
    onOpenOnboarding: () => void;
    onOpenCalendar: () => void;
    isApiConnected: boolean;
}

// Combined widget for mobile view
const ClockCalendarWidget: React.FC<{ onOpenCalendar: () => void; events: CalendarEvent[] }> = ({ onOpenCalendar, events }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        return events
            .filter(event => {
                const eventDate = new Date(event.startDateTime);
                return eventDate >= now && eventDate <= sevenDaysFromNow;
            })
            .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
            .slice(0, 2);
    }, [events]);

    const formatEventTime = (isoString: string) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <button 
            onClick={onOpenCalendar}
            className="w-full h-full text-left flex flex-col justify-between p-3 bg-transparent"
        >
            <div className="flex-grow flex flex-col justify-center items-center text-center">
                <p className="font-bold text-white tracking-tighter leading-none clock-time" style={{ fontSize: '3rem' }}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <div className="flex items-center gap-1.5 text-gray-300 mt-1">
                    <CalendarIcon className="w-4 h-4" />
                    <p className="font-semibold text-xs uppercase tracking-wide">
                        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>
            {upcomingEvents.length > 0 && (
                 <div className="mt-2 pt-2 border-t border-white/10 w-full">
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="flex items-center gap-2 text-[10px] text-gray-300">
                            <span className="font-mono text-orange-400">{formatEventTime(event.startDateTime)}</span>
                            <span className="truncate">{event.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </button>
    );
};

export const Home: React.FC<HomeProps> = (props) => {
    const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('welcomeShown'));
    const [isWeatherForecastOpen, setIsWeatherForecastOpen] = useState(false);
    const [forecastData, setForecastData] = useState<WeatherData | null>(null);

    const handleDismissWelcome = () => {
        setShowWelcome(false);
        sessionStorage.setItem('welcomeShown', 'true');
    };
    
    const handleOpenForecast = (data: WeatherData) => {
        setForecastData(data);
        setIsWeatherForecastOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col font-inter relative overflow-y-auto no-scrollbar p-3 md:p-6">
             {showWelcome && (
                <WelcomeScreen
                    userRole={props.userRole}
                    creatorName={props.creatorDetails.name}
                    userName={props.siteSettings.userName || 'User'}
                    onDismiss={handleDismissWelcome}
                />
            )}
            
            {isWeatherForecastOpen && forecastData && (
                <WeatherForecastModal 
                    weatherData={forecastData}
                    onClose={() => setIsWeatherForecastOpen(false)}
                />
            )}

            <div className="w-full mx-auto max-w-7xl space-y-3">
                <div className="flex-shrink-0">
                    <MessageOfTheDay />
                </div>
                
                {/* 
                   GRID LAYOUT STRATEGY:
                   Mobile (Default): 2 columns. Dense packing.
                   Tablet (MD): 4 columns.
                   Desktop (LG/XL): 6 columns.
                */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[minmax(100px,auto)]">
                    
                    {/* --- Primary Widgets --- */}
                    
                    {/* Clock & Calendar: Spans 2x2 on mobile, 2x2 on desktop */}
                    <HomeTile className="col-span-2 row-span-2 md:col-span-2 md:row-span-2" style={{ animationDelay: '50ms' }}>
                         <div className="hidden md:block h-full w-full">
                             <ClockWidget />
                         </div>
                         <div className="block md:hidden h-full w-full">
                            <ClockCalendarWidget onOpenCalendar={props.onOpenCalendar} events={props.calendarEvents} />
                         </div>
                    </HomeTile>

                    {/* Weather: 1x1 on mobile, 2x1 on desktop */}
                    <HomeTile className="col-span-1 row-span-1 md:col-span-2 md:row-span-1" style={{ animationDelay: '100ms' }}>
                        <WeatherWidget getWeatherInfo={props.getWeatherInfo} siteSettings={props.siteSettings} onOpenForecast={handleOpenForecast} />
                    </HomeTile>
                    
                    {/* Storage: 1x1 on mobile, 2x1 on desktop */}
                    <HomeTile className="col-span-1 row-span-1 md:col-span-2 md:row-span-1" style={{ animationDelay: '150ms' }}>
                        <StorageBreakdownWidget storageUsage={props.storageUsage} siteSettings={props.siteSettings} isApiConnected={props.isApiConnected} />
                    </HomeTile>

                    {/* Timesheet: Spans 2 columns on mobile, 4 on desktop */}
                    <HomeTile className="col-span-2 md:col-span-4 lg:col-span-4" style={{ animationDelay: '200ms' }}>
                         <TimesheetWidget logEntries={props.logEntries} onSaveLogEntry={props.onSaveLogEntry} onNavigate={props.onNavigate} />
                    </HomeTile>

                    {/* Calendar (Desktop Only) */}
                    <HomeTile className="hidden md:block md:col-span-2" style={{ animationDelay: '250ms' }}>
                         <CalendarWidget onOpenCalendar={props.onOpenCalendar} events={props.calendarEvents} />
                    </HomeTile>

                    {/* --- Tool Grid (Dense) --- */}
                    <div className="col-span-2 md:col-span-6 mt-2 mb-1 text-sm font-bold text-white/50 uppercase tracking-wider pl-1">Tools</div>

                    {/* Primary Tools */}
                    <HomeTile className="aspect-square" style={{ animationDelay: '300ms' }}><GeneratorTile onNavigate={props.onNavigate} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '350ms' }}><NotepadTile onNavigate={props.onNavigate} count={props.notes.length} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '400ms' }}><RecordingsTile onNavigate={props.onNavigate} count={props.recordings.length} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '450ms' }}><PhotosTile onNavigate={props.onNavigate} count={props.photos.length} /></HomeTile>
                    
                    {/* Utilities */}
                    <HomeTile className="aspect-square" style={{ animationDelay: '500ms' }}><FileBrowserTile onNavigate={props.onNavigate} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '550ms' }}><ImageToolTile onNavigate={props.onNavigate} /></HomeTile>
                    
                    {/* System */}
                    <HomeTile className="aspect-square" style={{ animationDelay: '600ms' }}><DashboardTile onOpenDashboard={props.onOpenDashboard} /></HomeTile>
                    <HomeTile className="aspect-square" style={{ animationDelay: '700ms' }}><LogoutTile onLogout={props.onLogout} /></HomeTile>

                </div>
            </div>
        </div>
    );
};
