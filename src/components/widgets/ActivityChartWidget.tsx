
import React, { useMemo } from 'react';
import type { Note, Photo, Recording, LogEntry } from '../../types';
import { useRecharts } from '../../hooks/useRecharts';
import { Spinner } from '../icons/Spinner';

interface ActivityChartWidgetProps {
    notes: Note[];
    photos: Photo[];
    recordings: Recording[];
    logEntries: LogEntry[];
}

export const ActivityChartWidget: React.FC<ActivityChartWidgetProps> = ({ notes, photos, recordings, logEntries }) => {
    const { lib: Recharts, loading, error } = useRecharts();

    const chartData = useMemo(() => {
        const data: { name: string; notes: number; photos: number; recordings: number; logs: number }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const dayStart = date.getTime();
            date.setDate(date.getDate() + 1);
            const dayEnd = date.getTime();

            const dayNotes = notes.filter(n => new Date(n.date).getTime() >= dayStart && new Date(n.date).getTime() < dayEnd).length;
            const dayPhotos = photos.filter(p => new Date(p.date).getTime() >= dayStart && new Date(p.date).getTime() < dayEnd).length;
            const dayRecordings = recordings.filter(r => new Date(r.date).getTime() >= dayStart && new Date(r.date).getTime() < dayEnd).length;
            const dayLogs = logEntries.filter(l => new Date(l.timestamp).getTime() >= dayStart && new Date(l.timestamp).getTime() < dayEnd).length;

            data.push({
                name: new Date(dayStart).toLocaleDateString(undefined, { weekday: 'short' }),
                notes: dayNotes,
                photos: dayPhotos,
                recordings: dayRecordings,
                logs: dayLogs,
            });
        }
        return data;
    }, [notes, photos, recordings, logEntries]);
    
    if (loading || error || !Recharts) {
         return (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col items-center justify-center">
                {loading ? <Spinner /> : null}
                <p className="text-white/70 mt-2 text-sm">{loading ? 'Loading chart...' : 'Chart failed to load.'}</p>
            </div>
        );
    }
    
    const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-4">Weekly Activity</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} fontSize={12}/>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }} />
                        <Legend wrapperStyle={{ color: 'white', fontSize: '12px', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="notes" stroke="#38bdf8" strokeWidth={2} name="Notes" dot={false} />
                        <Line type="monotone" dataKey="photos" stroke="#a78bfa" strokeWidth={2} name="Photos" dot={false} />
                        <Line type="monotone" dataKey="recordings" stroke="#f472b6" strokeWidth={2} name="Records" dot={false} />
                        <Line type="monotone" dataKey="logs" stroke="#34d399" strokeWidth={2} name="Logs" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
