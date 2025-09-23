import React, { useState, useMemo } from 'react';
import { LogEntry } from '../App';
import { useRecharts } from '../hooks/useRecharts';
import { exportTimesheetToPDF } from '../utils/pdfUtils';
import { Spinner } from './icons/Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlusIcon } from './icons/PlusIcon';

interface TimesheetManagerProps {
    logEntries: LogEntry[];
    onSaveLogEntry: (entry: Omit<LogEntry, 'id'>) => Promise<void>;
}

const EntryIcon: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
    const baseClass = "w-4 h-4 rounded-full mr-3 flex-shrink-0";
    if (type === 'Clock In') return <div className={`${baseClass} bg-emerald-500`}></div>;
    if (type === 'Clock Out') return <div className={`${baseClass} bg-rose-500`}></div>;
    if (type === 'Manual Task') return <div className={`${baseClass} bg-amber-500`}></div>;
    return <div className={`${baseClass} bg-sky-500`}></div>;
};

export const TimesheetManager: React.FC<TimesheetManagerProps> = ({ logEntries, onSaveLogEntry }) => {
    const Recharts = useRecharts();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [task, setTask] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task || !date || !startTime || !endTime) {
            alert("Please fill all fields for the manual entry.");
            return;
        }

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime <= startDateTime) {
            alert("End time must be after start time.");
            return;
        }

        const newEntry: Omit<LogEntry, 'id'> = {
            type: 'Manual Task',
            timestamp: startDateTime.toISOString(),
            task,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString()
        };
        onSaveLogEntry(newEntry);
        // Reset form
        setTask('');
        setStartTime('');
        setEndTime('');
        setIsFormVisible(false);
    };

    const workflowChartData = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const activityByDay: { [key: string]: number } = {};
        
        // Initialize all days in the last 30 days with 0 tasks
        for (let i = 0; i < 30; i++) {
            const date = new Date(thirtyDaysAgo);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            activityByDay[dateString] = 0;
        }
        
        logEntries.forEach(entry => {
            const entryDate = new Date(entry.timestamp);
            if (entryDate >= thirtyDaysAgo) {
                const dateString = entryDate.toISOString().split('T')[0];
                if (activityByDay.hasOwnProperty(dateString)) {
                    activityByDay[dateString]++;
                }
            }
        });

        return Object.entries(activityByDay).map(([date, tasks]) => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            tasks,
        }));

    }, [logEntries]);

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 font-inter">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Timesheet & Activity Log</h1>
                <button 
                    onClick={() => exportTimesheetToPDF(logEntries)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <DownloadIcon /> Export as PDF
                </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">30-Day Workflow</h2>
                <div className="h-64">
                    {!Recharts ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Spinner /> Loading Chart...</div>
                    ) : (
                        <Recharts.ResponsiveContainer width="100%" height="100%">
                            <Recharts.BarChart data={workflowChartData}>
                                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <Recharts.XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <Recharts.YAxis allowDecimals={false} stroke="#9CA3AF" fontSize={12} />
                                <Recharts.Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563' }} />
                                <Recharts.Bar dataKey="tasks" fill="#34D399" name="Tasks Completed" />
                            </Recharts.BarChart>
                        </Recharts.ResponsiveContainer>
                    )}
                </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">All Entries</h2>
                    <button onClick={() => setIsFormVisible(!isFormVisible)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <PlusIcon /> Add Manual Entry
                    </button>
                </div>
                
                {isFormVisible && (
                     <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 mb-4 bg-gray-900/50 rounded-lg animate-fade-in-down">
                        <div className="md:col-span-4">
                             <input type="text" value={task} onChange={e => setTask(e.target.value)} placeholder="Task description..." className="w-full p-2 bg-gray-700 rounded border border-gray-600"/>
                        </div>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600"/>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600"/>
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600"/>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 rounded">Save Task</button>
                    </form>
                )}

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {logEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div className="flex items-center">
                                <EntryIcon type={entry.type} />
                                <div>
                                    <p className="font-semibold text-white">{entry.task || entry.type}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(entry.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-300 text-right">
                                {entry.startTime && entry.endTime ? (
                                    <span>{new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(entry.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                ) : (
                                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
