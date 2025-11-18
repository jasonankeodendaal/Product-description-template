import type { Photo, Recording, Note, LogEntry, Template, CalendarEvent, Video, StorageUsage, StorageBreakdownItem } from './types';

// Re-export types to make them available to other modules.
export type { StorageUsage, StorageBreakdownItem } from './types';

const getBlobSize = (blob: Blob): number => blob.size;
const getStringSize = (str: string): number => new Blob([str]).size;

// Rough estimation of object size by serializing to JSON
const getObjectSize = (obj: any): number => getStringSize(JSON.stringify(obj));

export const calculateStorageUsage = (data: {
    photos: Photo[];
    recordings: Recording[];
    videos: Video[];
    notes: Note[];
    logEntries: LogEntry[];
    templates: Template[];
    calendarEvents: CalendarEvent[];
}): StorageUsage => {
    const photoBytes = data.photos.reduce((acc, p) => acc + getBlobSize(p.imageBlob) + getObjectSize(p), 0);
    const recordingBytes = data.recordings.reduce((acc, r) => acc + getBlobSize(r.audioBlob) + getObjectSize(r), 0);
    const videoBytes = data.videos.reduce((acc, v) => acc + getBlobSize(v.videoBlob) + getObjectSize(v), 0);
    const noteBytes = data.notes.reduce((acc, n) => acc + getObjectSize(n), 0);
    const logBytes = data.logEntries.reduce((acc, l) => acc + getObjectSize(l), 0);
    const templateBytes = data.templates.reduce((acc, t) => acc + getObjectSize(t), 0);
    const calendarBytes = data.calendarEvents.reduce((acc, e) => acc + getObjectSize(e), 0);

    const breakdown: StorageBreakdownItem[] = [
        { name: 'Photos', bytes: photoBytes, count: data.photos.length, fill: '#a78bfa' },
        { name: 'Videos', bytes: videoBytes, count: data.videos.length, fill: '#f43f5e' },
        { name: 'Recordings', bytes: recordingBytes, count: data.recordings.length, fill: '#f472b6' },
        { name: 'Notes', bytes: noteBytes, count: data.notes.length, fill: '#38bdf8' },
        { name: 'Calendar', bytes: calendarBytes, count: data.calendarEvents.length, fill: '#34d399' },
        { name: 'Logs & Templates', bytes: logBytes + templateBytes, count: data.logEntries.length + data.templates.length, fill: '#fb923c' },
    ].filter(item => item.bytes > 0);

    const total = breakdown.reduce((acc, item) => acc + item.bytes, 0);

    return { total, breakdown };
};
