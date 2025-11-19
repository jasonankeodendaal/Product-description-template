
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { LogEntry, View } from '../../types';
import { formatDurationHHMMSS, formatMsToHM, formatRelativeTime, formatIsoToDate, getWeekRangeText, getMonthRangeText } from '../../utils/formatters';
import { PrintIcon } from '../icons/PrintIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { NotepadIcon } from '../icons/NotepadIcon';
import { PhotoIcon } from '../icons/PhotoIcon';
import { RecordingIcon } from '../icons/RecordingIcon';
import { ClockInIcon } from '../icons/ClockInIcon';
import { ClockOutIcon } from '../icons/ClockOutIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { MiniCalendar } from '../MiniCalendar';

interface TimesheetWidgetProps {
    logEntries: LogEntry[];
    activeTimer: { startTime: number; task: string } | null;
    timerDuration: number;
    onStartTimer: (task: string) => void;
    onStopTimer: () => void;
    onOpenPrintPreview: () => void;
    onNavigate: (view: View) => void;
}

const logTypeDetails: { [key in LogEntry['type']]: { icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string; } } = {
    'Clock In': { icon: ClockInIcon, color: 'text-emerald-400' },
    'Clock Out': { icon: ClockOutIcon, color: 'text-red-400' },
    'Manual Task': { icon: ClockIcon, color: 'text-sky-400' },
    'Note Created': { icon: NotepadIcon, color: 'text-amber-400' },
    'Photo Added': { icon: PhotoIcon, color: 'text-purple-400' },
    'Recording Added': { icon: RecordingIcon, color: 'text-pink-400' },
};

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="text-center">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider">{title}</p>
    </div>
);

