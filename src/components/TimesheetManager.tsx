import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { LogEntry, View } from '../types';
import { formatDurationHHMMSS, formatMsToHM, formatRelativeTime, formatIsoToDate, getWeekRangeText, getMonthRangeText } from '../utils/formatters';
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

export const TimesheetManager: React.FC<TimesheetManagerProps> = ({ logEntries, activeTimer, timerDuration, onStartTimer, onStopTimer, onOpenPrintPreview, onNavigate }) => {
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
        <div className="flex-1 flex flex-col bg-[var(--theme-bg)] backdrop-blur-2xl text-[var(--theme-text-primary)] font-inter">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-[var(--theme-border)]/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors -ml-2 p-2"><ChevronLeftIcon /><span className="hidden sm:inline">Back</span></button>
                    <div>
                        <h1 className="text-2xl font-bold">Activity Log & Timesheet</h1>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Track manual tasks and view automated logs.</p>
                    </div>
                </div>
                <button onClick={onOpenPrintPreview} className="p-2 text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] rounded-full transition-colors"><PrintIcon /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                {/* Left Column: Timer & Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg p-6 space-y-4">
                        <div className="text-center"><p className="text-6xl font-bold tracking-tighter" style={{ fontFamily: 'monospace' }}>{formatDurationHHMMSS(timerDuration)}</p><p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase">{activeTimer ? `Task: ${activeTimer.task}` : 'Manual Timer'}</p></div>
                        <input type="text" value={activeTimer ? activeTimer.task : taskDescription} onChange={(e) => setTaskDescription(e.target.value)} disabled={!!activeTimer} placeholder="What are you working on?" className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md p-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-orange)]" />
                         {activeTimer ? (<button onClick={onStopTimer} className="w-full py-3 bg-[var(--theme-red)] text-white font-bold rounded-md uppercase tracking-wider hover:opacity-90 transition-opacity">Stop</button>) : (<button onClick={() => onStartTimer(taskDescription || 'Untitled Task')} disabled={!taskDescription.trim()} className="w-full py-3 bg-[var(--theme-orange)] text-black font-bold rounded-md uppercase tracking-wider disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed hover:opacity-90 transition-opacity">Start</button>)}
                    </div>

                    <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg p-6">
                         <h3 className="text-lg font-semibold text-center mb-4">Summary</h3>
                         <div className="flex justify-around items-center">
                            <StatCard title={statTitles.hours} value={formatMsToHM(timeframeStats.totalMs)} />
                            <StatCard title={statTitles.tasks} value={timeframeStats.taskCount.toString()} />
                            <StatCard title={statTitles.events} value={timeframeStats.logCount.toString()} />
                         </div>
                    </div>
                </div>

                {/* Right Column: Activity Log */}
                <div className="lg:col-span-2 bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-[var(--theme-border)] flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="relative flex items-center gap-1" ref={calendarRef}>
                            <button onClick={() => handleTimeframeNavigation(-1)} className="p-2 hover:bg-slate-700 rounded-full"><ChevronLeftIcon /></button>
                            <div className="relative">
                                <button onClick={() => setIsCalendarOpen(p => !p)} className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-base font-semibold text-white rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors cursor-pointer w-full text-center min-w-[240px]">
                                    {renderDateDisplay()}
                                </button>
                                {timeframe === 'day' && (
                                     <select value={formatIsoToDate(selectedDate.toISOString())} onChange={handleDateSelectChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Select a date with entries">
                                        {allEntryDates.map(dateStr => (<option key={dateStr} value={dateStr}>{dateStr}</option>))}
                                     </select>
                                )}
                            </div>
                             <button onClick={() => handleTimeframeNavigation(1)} disabled={isToday && timeframe==='day'} className="p-2 hover:bg-slate-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRightIcon /></button>
                             {!isToday && <button onClick={goToToday} className="text-sm font-semibold text-orange-400 hover:underline">Today</button>}
                            {isCalendarOpen && <MiniCalendar selectedDate={selectedDate} onDateSelect={(date: Date) => {setSelectedDate(date); setIsCalendarOpen(false);}} highlightedDays={highlightedDays} />}
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--theme-bg)] p-1 rounded-lg">
                            {['day', 'week', 'month'].map(tf => <button key={tf} onClick={() => setTimeframe(tf as 'day' | 'week' | 'month')} className={`px-3 py-1 text-sm rounded-md capitalize ${timeframe === tf ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>{tf}</button>)}
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--theme-bg)] p-1 rounded-lg">
                             <button onClick={() => setLogFilter('all')} className={`px-3 py-1 text-sm rounded-md ${logFilter === 'all' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>All</button>
                             <button onClick={() => setLogFilter('manual')} className={`px-3 py-1 text-sm rounded-md ${logFilter === 'manual' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>Manual</button>
                             <button onClick={() => setLogFilter('auto')} className={`px-3 py-1 text-sm rounded-md ${logFilter === 'auto' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>Auto</button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {displayEntries.length > 0 ? (
                            <ul className="divide-y divide-[var(--theme-border)]/50">
                                {displayEntries.map(entry => {
                                    const details = logTypeDetails[entry.type]; const Icon = details.icon;
                                    return (
                                        <li key={entry.id} className="p-4 flex items-center gap-4 hover:bg-[var(--theme-bg)]/50">
                                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--theme-bg)] ${details.color}`}><Icon /></div>
                                            <div className="flex-grow overflow-hidden"><p className="font-semibold truncate">{entry.task || entry.type}</p>{entry.type === 'Manual Task' && entry.startTime && entry.endTime && (<p className="text-xs text-gray-400">Duration: {formatMsToHM(new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime())}</p>)}</div>
                                            <span className="text-sm text-gray-400 flex-shrink-0">{formatRelativeTime(entry.timestamp)}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (<div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]"><ClockIcon className="w-12 h-12 mb-4" /><h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">No Activity Logged</h3><p className="text-sm mt-1">There are no entries for this timeframe.</p></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};