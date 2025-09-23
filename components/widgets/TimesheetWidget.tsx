import React, { useMemo } from 'react';
import { LogEntry, View } from '../../App';
import { ClockInIcon } from '../icons/ClockInIcon';
import { ClockOutIcon } from '../icons/ClockOutIcon';

interface TimesheetWidgetProps {
    logEntries: LogEntry[];
    onSaveLogEntry: (type: LogEntry['type']) => Promise<void>;
    onNavigate: (view: View) => void;
}

export const TimesheetWidget: React.FC<TimesheetWidgetProps> = ({ logEntries, onSaveLogEntry, onNavigate }) => {
    
    const lastClockInOrOut = useMemo(() => {
        return logEntries.find(entry => entry.type === 'Clock In' || entry.type === 'Clock Out');
    }, [logEntries]);
    
    const isClockedIn = lastClockInOrOut?.type === 'Clock In';

    const formatRelativeTime = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours}h ago`;
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-white font-bold text-lg">Timesheet</h3>
                 <button onClick={() => onNavigate('timesheet')} className="text-xs font-semibold text-gray-300 hover:text-white hover:underline">View Log →</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                    onClick={() => onSaveLogEntry('Clock In')}
                    disabled={isClockedIn}
                    className="flex items-center justify-center gap-1.5 p-2 bg-emerald-600/50 hover:bg-emerald-600/80 text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <ClockInIcon />
                    <span className="font-semibold text-sm">Clock In</span>
                </button>
                 <button
                    onClick={() => onSaveLogEntry('Clock Out')}
                    disabled={!isClockedIn}
                    className="flex items-center justify-center gap-1.5 p-2 bg-rose-600/50 hover:bg-rose-600/80 text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <ClockOutIcon />
                    <span className="font-semibold text-sm">Clock Out</span>
                </button>
            </div>
            <div className="flex-grow space-y-1 overflow-y-auto no-scrollbar pr-2 -mr-2 text-xs">
                {logEntries.length > 0 ? logEntries.slice(0, 4).map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-1.5 bg-white/5 rounded">
                        <span className={`font-medium truncate max-w-[60%] ${entry.type === 'Clock In' ? 'text-emerald-400' : entry.type === 'Clock Out' ? 'text-rose-400' : 'text-gray-300'}`}>
                            {entry.task || entry.type}
                        </span>
                        <span className="text-gray-400 text-xs">{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                )) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">No log entries yet.</div>
                )}
            </div>
        </div>
    );
};