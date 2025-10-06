
import React, { useState, useMemo, useEffect } from 'react';
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
import type { View, Note, Photo, Recording, LogEntry, CalendarEvent, UserRole } from '../types';


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
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 h-full shadow-lg border border-white/10 flex flex-col w-full text-left"
        >
            {/* Clock part */}
            <div className="flex-grow flex flex-col justify-center items-center text-center">
                <p className="font-bold text-white tracking-tighter leading-none clock-time">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <div className="flex items-center gap-1.5 text-gray-300 mt-2">
                    <CalendarIcon className="w-4 h-4" />
                    <p className="font-semibold clock-date">
                        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mx-2 my-2"></div>

            {/* Calendar part */}
            <div className="flex-shrink-0 px-1">
                 <h3 className="text-white font-bold text-xs mb-1.5">Upcoming</h3>
                 <div className="space-y-1 overflow-hidden">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => (
                            <div key={event.id} className="flex items-center gap-2 text-xs">
                                <span className="text-gray-300 font-mono text-xs">{formatEventTime(event.startDateTime)}</span>
                                <p className="text-white truncate">{event.title}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-xs">No upcoming events this week.</p>
                    )}
                </div>
            </div>
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
        <div className="flex-1 flex flex-col font-inter relative overflow-y-auto no-scrollbar">
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

            <div className="p-2 w-full mx-auto">
                <div className="flex-shrink-0">
                    <MessageOfTheDay />
                </div>
                
                <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-2">
                    {/* Mobile: Combined Clock & Calendar */}
                    <HomeTile className="col-span-2 row-span-2 md:hidden" style={{ animationDelay: '50ms' }}>
                        <ClockCalendarWidget onOpenCalendar={props.onOpenCalendar} events={props.calendarEvents} />
                    </HomeTile>
                    <HomeTile className="col-span-1 aspect-square md:hidden" style={{ animationDelay: '100ms' }}>
                        <StorageBreakdownWidget storageUsage={props.storageUsage} siteSettings={props.siteSettings} isApiConnected={props.isApiConnected} />
                    </HomeTile>
                     <HomeTile className="col-span-1 aspect-square md:hidden" style={{ animationDelay: '150ms' }}>
                        <WeatherWidget getWeatherInfo={props.getWeatherInfo} siteSettings={props.siteSettings} onOpenForecast={handleOpenForecast} />
                    </HomeTile>
                    <HomeTile className="col-span-2 md:hidden" style={{ animationDelay: '200ms' }}>
                        <TimesheetWidget logEntries={props.logEntries} onSaveLogEntry={props.onSaveLogEntry} onNavigate={props.onNavigate} />
                    </HomeTile>
                    
                    {/* --- Desktop Layout --- */}
                    <HomeTile className="hidden md:block md:col-span-3 md:row-span-2" style={{ animationDelay: '50ms' }}>
                        <ClockWidget />
                    </HomeTile>
                    <HomeTile className="hidden md:block md:col-span-3 md:row-span-2" style={{ animationDelay: '100ms' }}>
                        <StorageBreakdownWidget storageUsage={props.storageUsage} siteSettings={props.siteSettings} isApiConnected={props.isApiConnected} />
                    </HomeTile>
                    <HomeTile className="hidden md:block md:col-span-4" style={{ animationDelay: '150ms' }}>
                        <WeatherWidget getWeatherInfo={props.getWeatherInfo} siteSettings={props.siteSettings} onOpenForecast={handleOpenForecast} />
                    </HomeTile>
                     <HomeTile className="hidden md:block md:col-span-2" style={{ animationDelay: '200ms' }}>
                        <CalendarWidget onOpenCalendar={props.onOpenCalendar} events={props.calendarEvents} />
                    </HomeTile>
                    <HomeTile className="hidden md:block md:col-span-6" style={{ animationDelay: '250ms' }}>
                        <TimesheetWidget logEntries={props.logEntries} onSaveLogEntry={props.onSaveLogEntry} onNavigate={props.onNavigate} />
                    </HomeTile>
                    
                    
                    <div className="col-span-full mt-2 mb-1 pl-1 text-lg font-bold text-white/90">Tools & Actions</div>

                    <div className="col-span-full grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
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
        </div>
    );
};
