import React, { useState, useEffect } from 'react';
import { CalendarEvent, Photo } from '../App';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CameraCapture } from './CameraCapture';
import { dataURLtoBlob } from '../utils/dataUtils';
import { PhotoThumbnail } from './PhotoThumbnail';

interface EventEditorModalProps {
    onClose: () => void;
    onSave: (event: CalendarEvent) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    targetDate: Date;
    event: CalendarEvent | null;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
}

const colorMap: Record<string, { bg: string; ring: string }> = {
    sky: { bg: 'bg-sky-500', ring: 'ring-sky-500' },
    purple: { bg: 'bg-purple-500', ring: 'ring-purple-500' },
    emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-500' },
    pink: { bg: 'bg-pink-500', ring: 'ring-pink-500' },
    cyan: { bg: 'bg-cyan-500', ring: 'ring-cyan-500' },
};
const defaultColors = ['sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'];

const reminderOptions = [
    { label: 'No reminder', value: -1 },
    { label: 'At time of event', value: 0 },
    { label: '5 minutes before', value: 5 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
];

export const EventEditorModal: React.FC<EventEditorModalProps> = ({ onClose, onSave, onDelete, targetDate, event, photos, onSavePhoto }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [notes, setNotes] = useState(event?.notes || '');
    const [time, setTime] = useState(() => {
        const d = event ? new Date(event.startDateTime) : new Date();
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    const [color, setColor] = useState(event?.color || defaultColors[0]);
    const [reminderOffset, setReminderOffset] = useState(event?.reminderOffset ?? -1);
    const [photoId, setPhotoId] = useState(event?.photoId);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const attachedPhoto = photos.find(p => p.id === photoId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [hours, minutes] = time.split(':').map(Number);
        const startDateTime = new Date(targetDate);
        startDateTime.setHours(hours, minutes, 0, 0);

        const newEvent: CalendarEvent = {
            id: event?.id || crypto.randomUUID(),
            title: title || 'Untitled Event',
            notes,
            startDateTime: startDateTime.toISOString(),
            endDateTime: startDateTime.toISOString(), // For simplicity, end time is same as start
            color,
            reminderOffset,
            reminderFired: event?.reminderFired || false,
            photoId,
            createdAt: event?.createdAt || new Date().toISOString(),
        };
        onSave(newEvent);
        onClose();
    };

    const handleDelete = () => {
        if (event && window.confirm("Are you sure you want to delete this event?")) {
            onDelete(event.id);
            onClose();
        }
    };
    
    const handleCapture = async (dataUrl: string) => {
        setIsCameraOpen(false);
        const newPhoto: Photo = {
            id: crypto.randomUUID(),
            name: `Event Photo ${new Date().toLocaleDateString()}`,
            notes: `For event: ${title}`,
            date: new Date().toISOString(),
            folder: 'calendar_events',
            imageBlob: dataURLtoBlob(dataUrl),
            imageMimeType: 'image/jpeg',
            tags: ['calendar', title],
        };
        await onSavePhoto(newPhoto);
        setPhotoId(newPhoto.id);
    };

    return (
        <>
            {isCameraOpen && <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">
                                {event ? 'Edit Event' : 'New Event'} on {targetDate.toLocaleDateString()}
                            </h3>
                            <button type="button" onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]"><XIcon /></button>
                        </header>
                        <div className="p-6 space-y-4">
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Event Title"
                                className="w-full text-xl font-semibold bg-transparent border-b-2 border-[var(--theme-border)]/50 focus:border-[var(--theme-green)] focus:outline-none"
                                autoFocus
                            />
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Notes..."
                                rows={4}
                                className="w-full bg-[var(--theme-bg)]/50 p-2 rounded-md border border-[var(--theme-border)]"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Time</label>
                                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-[var(--theme-bg)]/50 p-2 rounded-md border border-[var(--theme-border)]"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Reminder</label>
                                    <select value={reminderOffset} onChange={e => setReminderOffset(Number(e.target.value))} className="w-full bg-[var(--theme-bg)]/50 p-2 rounded-md border border-[var(--theme-border)] h-[42px]">
                                        {reminderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Color Tag</label>
                                <div className="flex items-center gap-3">
                                    {defaultColors.map(c => (
                                        <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full ${colorMap[c].bg} ${color === c ? `ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ${colorMap[c].ring}` : ''}`}></button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Attachment</label>
                                <div className="flex items-center gap-3">
                                    {attachedPhoto ? (
                                        <div className="w-20 h-20"><PhotoThumbnail photo={attachedPhoto} onSelect={() => {}} onDelete={() => setPhotoId(undefined)} /></div>
                                    ) : (
                                        <button type="button" onClick={() => setIsCameraOpen(true)} className="w-20 h-20 border-2 border-dashed border-[var(--theme-border)] rounded-md flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]/50">
                                            <CameraIcon className="h-6 w-6"/>
                                            <span className="text-xs mt-1">Add Photo</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <footer className="p-4 bg-black/20 border-t border-[var(--theme-border)] flex justify-between items-center">
                            {event ? (
                                <button type="button" onClick={handleDelete} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 flex items-center gap-2">
                                    <TrashIcon /> Delete
                                </button>
                            ) : <div></div>}
                            <button type="submit" className="bg-[var(--theme-green)] hover:opacity-90 text-black font-bold py-2 px-6 rounded-md">Save</button>
                        </footer>
                    </form>
                </div>
            </div>
        </>
    );
};
