
import React, { useMemo } from 'react';
import { CalendarEvent } from '../../types';
import { CalendarIcon } from '../icons/CalendarIcon';

interface CalendarWidgetProps {
    onOpenCalendar: () => void;
    events: CalendarEvent[];
}

const colorMap: Record<string, string> = {
    sky: 'bg-sky-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    red: 'bg-red-400',
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onOpenCalendar, events }) => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'short' });
    const weekday = today.toLocaleString('default', { weekday: 'long' });

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
            .slice(0, 2); // Show fewer events for compact view
    }, [events]);

    const formatEventTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <button 
            onClick={onOpenCalendar}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 h-full shadow-lg border border-white/10 flex flex-col w-full text-left transition-transform hover:scale-[1.02]"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                     <CalendarIcon className="w-5 h-5" />
                     <h3 className="text-white font-bold text-base">Calendar</h3>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-2xl md:text-3xl font-bold text-white -mb-1">{day}</p>
                    <p className="text-sm md:text-base font-semibold text-gray-300 leading-tight">{month}</p>
                </div>
            </div>
            <div className="flex-grow my-2 space-y-1.5 overflow-hidden">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                        <div key={event.id} className="flex items-center gap-2 text-xs animate-fade-in-down">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorMap[event.color] || 'bg-gray-400'}`}></div>
                            <span className="text-gray-300 font-mono text-[11px]">{formatEventTime(event.startDateTime)}</span>
                            <p className="text-white truncate">{event.title}</p>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex items-center">
                        <p className="text-gray-400 text-sm">No upcoming events this week.</p>
                    </div>
                )}
            </div>
            <div className="text-right text-gray-300 font-semibold text-sm">{weekday}</div>
        </button>
    );
};
