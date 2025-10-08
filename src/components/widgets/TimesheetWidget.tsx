
import React, { useMemo } from 'react';
import { LogEntry, View } from '../../types';
import { ClockInIcon } from '../icons/ClockInIcon';
import { ClockOutIcon } from '../icons/ClockOutIcon';
import { formatRelativeTime } from '../../utils/formatters';

interface TimesheetWidgetProps {
    logEntries: LogEntry[];
    onSaveLogEntry: (type: LogEntry['type']) => Promise<void>;
    onNavigate: (view: View) => void;
}

export const TimesheetWidget: React.FC<TimesheetWidgetProps> = ({ logEntries, onSaveLogEntry, onNavigate }) => {
    
    const { isClockedIn, workedHours, recentLogs } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const chronologicalEntries = logEntries
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        const lastRelevantClockEntry = [...chronologicalEntries].reverse().find(e => e.type === 'Clock In' || e.type === 'Clock Out');
        const isCurrentlyClockedIn = lastRelevantClockEntry?.type === 'Clock In';
        
        let totalMilliseconds = 0;
        let lastClockInTime: Date | null = null;
        
        chronologicalEntries.forEach(entry => {
            const entryDate = new Date(entry.timestamp);
            if (entryDate < today) return;

            if (entry.type === 'Clock In') {
                lastClockInTime = new Date(entry.timestamp);
            } else if (entry.type === 'Clock Out' && lastClockInTime) {
                totalMilliseconds += new Date(entry.timestamp).getTime() - lastClockInTime.getTime();
                lastClockInTime = null;
            } else if (entry.type === 'Manual Task' && entry.startTime && entry.endTime) {
                totalMilliseconds += new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
            }
        });

        if (lastClockInTime) {
            totalMilliseconds += new Date().getTime() - lastClockInTime.getTime();
        }

        const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

        const recent = [...logEntries]
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 4);

        return {
            isClockedIn: isCurrentlyClockedIn,
            workedHours: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
            recentLogs: recent,
        };
    }, [logEntries]);

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                 <h3 className="text-white font-bold text-xs">Timesheet</h3>
                 <button onClick={() => onNavigate('timesheet')} className="text-xs font-semibold text-gray-300 hover:text-white hover:underline">View Log →</button>
            </div>
             <div className="text-center my-0.5 flex-shrink-0">
                <p className="text-xl md:text-2xl font-bold text-white tracking-tighter">{workedHours}</p>
                <p className="text-xs text-gray-400 font-semibold">Today's Hours</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 my-0.5 flex-shrink-0">
                <button
                    onClick={() => onSaveLogEntry('Clock In')}
                    disabled={isClockedIn}
                    className="flex items-center justify-center gap-1 p-1 bg-orange-600/50 hover:bg-orange-600/80 text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <ClockInIcon />
                    <span className="font-semibold text-xs">Clock In</span>
                </button>
                 <button
                    onClick={() => onSaveLogEntry('Clock Out')}
                    disabled={!isClockedIn}
                    className="flex items-center justify-center gap-1 p-1 bg-rose-600/50 hover:bg-rose-600/80 text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <ClockOutIcon />
                    <span className="font-semibold text-xs">Clock Out</span>
                </button>
            </div>
            <div className="flex-grow space-y-1 overflow-y-auto no-scrollbar pr-2 -mr-2 text-xs">
                {recentLogs.length > 0 ? recentLogs.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center px-1 py-0.5 bg-white/5 rounded">
                        <span className={`font-medium truncate max-w-[60%] ${entry.type === 'Clock In' ? 'text-emerald-400' : entry.type === 'Clock Out' ? 'text-rose-400' : 'text-gray-300'}`}>
                            {entry.task || entry.type}
                        </span>
                        <span className="text-gray-400">{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                )) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">No log entries yet.</div>
                )}
            </div>
        </div>
    );
};
