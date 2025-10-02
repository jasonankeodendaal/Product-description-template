import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, Photo, Recording } from '../App';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CameraCapture } from './CameraCapture';
import { dataURLtoBlob } from '../utils/dataUtils';
import { PhotoThumbnail } from './PhotoThumbnail';
import { useRecorder } from '../hooks/useRecorder';
import { MicIcon } from './icons/MicIcon';
import { formatTime } from '../utils/formatters';
import { LiveWaveform } from './LiveWaveform';
import { WaveformPlayer } from './WaveformPlayer';
import { CheckIcon } from './icons/CheckIcon';

interface EventEditorModalProps {
    onClose: () => void;
    onSave: (event: CalendarEvent) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    targetDate: Date;
    event: CalendarEvent | null;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    recordings: Recording[];
    onSaveRecording: (recording: Recording) => Promise<Recording>;
}

const colorMap: Record<string, { bg: string; ring: string }> = {
    sky: { bg: 'bg-blue-400', ring: 'ring-blue-400' },
    purple: { bg: 'bg-purple-400', ring: 'ring-purple-400' },
    emerald: { bg: 'bg-green-400', ring: 'ring-green-400' },
    amber: { bg: 'bg-yellow-400', ring: 'ring-yellow-400' },
    pink: { bg: 'bg-pink-400', ring: 'ring-pink-400' },
    cyan: { bg: 'bg-cyan-400', ring: 'ring-cyan-400' },
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

export const EventEditorModal: React.FC<EventEditorModalProps> = ({ onClose, onSave, onDelete, targetDate, event, photos, onSavePhoto, recordings, onSaveRecording }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [notes, setNotes] = useState(event?.notes || '');
    const [time, setTime] = useState(() => {
        const d = event ? new Date(event.startDateTime) : new Date();
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    const [color, setColor] = useState(event?.color || defaultColors[0]);
    const [reminderOffset, setReminderOffset] = useState(event?.reminderOffset ?? -1);
    const [photoId, setPhotoId] = useState(event?.photoId);
    const [recordingIds, setRecordingIds] = useState<string[]>(event?.recordingIds || []);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    
    const { isRecording, recordingTime, audioBlob, startRecording, stopRecording, analyserNode, setAudioBlob } = useRecorder();

    const attachedPhoto = photos.find(p => p.id === photoId);
    const attachedRecordings = recordings.filter(r => recordingIds.includes(r.id));

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
            endDateTime: startDateTime.toISOString(),
            color,
            reminderOffset,
            reminderFired: event?.reminderFired || false,
            photoId,
            recordingIds,
            createdAt: event?.createdAt || new Date().toISOString(),
        };
        onSave(newEvent);
        onClose();
    };

    const handleDelete = () => {
        if (event) {
            onDelete(event.id);
            onClose();
        }
    };
    
    const handleCapture = async (dataUrl: string) => {
        setIsCameraOpen(false);
        const newPhoto: Photo = { id: crypto.randomUUID(), name: `Event Photo ${new Date().toLocaleDateString()}`, notes: `For event: ${title}`, date: new Date().toISOString(), folder: 'calendar_events', imageBlob: dataURLtoBlob(dataUrl), imageMimeType: 'image/jpeg', tags: ['calendar', title] };
        await onSavePhoto(newPhoto);
        setPhotoId(newPhoto.id);
    };
    
    const handleSaveRecording = useCallback(async () => {
        if (!audioBlob) return;
        const newRecData: Omit<Recording, 'id' | 'isTranscribing'> = { name: `Rec for ${title || 'Event'} on ${targetDate.toLocaleDateString()}`, date: new Date().toISOString(), transcript: '', notes: `Attached to calendar event.`, audioBlob, tags: ['calendar-event'], photoIds: []};
        const savedRecording = await onSaveRecording(newRecData as Recording);
        setRecordingIds(prev => [...prev, savedRecording.id]);
        setAudioBlob(null);
    }, [audioBlob, onSaveRecording, title, targetDate, setAudioBlob]);

    const handleUnlinkRecording = (id: string) => { setRecordingIds(prev => prev.filter(recId => recId !== id)); };

    return (
        <>
            {isCameraOpen && <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <header className="p-4 border-b border-[var(--theme-border)] flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">{event ? 'Edit Event' : 'New Event'}</h3>
                                <button type="button" onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]"><XIcon /></button>
                            </div>
                            <p className="text-sm text-[var(--theme-text-secondary)]">{targetDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </header>
                        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
                            <section>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event Title" className="w-full text-xl font-semibold bg-gray-100 text-gray-900 rounded-md p-2 border border-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-gray-500" autoFocus />
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes or a description..." rows={3} className="w-full bg-gray-100 text-gray-900 p-2 mt-4 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-gray-500" />
                            </section>
                            
                            <section className="space-y-4 pt-4 border-t border-[var(--theme-border)]/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-100 text-gray-900 p-2 rounded-md border border-gray-400 h-[42px] focus:ring-2 focus:ring-orange-500/50"/></div>
                                    <div><label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Reminder</label><select value={reminderOffset} onChange={e => setReminderOffset(Number(e.target.value))} className="w-full bg-gray-100 text-gray-900 p-2 rounded-md border border-gray-400 h-[42px] focus:ring-2 focus:ring-orange-500/50">{reminderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Color Tag</label>
                                    <div className="flex items-center gap-3 flex-wrap">{defaultColors.map(c => (<button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 flex items-center justify-center ${colorMap[c].bg} ${color === c ? `ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ${colorMap[c].ring}` : ''}`}>{color === c && <CheckIcon className="w-full h-full p-1.5 text-black" />}</button>))}</div>
                                </div>
                            </section>

                            <section className="pt-4 border-t border-[var(--theme-border)]/50">
                                <h4 className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Attachments</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-20 flex-shrink-0">{attachedPhoto ? <PhotoThumbnail photo={attachedPhoto} onSelect={() => {}} onDelete={() => setPhotoId(undefined)} isSelected={false} isSelectionActive={false} onToggleSelection={()=>{}} /> : <button type="button" onClick={() => setIsCameraOpen(true)} className="w-20 h-20 border-2 border-dashed border-[var(--theme-border)] rounded-md flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]/50"><CameraIcon className="h-6 w-6"/><span className="text-xs mt-1">Photo</span></button>}</div>
                                        <div className="flex-1 space-y-2">
                                            {attachedRecordings.map(rec => (<div key={rec.id} className="flex items-center gap-2 bg-black/20 p-1 rounded-md"><div className="flex-grow"><WaveformPlayer audioBlob={rec.audioBlob} /></div><button type="button" onClick={() => handleUnlinkRecording(rec.id)} className="p-1 text-gray-400 hover:text-red-400"><XIcon/></button></div>))}
                                            <div className="flex items-center gap-2 bg-[var(--theme-bg)]/50 p-1 rounded">
                                                <div className="flex-1 h-10 rounded-md overflow-hidden bg-black/20">{ isRecording ? <LiveWaveform analyserNode={analyserNode} /> : (audioBlob && <WaveformPlayer audioBlob={audioBlob} />) }</div>
                                                <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500' : 'bg-[var(--theme-green)]'}`}><MicIcon className="text-black" /></button>
                                                <span className="text-xs font-mono">{formatTime(recordingTime)}</span>
                                                <button type="button" onClick={handleSaveRecording} disabled={!audioBlob} className="text-xs bg-[var(--theme-green)] text-black font-semibold px-2 py-1 rounded disabled:opacity-50">Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <footer className="p-4 bg-black/20 border-t border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                            {event ? <button type="button" onClick={handleDelete} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 flex items-center gap-2"><TrashIcon /> Delete</button> : <div></div>}
                            <button type="submit" className="bg-[var(--theme-green)] hover:opacity-90 text-black font-bold py-2 px-6 rounded-md">Save</button>
                        </footer>
                    </form>
                </div>
            </div>
        </>
    );
};