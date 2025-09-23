import React, { useState, useMemo } from 'react';
import { CalendarEvent, Photo } from '../App';
import { XIcon } from './icons/XIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { EventEditorModal } from './EventEditorModal';
import { BellIcon } from './icons/BellIcon';

interface CalendarViewProps {
    onClose: () => void;
    events: CalendarEvent[];
    onSaveEvent: (event: CalendarEvent) => Promise<void>;
    onDeleteEvent: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
}

const colorMap: Record<string, string> = {
    sky: 'bg-sky-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
};

export const CalendarView: React.FC<CalendarViewProps> = ({ onClose, events, onSaveEvent, onDeleteEvent, photos, onSavePhoto }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

    const handleRequestNotification = async () => {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
    };

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarGrid = useMemo(() => {
        const grid: (Date | null)[] = [];
        // Add empty cells for days before the start of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            grid.push(null);
        }
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            grid.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        }
        return grid;
    }, [currentDate, startingDayOfWeek, daysInMonth]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(event => {
            const dateKey = new Date(event.startDateTime).toISOString().split('T')[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(event);
        });
        return map;
    }, [events]);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const openEditorForNewEvent = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsEditorOpen(true);
    };

    const openEditorForExistingEvent = (event: CalendarEvent) => {
        setSelectedDate(new Date(event.startDateTime));
        setSelectedEvent(event);
        setIsEditorOpen(true);
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-4xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => changeMonth(-1)}><ChevronLeftIcon /></button>
                        <h2 className="text-xl font-bold text-[var(--theme-text-primary)] w-48 text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)}><ChevronRightIcon /></button>
                    </div>
                    <div className="flex items-center gap-4">
                         {notificationPermission === 'default' && (
                            <button onClick={handleRequestNotification} className="text-sm flex items-center gap-2 bg-amber-600/20 text-amber-300 px-3 py-1.5 rounded-md hover:bg-amber-600/40">
                                <BellIcon /> Enable Reminders
                            </button>
                        )}
                        <button onClick={onClose} className="text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
                    </div>
                </header>
                
                <div className="flex-grow grid grid-cols-7 grid-rows-[auto,1fr] overflow-hidden">
                    {weekDays.map(day => (
                        <div key={day} className="text-center font-bold text-xs text-[var(--theme-text-secondary)] py-2 border-b border-r border-[var(--theme-border)]/50">{day}</div>
                    ))}
                    {calendarGrid.map((date, index) => {
                        const dateKey = date ? date.toISOString().split('T')[0] : '';
                        const dayEvents = date ? (eventsByDate.get(dateKey) || []) : [];
                        const isToday = date && date.toDateString() === new Date().toDateString();

                        return (
                            <div key={index} className="border-b border-r border-[var(--theme-border)]/50 p-1.5 flex flex-col overflow-hidden relative" onClick={() => date && openEditorForNewEvent(date)}>
                                {date && (
                                    <>
                                        <time dateTime={dateKey} className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--theme-green)] text-black' : 'text-white'}`}>
                                            {date.getDate()}
                                        </time>
                                        <div className="flex-grow overflow-y-auto no-scrollbar mt-1 space-y-1">
                                            {dayEvents.map(event => (
                                                <button key={event.id} onClick={(e) => { e.stopPropagation(); openEditorForExistingEvent(event); }} className={`w-full text-left text-xs p-1 rounded ${colorMap[event.color]}/50 text-white truncate`}>
                                                    {event.title}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            {isEditorOpen && (selectedDate || selectedEvent) && (
                <EventEditorModal
                    onClose={() => setIsEditorOpen(false)}
                    onSave={onSaveEvent}
                    onDelete={onDeleteEvent}
                    targetDate={selectedDate!}
                    event={selectedEvent}
                    photos={photos}
                    onSavePhoto={onSavePhoto}
                />
            )}
        </div>
    );
};

// ChevronRightIcon component
const ChevronRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
