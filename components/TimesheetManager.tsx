import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LogEntry, View } from '../App';
import { formatDurationHHMMSS, formatMsToHM, formatRelativeTime, formatIsoToDate } from '../utils/formatters';
import { PrintIcon } from './icons/PrintIcon';
import { ClockIcon } from './icons/ClockIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { ClockInIcon } from './icons/ClockInIcon';
import { ClockOutIcon } from './icons/ClockOutIcon';
import { Spinner } from './icons/Spinner';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MiniCalendar } from './MiniCalendar';

interface TimesheetManagerProps {
    logEntries: LogEntry[];
    activeTimer: { startTime: number; task: string } | null;
    timerDuration: number;
    onStartTimer: (task: string) => void;
    onStopTimer: () => void;
    onOpenPrintPreview: () => void;
    onNavigate: (view: View) => void;
}

const logTypeDetails: { [key in LogEntry['type']]: { icon: React.FC; color: string; } } = {
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

export const TimesheetManager: React.FC<TimesheetManagerProps> = ({ logEntries, activeTimer, timerDuration, onStartTimer, onStopTimer, onOpenPrintPreview, onNavigate }) => {
    const [taskDescription, setTaskDescription] = useState('');
    const [filter, setFilter] = useState<'all' | 'manual' | 'auto'>('all');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    const allEntryDates = useMemo(() => {
        const dateSet = new Set<string>();
        logEntries.forEach(entry => {
            dateSet.add(formatIsoToDate(entry.timestamp));
        });
        return Array.from(dateSet).sort((a, b) => b.localeCompare(a)); // Sort descending
    }, [logEntries]);

    const { dailyStats, weeklyTotalMs, selectedDayEntries } = useMemo(() => {
        // Group entries by date
        const groupedEntries = new Map<string, LogEntry[]>();
        logEntries.forEach(entry => {
            const dateKey = formatIsoToDate(entry.timestamp);
            if (!groupedEntries.has(dateKey)) {
                groupedEntries.set(dateKey, []);
            }
            groupedEntries.get(dateKey)!.push(entry);
        });

        // Calculate stats for each day
        const newDailyStats = new Map<string, { ms: number; taskCount: number }>();
        const todayKey = formatIsoToDate(new Date().toISOString());

        for (const [dateKey, entries] of groupedEntries.entries()) {
            let totalMs = 0;
            let taskCount = 0;
            let lastClockInTime: number | null = null;
            
            const sortedEntries = entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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

            if (lastClockInTime && dateKey === todayKey) {
                 totalMs += new Date().getTime() - lastClockInTime;
            }

            newDailyStats.set(dateKey, { ms: totalMs, taskCount });
        }

        // Calculate stats for the selected week
        const selectedDayOfWeek = selectedDate.getDay();
        const weekStartDate = new Date(selectedDate);
        weekStartDate.setDate(selectedDate.getDate() - selectedDayOfWeek);
        weekStartDate.setHours(0, 0, 0, 0);

        let newWeeklyTotalMs = 0;
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStartDate);
            day.setDate(weekStartDate.getDate() + i);
            const dateKey = formatIsoToDate(day.toISOString());
            newWeeklyTotalMs += newDailyStats.get(dateKey)?.ms || 0;
        }

        // Filter entries for the selected day
        const selectedDateKey = formatIsoToDate(selectedDate.toISOString());
        const dayEntries = groupedEntries.get(selectedDateKey) || [];

        const newFilteredLogs = dayEntries.filter(entry => {
            if (filter === 'all') return true;
            const isManual = entry.type === 'Manual Task' || entry.type === 'Clock In' || entry.type === 'Clock Out';
            if (filter === 'manual') return isManual;
            if (filter === 'auto') return !isManual;
            return true;
        }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { dailyStats: newDailyStats, weeklyTotalMs: newWeeklyTotalMs, selectedDayEntries: newFilteredLogs };

    }, [logEntries, filter, selectedDate]);
    
    const highlightedDays = useMemo(() => new Set(dailyStats.keys()), [dailyStats]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateChange = (delta: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + delta);
            return newDate;
        });
    };
    
    const goToToday = () => setSelectedDate(new Date());

    const handleDateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const dateString = e.target.value;
        const [year, month, day] = dateString.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
        setIsCalendarOpen(false); // also close calendar if open
    };

    const selectedDateKey = formatIsoToDate(selectedDate.toISOString());
    const isToday = selectedDateKey === formatIsoToDate(new Date().toISOString());


    return (
        <div className="flex-1 flex flex-col bg-[var(--theme-bg)] backdrop-blur-2xl text-[var(--theme-text-primary)] font-inter">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-[var(--theme-border)]/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors -ml-2 p-2"
                    >
                        <ChevronLeftIcon />
                        <span className="hidden sm:inline">Back to Home</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Activity Log & Timesheet</h1>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Track manual tasks and view automated logs.</p>
                    </div>
                </div>
                <button onClick={onOpenPrintPreview} className="p-2 text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] rounded-full transition-colors">
                    <PrintIcon />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                {/* Left Column: Timer & Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg p-6 space-y-4">
                        <div className="text-center">
                            <p className="text-6xl font-bold tracking-tighter" style={{ fontFamily: 'monospace' }}>
                                {formatDurationHHMMSS(timerDuration)}
                            </p>
                            <p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase">
                                {activeTimer ? `Task: ${activeTimer.task}` : 'Manual Timer'}
                            </p>
                        </div>
                        <input
                            type="text"
                            value={activeTimer ? activeTimer.task : taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            disabled={!!activeTimer}
                            placeholder="What are you working on?"
                            className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-orange)]"
                        />
                         {activeTimer ? (
                            <button onClick={onStopTimer} className="w-full py-3 bg-[var(--theme-red)] text-white font-bold rounded-md uppercase tracking-wider hover:opacity-90 transition-opacity">Stop</button>
                        ) : (
                             <button 
                                onClick={() => onStartTimer(taskDescription || 'Untitled Task')} 
                                disabled={!taskDescription.trim()}
                                className="w-full py-3 bg-[var(--theme-orange)] text-black font-bold rounded-md uppercase tracking-wider disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                Start
                            </button>
                        )}
                    </div>

                    <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg p-6">
                         <h3 className="text-lg font-semibold text-center mb-4">Summary</h3>
                         <div className="flex justify-around items-center">
                            <StatCard title="Hours Logged" value={formatMsToHM((dailyStats.get(selectedDateKey) || {ms: 0}).ms)} />
                            <StatCard title="Tasks" value={(dailyStats.get(selectedDateKey) || {taskCount: 0}).taskCount.toString()} />
                            <StatCard title="This Week" value={formatMsToHM(weeklyTotalMs)} />
                         </div>
                    </div>
                </div>

                {/* Right Column: Activity Log */}
                <div className="lg:col-span-2 bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-[var(--theme-border)] flex flex-col sm:flex-row justify-between items-center gap-2">
                         <div className="relative flex items-center gap-2" ref={calendarRef}>
                            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-slate-700 rounded-full"><ChevronLeftIcon /></button>
                            
                            <select
                                value={formatIsoToDate(selectedDate.toISOString())}
                                onChange={handleDateSelectChange}
                                className="appearance-none bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-base font-semibold text-white rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                aria-label="Select a date with entries"
                            >
                                {allEntryDates.length > 0 ? (
                                    allEntryDates.map(dateStr => (
                                        <option key={dateStr} value={dateStr}>
                                            {new Date(dateStr.replace(/-/g, '/')).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </option>
                                    ))
                                ) : (
                                    <option value={formatIsoToDate(selectedDate.toISOString())}>
                                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </option>
                                )}
                            </select>

                            <button onClick={() => setIsCalendarOpen(p => !p)} className="p-2 hover:bg-slate-700 rounded-full">
                                <CalendarIcon className="w-5 h-5 text-orange-400" />
                            </button>

                            <button onClick={() => handleDateChange(1)} disabled={isToday} className="p-2 hover:bg-slate-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRightIcon /></button>
                             {!isToday && <button onClick={goToToday} className="text-sm font-semibold text-orange-400 hover:underline">Today</button>}

                            {isCalendarOpen && (
                                <MiniCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={(date) => {
                                        setSelectedDate(date);
                                        setIsCalendarOpen(false);
                                    }}
                                    highlightedDays={highlightedDays}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--theme-bg)] p-1 rounded-lg">
                             <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>All</button>
                             <button onClick={() => setFilter('manual')} className={`px-3 py-1 text-sm rounded-md ${filter === 'manual' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>Manual</button>
                             <button onClick={() => setFilter('auto')} className={`px-3 py-1 text-sm rounded-md ${filter === 'auto' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>Automatic</button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {selectedDayEntries.length > 0 ? (
                            <ul className="divide-y divide-[var(--theme-border)]/50">
                                {selectedDayEntries.map(entry => {
                                    const details = logTypeDetails[entry.type];
                                    const Icon = details.icon;
                                    return (
                                        <li key={entry.id} className="p-4 flex items-center gap-4 hover:bg-[var(--theme-bg)]/50">
                                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--theme-bg)] ${details.color}`}>
                                                <Icon />
                                            </div>
                                            <div className="flex-grow overflow-hidden">
                                                <p className="font-semibold truncate">{entry.task || entry.type}</p>
                                                {entry.type === 'Manual Task' && entry.startTime && entry.endTime && (
                                                    <p className="text-xs text-gray-400">
                                                        Duration: {formatMsToHM(new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime())}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-400 flex-shrink-0">{formatRelativeTime(entry.timestamp)}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]">
                                <ClockIcon className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">No Activity Logged</h3>
                                <p className="text-sm mt-1">There are no entries for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
