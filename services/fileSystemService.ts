import { Recording, Template, Photo, Note, ParsedProductData, NoteRecording, LogEntry, CalendarEvent } from "../App";
import { SiteSettings } from "../constants";

const getDirectoryHandle = async (): Promise<FileSystemDirectoryHandle> => {
    if (!('showDirectoryPicker' in window)) throw new Error('File System Access API is not supported.');
    return await (window as any).showDirectoryPicker({ mode: 'readwrite' });
};

const writeFile = async (dirHandle: FileSystemDirectoryHandle, fileName: string, content: Blob | string) => {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
};

const readFile = async (dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string | null> => {
    try {
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return await file.text();
    } catch (e) {
        if (e instanceof DOMException && e.name === 'NotFoundError') return null;
        throw e;
    }
}

const getOrCreateDirectory = async (parentHandle: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> => {
    return await parentHandle.getDirectoryHandle(name, { create: true });
}

// --- Generic Checks ---
const directoryHasData = async (dirHandle: FileSystemDirectoryHandle): Promise<boolean> => {
    for await (const entry of dirHandle.values()) return true;
    return false;
}

// --- Settings ---
const saveSettings = async (dirHandle: FileSystemDirectoryHandle, settings: SiteSettings) => writeFile(dirHandle, 'settings.json', JSON.stringify(settings, null, 2));
const loadSettings = async (dirHandle: FileSystemDirectoryHandle): Promise<SiteSettings | null> => JSON.parse(await readFile(dirHandle, 'settings.json') || 'null');

// --- Templates ---
const saveTemplates = async (dirHandle: FileSystemDirectoryHandle, templates: Template[]) => writeFile(dirHandle, 'templates.json', JSON.stringify(templates, null, 2));
const loadTemplates = async (dirHandle: FileSystemDirectoryHandle): Promise<Template[] | null> => JSON.parse(await readFile(dirHandle, 'templates.json') || 'null');

// --- Recordings ---
const saveRecordingToDirectory = async (dirHandle: FileSystemDirectoryHandle, recording: Recording) => {
    const recsDir = await getOrCreateDirectory(dirHandle, 'recordings');
    const metadata: Omit<Recording, 'audioBlob' | 'isTranscribing'> = { ...recording };
    delete (metadata as any).audioBlob;
    delete (metadata as any).isTranscribing;
    await writeFile(recsDir, `${recording.id}.json`, JSON.stringify(metadata, null, 2));
    await writeFile(recsDir, `${recording.id}.webm`, recording.audioBlob);
};

const deleteRecordingFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    const recsDir = await getOrCreateDirectory(dirHandle, 'recordings');
    try { await recsDir.removeEntry(`${id}.json`); } catch(e) {}
    try { await recsDir.removeEntry(`${id}.webm`); } catch(e) {}
};

const loadRecordingsFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<{ recordings: Recording[], errors: string[] }> => {
    const recordings: Recording[] = [];
    const errors: string[] = [];
    try {
        const recsDir = await dirHandle.getDirectoryHandle('recordings');
        for await (const entry of recsDir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    const metadata = JSON.parse(await file.text());
                    const audioHandle = await recsDir.getFileHandle(`${metadata.id}.webm`);
                    const audioBlob = await audioHandle.getFile();
                    recordings.push({ ...metadata, audioBlob });
                } catch (e) { errors.push(`Failed to load recording ${entry.name}: ${e}`); }
            }
        }
    } catch (e) { /* recordings dir doesn't exist, return empty */ }
    return { recordings, errors };
};

// --- Note Recordings ---
const saveNoteRecordingToDirectory = async (dirHandle: FileSystemDirectoryHandle, recording: NoteRecording) => {
    const recsDir = await getOrCreateDirectory(dirHandle, 'note_recordings');
    const metadata: Omit<NoteRecording, 'audioBlob'> = { ...recording };
    delete (metadata as any).audioBlob;
    await writeFile(recsDir, `${recording.id}.json`, JSON.stringify(metadata, null, 2));
    await writeFile(recsDir, `${recording.id}.webm`, recording.audioBlob);
};

const deleteNoteRecordingFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    const recsDir = await getOrCreateDirectory(dirHandle, 'note_recordings');
    try { await recsDir.removeEntry(`${id}.json`); } catch(e) {}
    try { await recsDir.removeEntry(`${id}.webm`); } catch(e) {}
};

const loadNoteRecordingsFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<NoteRecording[]> => {
    const recordings: NoteRecording[] = [];
    try {
        const recsDir = await dirHandle.getDirectoryHandle('note_recordings');
        for await (const entry of recsDir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    const metadata = JSON.parse(await file.text());
                    const audioHandle = await recsDir.getFileHandle(`${metadata.id}.webm`);
                    const audioBlob = await audioHandle.getFile();
                    recordings.push({ ...metadata, audioBlob });
                } catch (e) { console.error(`Failed to load note recording ${entry.name}: ${e}`); }
            }
        }
    } catch (e) { /* note_recordings dir doesn't exist, return empty */ }
    return recordings;
};

