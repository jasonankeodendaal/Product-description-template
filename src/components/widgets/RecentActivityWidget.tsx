import React, { useMemo } from 'react';
import type { Note, Photo, Recording, View } from '../../types';
import { NotepadIcon } from '../icons/NotepadIcon';
import { PhotoIcon } from '../icons/PhotoIcon';
import { RecordingIcon } from '../icons/RecordingIcon';

interface RecentActivityWidgetProps {
    notes: Note[];
    photos: Photo[];
    recordings: Recording[];
    onNavigate: (view: View) => void;
}

type ActivityItem = {
    id: string;
    type: 'note' | 'photo' | 'recording';
    title: string;
    timestamp: string;
    icon: React.ReactNode;
    view: View;
};

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ notes, photos, recordings, onNavigate }) => {
    const recentActivity = useMemo(() => {
        const combined: ActivityItem[] = [
            ...notes.map(n => ({ id: n.id, type: 'note' as const, title: n.title, timestamp: n.date, icon: <NotepadIcon />, view: 'notepad' as View })),
            ...photos.map(p => ({ id: p.id, type: 'photo' as const, title: p.name, timestamp: p.date, icon: <PhotoIcon />, view: 'photos' as View })),
            ...recordings.map(r => ({ id: r.id, type: 'recording' as const, title: r.name, timestamp: r.date, icon: <RecordingIcon />, view: 'recordings' as View }))
        ];

        return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
    }, [notes, photos, recordings]);

    const formatRelativeTime = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-3">Recent Activity</h3>
            <div className="space-y-3 flex-grow overflow-y-auto no-scrollbar">
                {recentActivity.length > 0 ? recentActivity.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => onNavigate(item.view)}
                        className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-700 rounded-lg">{item.icon}</div>
                        <div className="flex-grow text-left overflow-hidden">
                            <p className="text-white font-semibold truncate text-sm">{item.title}</p>
                            <p className="text-gray-400 text-xs">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                        </div>
                        <div className="text-gray-400 text-xs flex-shrink-0">{formatRelativeTime(item.timestamp)}</div>
                    </button>
                )) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400 text-sm text-center py-8">No recent activity yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