export const TimesheetWidget: React.FC<TimesheetWidgetProps> = ({ logEntries, activeTimer, timerDuration, onStartTimer, onStopTimer, onOpenPrintPreview, onNavigate }) => {
    const [taskDescription, setTaskDescription] = useState('');
    const [logFilter, setLogFilter] = useState<'all' | 'manual' | 'auto'>('all');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    const allEntryDates = useMemo(() => {
        const dateSet = new Set<string>();
        logEntries.forEach(entry => {
            dateSet.add(formatIsoToDate(entry.timestamp));
        });
        return Array.from(dateSet).sort((a, b) => b.localeCompare(a)); // Sort descending
    }, [logEntries]);

    const { displayEntries, timeframeStats, highlightedDays } = useMemo(() => {
        const todayKey = formatIsoToDate(new Date().toISOString());
        
        let startDate: Date, endDate: Date;
        
        if (timeframe === 'day') {
            startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
        } else if (timeframe === 'week') {
            startDate = new Date(selectedDate);
            startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
        } else { // month
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
        }
        
        const entriesInTimeframe = logEntries.filter(entry => {
            const entryTime = new Date(entry.timestamp).getTime();
            return entryTime >= startDate.getTime() && entryTime < endDate.getTime();
        });

        let totalMs = 0;
        let taskCount = 0;
        let lastClockInTime: number | null = null;
        const sortedEntries = entriesInTimeframe.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        sortedEntries.forEach(entry => {
            if (entry.type === 'Manual Task') {
                taskCount++;
                if (entry.startTime && entry.endTime) {
                    totalMs += new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                }
            } else if (entry.type === 'Clock In') {
                lastClockInTime = new Date(entry.timestamp).getTime();
            } else if (entry.type === 'Clock Out' && lastClockInTime) {
                totalMs += new Date(entry.timestamp).getTime() - lastClockInTime;
                lastClockInTime = null;
            }
        });
        
        const now = new Date().getTime();
        if (lastClockInTime && todayKey === formatIsoToDate(new Date(lastClockInTime).toISOString()) && now < endDate.getTime()) {
             totalMs += now - lastClockInTime;
        }

        const filteredForDisplay = entriesInTimeframe.filter(entry => {
            if (logFilter === 'all') return true;
            const isManual = entry.type === 'Manual Task' || entry.type === 'Clock In' || entry.type === 'Clock Out';
            return logFilter === 'manual' ? isManual : !isManual;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const newHighlightedDays = new Set(logEntries.map(e => formatIsoToDate(e.timestamp)));

        return {
            displayEntries: filteredForDisplay,
            timeframeStats: {
                totalMs,
                taskCount,
                logCount: entriesInTimeframe.length,
            },
            highlightedDays: newHighlightedDays,
        };

    }, [logEntries, logFilter, selectedDate, timeframe]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTimeframeNavigation = (delta: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            if (timeframe === 'day') newDate.setDate(newDate.getDate() + delta);
            else if (timeframe === 'week') newDate.setDate(newDate.getDate() + 7 * delta);
            else newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const goToToday = () => setSelectedDate(new Date());

    const handleDateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const dateString = e.target.value;
        const [year, month, day] = dateString.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
    };

    const isToday = formatIsoToDate(selectedDate.toISOString()) === formatIsoToDate(new Date().toISOString());

    const renderDateDisplay = () => {
        if (timeframe === 'day') {
            return selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else if (timeframe === 'week') {
            return getWeekRangeText(selectedDate);
        } else { // month
            return getMonthRangeText(selectedDate);
        }
    };
    
    const getStatTitles = () => {
        switch(timeframe) {
            case 'week': return { hours: 'Hours This Week', tasks: 'Tasks This Week', events: 'Events This Week' };
            case 'month': return { hours: 'Hours This Month', tasks: 'Tasks This Month', events: 'Events This Month' };
            default: return { hours: 'Hours Logged', tasks: 'Tasks Today', events: 'Events Today' };
        }
    };
    const statTitles = getStatTitles();

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                 <h3 className="text-white font-bold text-xs">Timesheet</h3>
                 <button onClick={() => onNavigate('timesheet')} className="text-xs font-semibold text-gray-300 hover:text-white hover:underline">View Log →</button>
            </div>
             <div className="text-center my-0.5 flex-shrink-0">
                <p className="text-xl md:text-2xl font-bold text-white tracking-tighter">{timeframeStats.totalMs > 0 ? formatMsToHM(timeframeStats.totalMs) : '0h 00m'}</p>
                <p className="text-xs text-gray-400 font-semibold">Today's Hours</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 my-0.5 flex-shrink-0">
                <button
                    onClick={() => onNavigate('timesheet')} 
                    className="flex items-center justify-center gap-1 p-1 bg-orange-600/50 hover:bg-orange-600/80 text-white rounded-lg transition-colors"
                >
                    <ClockInIcon className="w-4 h-4" />
                    <span className="font-semibold text-xs">Clock In</span>
                </button>
                 <button
                    onClick={() => onNavigate('timesheet')}
                    className="flex items-center justify-center gap-1 p-1 bg-rose-600/50 hover:bg-rose-600/80 text-white rounded-lg transition-colors"
                >
                    <ClockOutIcon className="w-4 h-4" />
                    <span className="font-semibold text-xs">Clock Out</span>
                </button>
            </div>
            <div className="flex-grow space-y-1 overflow-y-auto no-scrollbar pr-2 -mr-2 text-xs">
                {displayEntries.slice(0, 4).map(entry => (
                    <div key={entry.id} className="flex justify-between items-center px-1 py-0.5 bg-white/5 rounded">
                        <span className={`font-medium truncate max-w-[60%] ${entry.type === 'Clock In' ? 'text-emerald-400' : entry.type === 'Clock Out' ? 'text-rose-400' : 'text-gray-300'}`}>
                            {entry.task || entry.type}
                        </span>
                        <span className="text-gray-400">{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                ))}
                {displayEntries.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">No log entries today.</div>
                )}
            </div>
        </div>
    );
};