// --- Photos ---
const getOrCreateNestedDirectory = async (root: FileSystemDirectoryHandle, path: string): Promise<FileSystemDirectoryHandle> => {
    let current = root;
    const parts = path.split('/').filter(p => p.trim() !== '' && p !== '.');
    for (const part of parts) {
        current = await current.getDirectoryHandle(part, { create: true });
    }
    return current;
};

const getNestedDirectory = async (root: FileSystemDirectoryHandle, path: string): Promise<FileSystemDirectoryHandle | null> => {
    let current = root;
    const parts = path.split('/').filter(p => p.trim() !== '' && p !== '.');
    try {
        for (const part of parts) {
            current = await current.getDirectoryHandle(part);
        }
        return current;
    } catch (e) {
        return null; // A directory in the path doesn't exist
    }
};


const savePhotoToDirectory = async (dirHandle: FileSystemDirectoryHandle, photo: Photo) => {
    // The photo.folder property is expected to be 'brand/sku'
    const productDir = await getOrCreateNestedDirectory(dirHandle, photo.folder || '_uncategorized');
    
    const metadata: Omit<Photo, 'imageBlob'> = { ...photo };
    delete (metadata as any).imageBlob;
    
    const ext = photo.imageMimeType.split('/')[1] || 'png';
    await writeFile(productDir, `${photo.id}.json`, JSON.stringify(metadata, null, 2));
    await writeFile(productDir, `${photo.id}.${ext}`, photo.imageBlob);
};

const deletePhotoFromDirectory = async (dirHandle: FileSystemDirectoryHandle, photo: Photo) => {
    try {
        const productDir = await getNestedDirectory(dirHandle, photo.folder || '_uncategorized');
        
        if (!productDir) return; // Folder doesn't exist, so nothing to delete.

        const ext = photo.imageMimeType.split('/')[1] || 'png';
        try { await productDir.removeEntry(`${photo.id}.json`); } catch(e) {}
        try { await productDir.removeEntry(`${photo.id}.${ext}`); } catch(e) {}
    } catch (e) { /* Parent dirs might not exist, ignore */ }
};

const loadPhotosFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<Photo[]> => {
    const photos: Photo[] = [];
    const reservedDirs = ['recordings', 'notes', 'logs', 'note_recordings', 'calendar_events'];

    const processDirectory = async (dir: FileSystemDirectoryHandle) => {
        for await (const entry of dir.values()) {
            if (entry.kind === 'directory') {
                if (!reservedDirs.includes(entry.name)) {
                    await processDirectory(entry as FileSystemDirectoryHandle);
                }
            } else if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    const text = await file.text();
                    // Quick check to avoid parsing non-photo JSON files like settings.json
                    if (text.includes('"imageMimeType"')) {
                        const metadata = JSON.parse(text);
                        // Be certain it's a photo object before proceeding
                        if (metadata.id && metadata.folder && metadata.date) {
                            const ext = metadata.imageMimeType?.split('/')[1] || 'png';
                            const imageHandle = await dir.getFileHandle(`${metadata.id}.${ext}`);
                            const imageBlob = await imageHandle.getFile();
                            photos.push({ ...metadata, imageBlob });
                        }
                    }
                } catch (e) {
                     if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
                         console.error(`Could not process potential photo metadata file ${entry.name} in ${dir.name}:`, e);
                    }
                }
            }
        }
    };

    await processDirectory(dirHandle);
    return photos;
}

// --- Notes ---
const saveNoteToDirectory = async (dirHandle: FileSystemDirectoryHandle, note: Note) => {
    const notesDir = await getOrCreateDirectory(dirHandle, 'notes');
    await writeFile(notesDir, `${note.id}.json`, JSON.stringify(note, null, 2));
};

const deleteNoteFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    try {
        const notesDir = await dirHandle.getDirectoryHandle('notes');
        await notesDir.removeEntry(`${id}.json`);
    } catch(e) {}
}

const loadNotesFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<Note[]> => {
    const notes: Note[] = [];
    try {
        const notesDir = await dirHandle.getDirectoryHandle('notes');
        for await (const entry of notesDir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    notes.push(JSON.parse(await file.text()));
                } catch(e) { console.error(`Failed to load note ${entry.name}`, e); }
            }
        }
    } catch(e) { /* notes dir doesn't exist */ }
    return notes;
}

