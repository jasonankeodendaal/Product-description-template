import React, { useState, useMemo } from 'react';
import { LogEntry, View } from './App';
import { formatDurationHHMMSS, formatMsToHM, formatRelativeTime } from './utils/formatters';
import { PrintIcon } from './components/icons/PrintIcon';
import { ClockIcon } from './components/icons/ClockIcon';
import { NotepadIcon } from './components/icons/NotepadIcon';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { RecordingIcon } from './components/icons/RecordingIcon';
import { ClockInIcon } from './components/icons/ClockInIcon';
import { ClockOutIcon } from './components/icons/ClockOutIcon';
import { Spinner } from './components/icons/Spinner';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';

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

    const { stats, filteredLogEntries } = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekStart = new Date(todayStart - now.getDay() * 24 * 60 * 60 * 1000).getTime();

        let todayMs = 0;
        let weekMs = 0;
        let todayTaskCount = 0;
        
        const manualTasks = logEntries.filter(e => e.type === 'Manual Task');
        
        manualTasks.forEach(entry => {
            if (entry.startTime && entry.endTime) {
                const start = new Date(entry.startTime).getTime();
                const end = new Date(entry.endTime).getTime();
                const duration = end - start;

                if (start >= todayStart) {
                    todayMs += duration;
                    todayTaskCount++;
                }
                if (start >= weekStart) {
                    weekMs += duration;
                }
            }
        });

        const newStats = {
            today: formatMsToHM(todayMs),
            week: formatMsToHM(weekMs),
            tasks: todayTaskCount.toString(),
        };

        const newFilteredLogs = logEntries.filter(entry => {
            if (filter === 'all') return true;
            const isManual = entry.type === 'Manual Task' || entry.type === 'Clock In' || entry.type === 'Clock Out';
            if (filter === 'manual') return isManual;
            if (filter === 'auto') return !isManual;
            return true;
        }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { stats: newStats, filteredLogEntries: newFilteredLogs };

    }, [logEntries, filter]);

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
                    {/* Timer Control Card */}
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
                            <div className="flex gap-4">
                                <button onClick={onStopTimer} className="w-full py-3 bg-[var(--theme-red)] text-white font-bold rounded-md uppercase tracking-wider hover:opacity-90 transition-opacity">Stop</button>
                            </div>
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

                    {/* Stats Card */}
                    <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg p-6">
                         <h3 className="text-lg font-semibold text-center mb-4">Summary</h3>
                         <div className="flex justify-around items-center">
                            <StatCard title="Today" value={stats.today} />
                            <StatCard title="Tasks Today" value={stats.tasks} />
                            <StatCard title="This Week" value={stats.week} />
                         </div>
                    </div>
                </div>

                {/* Right Column: Activity Log */}
                <div className="lg:col-span-2 bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Activity Log</h3>
                        <div className="flex items-center gap-1 bg-[var(--theme-bg)] p-1 rounded-lg">
                             <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>All</button>
                             <button onClick={() => setFilter('manual')} className={`px-3 py-1 text-sm rounded-md ${filter === 'manual' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>Manual</button>
                             <button onClick={() => setFilter('auto')} className={`px-3 py-1 text-sm rounded-md ${filter === 'auto' ? 'bg-[var(--theme-orange)] text-black' : 'text-gray-400 hover:bg-white/10'}`}>Automatic</button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {filteredLogEntries.length > 0 ? (
                            <ul className="divide-y divide-[var(--theme-border)]/50">
                                {filteredLogEntries.map(entry => {
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
                                <Spinner />
                                <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mt-4">No activity to show</h3>
                                <p className="text-sm mt-1">Your logged activities will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};