import React, { useState, useMemo } from 'react';
// FIX: Corrected type imports to use the centralized `types.ts` file.
import { CalendarEvent, Photo, Recording } from '../types';
import { XIcon } from './icons/XIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { EventEditorModal } from './EventEditorModal';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarViewProps {
    events: CalendarEvent[];
    onSaveEvent: (event: CalendarEvent) => Promise<void>;
    onDeleteEvent: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    onClose: () => void;
    recordings: Recording[];
    onSaveRecording: (recording: Recording) => Promise<Recording>;
}

const colorMap: Record<string, { bg: string; border: string; text: string; }> = {
    sky: { bg: 'bg-blue-400', border: 'border-blue-500', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-400', border: 'border-purple-500', text: 'text-purple-400' },
    emerald: { bg: 'bg-green-400', border: 'border-green-500', text: 'text-green-400' },
    amber: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-400' },
    pink: { bg: 'bg-pink-400', border: 'border-pink-500', text: 'text-pink-400' },
    cyan: { bg: 'bg-cyan-400', border: 'border-cyan-500', text: 'text-cyan-400' },
    red: { bg: 'bg-red-400', border: 'border-red-500', text: 'text-red-400' },
};


export const CalendarView: React.FC<CalendarViewProps> = ({ events, onSaveEvent, onDeleteEvent, photos, onSavePhoto, onClose, recordings, onSaveRecording }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarGrid = useMemo(() => {
        const grid: (Date | null)[] = Array(startingDayOfWeek).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
            grid.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
        }
        return grid;
    }, [viewDate, startingDayOfWeek, daysInMonth]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(event => {
            const dateKey = new Date(event.startDateTime).toISOString().split('T')[0];
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)!.push(event);
        });
        return map;
    }, [events]);

    const changeMonth = (delta: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const openEditorForNewEvent = (date: Date) => {
        setSelectedDay(date);
        setSelectedEvent(null);
        setIsEditorOpen(true);
    };

    const openEditorForExistingEvent = (event: CalendarEvent) => {
        setSelectedDay(new Date(event.startDateTime));
        setSelectedEvent(event);
        setIsEditorOpen(true);
    };
    
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const selectedDayEvents = useMemo(() => {
        const dateKey = selectedDay.toISOString().split('T')[0];
        return (eventsByDate.get(dateKey) || []).sort((a,b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    }, [selectedDay, eventsByDate]);

    const formatEventTime = (isoString: string) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="flex-1 flex flex-col bg-transparent text-white font-inter animate-fade-in-down overflow-hidden">
             {/* Header */}
            <header className="p-4 flex justify-between items-center flex-shrink-0">
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors"
                >
                    <ChevronLeftIcon />
                    <span className="hidden sm:inline">Back to Home</span>
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 text-gray-400 hover:text-white"><ChevronLeftIcon /></button>
                    <h2 className="text-2xl font-bold text-orange-400 w-40 text-center">{viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 text-gray-400 hover:text-white"><ChevronRightIcon /></button>
                </div>
                 <div className="w-10 h-10"></div> {/* Spacer */}
            </header>

            {/* Calendar Grid */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {calendarGrid.map((date, index) => {
                        if (!date) return <div key={`empty-${index}`}></div>;
                        const dateKey = date.toISOString().split('T')[0];
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = date.toDateString() === selectedDay.toDateString();
                        const dayHasEvents = eventsByDate.has(dateKey);

                        return (
                            <div key={dateKey} className="flex justify-center items-center">
                                <button
                                    onClick={() => setSelectedDay(date)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200
                                        ${isSelected ? 'bg-orange-400 text-black' : ''}
                                        ${!isSelected && isToday ? 'bg-orange-400/20 text-orange-400' : ''}
                                        ${dayHasEvents ? 'relative' : ''}
                                        ${!isSelected && !isToday && !dayHasEvents ? 'text-gray-300 hover:bg-gray-700' : ''}
                                    `}
                                >
                                    {date.getDate()}
                                    {dayHasEvents && !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Tasks Timeline */}
            <div className="flex-1 bg-[var(--theme-card-bg)] rounded-t-3xl p-4 overflow-y-auto relative">
                <h3 className="font-bold text-xl mb-4">Daily Tasks</h3>
                 <div className="space-y-3">
                    {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => {
                        const eventColor = colorMap[event.color as keyof typeof colorMap] || colorMap['sky'];
                        return (
                             <div key={event.id} className="flex items-start gap-3">
                                <div className="text-right text-xs text-gray-400 w-16 pt-1 font-mono">
                                    {formatEventTime(event.startDateTime)}
                                </div>
                                <div className={`flex-1 rounded-lg p-3 ${eventColor.bg} bg-opacity-20 border-l-4 ${eventColor.border}`}>
                                    <button onClick={() => openEditorForExistingEvent(event)} className="w-full text-left">
                                        <p className="font-bold text-white">{event.title}</p>
                                        <p className="text-xs text-gray-300 mt-1">{formatEventTime(event.startDateTime)} - {formatEventTime(event.endDateTime)}</p>
                                    </button>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center text-gray-500 pt-10">No tasks for this day.</div>
                    )}
                </div>
                <button
                    onClick={() => openEditorForNewEvent(selectedDay)}
                    className="absolute bottom-6 right-6 bg-orange-500 text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                >
                    <PlusIcon />
                </button>
            </div>
             {isEditorOpen && (
                <EventEditorModal
                    onClose={() => setIsEditorOpen(false)}
                    onSave={onSaveEvent}
                    onDelete={onDeleteEvent}
                    targetDate={selectedDay}
                    event={selectedEvent}
                    photos={photos}
                    onSavePhoto={onSavePhoto}
                    recordings={recordings}
                    onSaveRecording={onSaveRecording}
                />
            )}
        </div>
    );
};