// --- Log Entries ---
const saveLogEntryToDirectory = async (dirHandle: FileSystemDirectoryHandle, entry: LogEntry) => {
    const logsDir = await getOrCreateDirectory(dirHandle, 'logs');
    await writeFile(logsDir, `${entry.id}.json`, JSON.stringify(entry, null, 2));
};

const deleteLogEntryFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    try {
        const logsDir = await dirHandle.getDirectoryHandle('logs');
        await logsDir.removeEntry(`${id}.json`);
    } catch(e) {}
}

const loadLogEntriesFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<LogEntry[]> => {
    const entries: LogEntry[] = [];
    try {
        const logsDir = await dirHandle.getDirectoryHandle('logs');
        for await (const entry of logsDir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    entries.push(JSON.parse(await file.text()));
                } catch(e) { console.error(`Failed to load log entry ${entry.name}`, e); }
            }
        }
    } catch(e) { /* logs dir doesn't exist */ }
    return entries;
}

// --- Calendar Events ---
const saveCalendarEventToDirectory = async (dirHandle: FileSystemDirectoryHandle, event: CalendarEvent) => {
    const eventsDir = await getOrCreateDirectory(dirHandle, 'calendar_events');
    await writeFile(eventsDir, `${event.id}.json`, JSON.stringify(event, null, 2));
};

const deleteCalendarEventFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    try {
        const eventsDir = await dirHandle.getDirectoryHandle('calendar_events');
        await eventsDir.removeEntry(`${id}.json`);
    } catch(e) {}
}

const loadCalendarEventsFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<CalendarEvent[]> => {
    const events: CalendarEvent[] = [];
    try {
        const eventsDir = await dirHandle.getDirectoryHandle('calendar_events');
        for await (const entry of eventsDir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    events.push(JSON.parse(await file.text()));
                } catch(e) { console.error(`Failed to load calendar event ${entry.name}`, e); }
            }
        }
    } catch(e) { /* calendar_events dir doesn't exist */ }
    return events;
}


const saveAllDataToDirectory = async (dirHandle: FileSystemDirectoryHandle, data: { recordings: Recording[], photos: Photo[], notes: Note[], noteRecordings: NoteRecording[], logEntries: LogEntry[], calendarEvents: CalendarEvent[] }) => {
    for (const rec of data.recordings) await saveRecordingToDirectory(dirHandle, rec);
    for (const photo of data.photos) await savePhotoToDirectory(dirHandle, photo);
    for (const note of data.notes) await saveNoteToDirectory(dirHandle, note);
    for (const noteRec of data.noteRecordings) await saveNoteRecordingToDirectory(dirHandle, noteRec);
    for (const log of data.logEntries) await saveLogEntryToDirectory(dirHandle, log);
    for (const event of data.calendarEvents) await saveCalendarEventToDirectory(dirHandle, event);
}

const saveProductDescription = async (dirHandle: FileSystemDirectoryHandle, item: ParsedProductData, structuredData: Record<string, string>) => {
    const sanitize = (str: string) => (str || '').replace(/[^a-zA-Z0-9-_\.]/g, '_').trim();

    const brandFolder = sanitize(item.brand) || 'Unbranded';
    
    // Use sanitized SKU if available, otherwise fallback to a sanitized product name.
    const productIdentifier = sanitize(item.sku) || sanitize(item.name);
    
    // As a last resort if both SKU and name are empty, use a timestamp
    const skuFolder = productIdentifier || `product_${Date.now()}`;
    
    const productPath = `Generated_Content/${brandFolder}/${skuFolder}`;
    const productDirHandle = await getOrCreateNestedDirectory(dirHandle, productPath);

    // Save the main description text file
    await writeFile(productDirHandle, `description.txt`, item.fullText);
    
    // Also save the structured data as a JSON file for easy machine reading
    await writeFile(productDirHandle, 'details.json', JSON.stringify(structuredData, null, 2));
}

export const fileSystemService = {
    getDirectoryHandle,
    directoryHasData,
    saveSettings,
    loadSettings,
    saveTemplates,
    loadTemplates,
    saveRecordingToDirectory,
    loadRecordingsFromDirectory,
    deleteRecordingFromDirectory,
    savePhotoToDirectory,
    loadPhotosFromDirectory,
    deletePhotoFromDirectory,
    saveNoteToDirectory,
    loadNotesFromDirectory,
    deleteNoteFromDirectory,
    saveNoteRecordingToDirectory,
    loadNoteRecordingsFromDirectory,
    deleteNoteRecordingFromDirectory,
    saveLogEntryToDirectory,
    loadLogEntriesFromDirectory,
    deleteLogEntryFromDirectory,
    saveCalendarEventToDirectory,
    loadCalendarEventsFromDirectory,
    deleteCalendarEventFromDirectory,
    saveAllDataToDirectory,
    saveProductDescription,
};