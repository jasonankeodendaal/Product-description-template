
import type { Recording, Template, Photo, Note, ParsedProductData, NoteRecording, LogEntry, CalendarEvent, Video } from "../src/types";
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
        return null;
    }
};


// New helper function to wrap removeEntry with a retry mechanism for InvalidStateError
const removeEntryWithRetry = async (
    dirHandle: FileSystemDirectoryHandle,
    name: string,
    options: { recursive?: boolean } = {},
    // Pass the root handle to re-request permissions if needed
    rootHandleForPerms?: FileSystemDirectoryHandle
) => {
    try {
        await dirHandle.removeEntry(name, options);
    } catch (e) {
        if (e instanceof DOMException && e.name === 'InvalidStateError' && rootHandleForPerms) {
            console.warn(`removeEntry for "${name}" failed due to a state change. Re-requesting permission and retrying...`);
            try {
                // Re-verify permissions. This might prompt the user.
                const permissionState = await (rootHandleForPerms as any).requestPermission({ mode: 'readwrite' });
                if (permissionState !== 'granted') {
                    throw new Error('Permission to access the folder was denied.');
                }
                // The original handle should now be usable again.
                await dirHandle.removeEntry(name, options);
                console.log(`Retry of removeEntry for "${name}" was successful.`);
            } catch (retryError) {
                console.error(`Failed to delete "${name}" on retry:`, retryError);
                // Throw a more user-friendly error.
                throw new Error('Failed to delete. The folder was modified by another program. Please try again.');
            }
        } else {
            // Re-throw other types of errors.
            throw e;
        }
    }
};

// --- New Constants & Helpers ---
const JSON_BACKUPS_DIR = 'JSON_Backups';

// --- Generic Checks ---
const directoryHasData = async (dirHandle: FileSystemDirectoryHandle): Promise<boolean> => {
    for await (const _ of (dirHandle as any).values()) return true;
    return false;
}

// --- Settings & Templates (remain in root) ---
const saveSettings = async (dirHandle: FileSystemDirectoryHandle, settings: SiteSettings) => writeFile(dirHandle, 'settings.json', JSON.stringify(settings, null, 2));
const loadSettings = async (dirHandle: FileSystemDirectoryHandle): Promise<SiteSettings | null> => JSON.parse(await readFile(dirHandle, 'settings.json') || 'null');
const saveTemplates = async (dirHandle: FileSystemDirectoryHandle, templates: Template[]) => writeFile(dirHandle, 'templates.json', JSON.stringify(templates, null, 2));
const loadTemplates = async (dirHandle: FileSystemDirectoryHandle): Promise<Template[] | null> => JSON.parse(await readFile(dirHandle, 'templates.json') || 'null');

// --- Paired Media + JSON Entities (Recordings, Photos, etc.) ---

const savePairedEntity = async (dirHandle: FileSystemDirectoryHandle, entity: {id: string; folder?: string}, mediaBlob: Blob, mediaExt: string, metadata: object) => {
    const dataPath = entity.folder || '';
    const dataDir = await getOrCreateNestedDirectory(dirHandle, dataPath);
    await writeFile(dataDir, `${entity.id}.${mediaExt}`, mediaBlob);

    const jsonBackupRoot = await getOrCreateDirectory(dirHandle, JSON_BACKUPS_DIR);
    const jsonDir = await getOrCreateNestedDirectory(jsonBackupRoot, dataPath);
    await writeFile(jsonDir, `${entity.id}.json`, JSON.stringify(metadata, null, 2));
};

const deletePairedEntity = async (dirHandle: FileSystemDirectoryHandle, entity: {id: string; folder?: string}, mediaExt: string) => {
    const dataPath = entity.folder || '';
    // Delete media file from primary location
    try {
        const dataDir = await getNestedDirectory(dirHandle, dataPath);
        if (dataDir) await removeEntryWithRetry(dataDir, `${entity.id}.${mediaExt}`, {}, dirHandle);
    } catch(e) {
        if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
            console.error(`Could not delete media file for ${entity.id}:`, e);
            throw e; // Propagate the error
        }
    }
    
    // Delete JSON from new location
    try {
        const jsonBackupRoot = await dirHandle.getDirectoryHandle(JSON_BACKUPS_DIR);
        const jsonDir = await getNestedDirectory(jsonBackupRoot, dataPath);
        if (jsonDir) await removeEntryWithRetry(jsonDir, `${entity.id}.json`, {}, dirHandle);
    } catch (e) {
        if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
            console.error(`Could not delete JSON backup for ${entity.id}:`, e);
            throw e; // Propagate the error
        }
    }

    // Delete JSON from old location (for migration cleanup)
    try {
        const dataDir = await getNestedDirectory(dirHandle, dataPath);
        if (dataDir) await removeEntryWithRetry(dataDir, `${entity.id}.json`, {}, dirHandle);
    } catch(e) {
        if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
            // This is less critical, so just a warning is fine.
            console.warn(`Could not delete legacy JSON for ${entity.id}:`, e);
        }
    }
};

// --- JSON-Only Entities (Notes, Logs, etc.) ---
const saveJsonOnlyEntity = async (dirHandle: FileSystemDirectoryHandle, entityPluralName: string, entity: { id: string }) => {
    const jsonBackupRoot = await getOrCreateDirectory(dirHandle, JSON_BACKUPS_DIR);
    const jsonEntityDir = await getOrCreateDirectory(jsonBackupRoot, entityPluralName);
    await writeFile(jsonEntityDir, `${entity.id}.json`, JSON.stringify(entity, null, 2));
};

const deleteJsonOnlyEntity = async (dirHandle: FileSystemDirectoryHandle, entityPluralName: string, id: string) => {
    // Delete from new location
    try {
        const jsonBackupRoot = await dirHandle.getDirectoryHandle(JSON_BACKUPS_DIR);
        const jsonEntityDir = await jsonBackupRoot.getDirectoryHandle(entityPluralName);
        await removeEntryWithRetry(jsonEntityDir, `${id}.json`, {}, dirHandle);
    } catch (e) {
        if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
            console.error(`Could not delete new JSON for ${id}:`, e);
            throw e; // Propagate error
        }
    }
    // Delete from old location
    try {
        const entityDir = await dirHandle.getDirectoryHandle(entityPluralName);
        await removeEntryWithRetry(entityDir, `${id}.json`, {}, dirHandle);
    } catch (e) {
        if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
            console.warn(`Could not delete legacy JSON for ${id}:`, e);
        }
    }
};

const loadJsonOnlyEntities = async <T extends {id: string}>(dirHandle: FileSystemDirectoryHandle, entityNamePlural: string): Promise<T[]> => {
    const entityMap = new Map<string, T>();

    const processDir = async (dir: FileSystemDirectoryHandle) => {
        for await (const entry of (dir as any).values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    const entity = JSON.parse(await file.text());
                    if (entity.id && !entityMap.has(entity.id)) {
                        entityMap.set(entity.id, entity);
                    }
                } catch(e) { console.warn(`Failed to load entity from ${entry.name}`, e); }
            }
        }
    }
    // Try new structure first
    try {
        const jsonBackupRoot = await dirHandle.getDirectoryHandle(JSON_BACKUPS_DIR);
        const jsonEntityDir = await jsonBackupRoot.getDirectoryHandle(entityNamePlural);
        await processDir(jsonEntityDir);
    } catch (e) {}
    // Then try old structure
    try {
        const entityDir = await dirHandle.getDirectoryHandle(entityNamePlural);
        await processDir(entityDir);
    } catch (e) {}
    
    return Array.from(entityMap.values());
};

// --- Recordings ---
const saveRecordingToDirectory = async (dirHandle: FileSystemDirectoryHandle, recording: Recording) => {
    const { audioBlob, isTranscribing, ...metadata } = recording;
    await savePairedEntity(dirHandle, { id: recording.id, folder: 'recordings'}, audioBlob, 'webm', metadata);
};

const deleteRecordingFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    await deletePairedEntity(dirHandle, { id, folder: 'recordings' }, 'webm');
};

const loadRecordingsFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<{ recordings: Recording[], errors: string[] }> => {
    const recordingsMap = new Map<string, Recording>();
    const errors: string[] = [];

    // Load from new structure
    try {
        const jsonBackupRoot = await dirHandle.getDirectoryHandle(JSON_BACKUPS_DIR);
        const jsonRecsDir = await jsonBackupRoot.getDirectoryHandle('recordings');
        const mediaDir = await dirHandle.getDirectoryHandle('recordings');
        for await (const entry of (jsonRecsDir as any).values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const metadata = JSON.parse(await (await (entry as FileSystemFileHandle).getFile()).text());
                    if (!recordingsMap.has(metadata.id)) {
                        const audioHandle = await mediaDir.getFileHandle(`${metadata.id}.webm`);
                        const audioBlob = await audioHandle.getFile();
                        recordingsMap.set(metadata.id, { ...metadata, audioBlob });
                    }
                } catch (e) { errors.push(`Failed to load recording ${entry.name}: ${e}`); }
            }
        }
    } catch(e) {}
    
    // Load from old structure
    try {
        const mediaDir = await dirHandle.getDirectoryHandle('recordings');
        for await (const entry of (mediaDir as any).values()) {
             if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const metadata = JSON.parse(await (await (entry as FileSystemFileHandle).getFile()).text());
                    if (!recordingsMap.has(metadata.id)) {
                        const audioHandle = await mediaDir.getFileHandle(`${metadata.id}.webm`);
                        const audioBlob = await audioHandle.getFile();
                        recordingsMap.set(metadata.id, { ...metadata, audioBlob });
                    }
                } catch (e) { errors.push(`Failed to load legacy recording ${entry.name}: ${e}`); }
            }
        }
    } catch(e) {}

    return { recordings: Array.from(recordingsMap.values()), errors };
};

// --- Note Recordings ---
const saveNoteRecordingToDirectory = async (dirHandle: FileSystemDirectoryHandle, recording: NoteRecording) => {
    const { audioBlob, ...metadata } = recording;
    await savePairedEntity(dirHandle, { id: recording.id, folder: 'note_recordings' }, audioBlob, 'webm', metadata);
};
const deleteNoteRecordingFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string) => {
    await deletePairedEntity(dirHandle, { id, folder: 'note_recordings' }, 'webm');
};
const loadNoteRecordingsFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<NoteRecording[]> => {
    // Similar combined loading logic as recordings
    const recordingsMap = new Map<string, NoteRecording>();
    try {
        const jsonBackupRoot = await dirHandle.getDirectoryHandle(JSON_BACKUPS_DIR);
        const jsonRecsDir = await jsonBackupRoot.getDirectoryHandle('note_recordings');
        const mediaDir = await dirHandle.getDirectoryHandle('note_recordings');
        for await (const entry of (jsonRecsDir as any).values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const metadata = JSON.parse(await (await (entry as FileSystemFileHandle).getFile()).text());
                    if (!recordingsMap.has(metadata.id)) {
                        const audioHandle = await mediaDir.getFileHandle(`${metadata.id}.webm`);
                        const audioBlob = await audioHandle.getFile();
                        recordingsMap.set(metadata.id, { ...metadata, audioBlob });
                    }
                } catch (e) {}
            }
        }
    } catch(e) {}
    try {
        const mediaDir = await dirHandle.getDirectoryHandle('note_recordings');
        for await (const entry of (mediaDir as any).values()) {
             if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                try {
                    const metadata = JSON.parse(await (await (entry as FileSystemFileHandle).getFile()).text());
                    if (!recordingsMap.has(metadata.id)) {
                        const audioHandle = await mediaDir.getFileHandle(`${metadata.id}.webm`);
                        const audioBlob = await audioHandle.getFile();
                        recordingsMap.set(metadata.id, { ...metadata, audioBlob });
                    }
                } catch (e) {}
            }
        }
    } catch(e) {}
    return Array.from(recordingsMap.values());
};

// --- Photos & Videos ---
const savePhotoToDirectory = async (dirHandle: FileSystemDirectoryHandle, photo: Photo) => {
    const { imageBlob, ...metadata } = photo;
    const ext = photo.imageMimeType.split('/')[1] || 'png';
    await savePairedEntity(dirHandle, photo, imageBlob, ext, metadata);
};

const deletePhotoFromDirectory = async (dirHandle: FileSystemDirectoryHandle, photo: Photo) => {
    const ext = photo.imageMimeType.split('/')[1] || 'png';
    await deletePairedEntity(dirHandle, photo, ext);
};

const saveVideoToDirectory = async (dirHandle: FileSystemDirectoryHandle, video: Video) => {
    const { videoBlob, ...metadata } = video;
    const ext = video.videoMimeType.split('/')[1] || 'mp4';
    await savePairedEntity(dirHandle, video, videoBlob, ext, metadata);
};

const deleteVideoFromDirectory = async (dirHandle: FileSystemDirectoryHandle, video: Video) => {
    const ext = video.videoMimeType.split('/')[1] || 'mp4';
    await deletePairedEntity(dirHandle, video, ext);
};

const reservedDirs = ['recordings', 'notes', 'logs', 'note_recordings', 'calendar_events', 'videos'];

const loadMediaFromDirectory = async <T extends Photo | Video>(dirHandle: FileSystemDirectoryHandle, mediaType: 'photo' | 'video'): Promise<T[]> => {
    const mediaMap = new Map<string, T>();
    const typeGuardString = mediaType === 'photo' ? '"imageMimeType"' : '"videoMimeType"';
    const mimeTypeField = mediaType === 'photo' ? 'imageMimeType' : 'videoMimeType';
    const blobField = mediaType === 'photo' ? 'imageBlob' : 'videoBlob';
    const defaultExt = mediaType === 'photo' ? 'png' : 'mp4';

    const processJsonEntry = async (entry: FileSystemFileHandle, dataRootDir: FileSystemDirectoryHandle) => {
        try {
            const file = await entry.getFile();
            const text = await file.text();
            if (!text.includes(typeGuardString)) return;

            const metadata = JSON.parse(text);
            if (!metadata.id || !metadata.folder || mediaMap.has(metadata.id)) return;
            
            const mediaFolderHandle = await getNestedDirectory(dataRootDir, metadata.folder);
            if (mediaFolderHandle) {
                const ext = metadata[mimeTypeField]?.split('/')[1] || defaultExt;
                const mediaFileHandle = await mediaFolderHandle.getFileHandle(`${metadata.id}.${ext}`);
                const mediaBlob = await mediaFileHandle.getFile();
                mediaMap.set(metadata.id, { ...metadata, [blobField]: mediaBlob } as T);
            }
        } catch(e) {
            if (!(e instanceof DOMException && e.name === 'NotFoundError')) console.warn(`Could not process ${mediaType} metadata ${entry.name}:`, e);
        }
    };

    // 1. New structure
    try {
        const jsonBackupRoot = await dirHandle.getDirectoryHandle(JSON_BACKUPS_DIR);
        const scan = async (dir: FileSystemDirectoryHandle) => {
            for await (const entry of (dir as any).values()) {
                if (entry.kind === 'directory') await scan(entry as FileSystemDirectoryHandle);
                else if (entry.kind === 'file' && entry.name.endsWith('.json')) await processJsonEntry(entry as FileSystemFileHandle, dirHandle);
            }
        };
        await scan(jsonBackupRoot);
    } catch(e) {}
    
    // 2. Old structure
    try {
        const scan = async (dir: FileSystemDirectoryHandle, path: string[]) => {
            if (path.length === 0 && (reservedDirs.includes(dir.name) || dir.name === JSON_BACKUPS_DIR)) return;
            for await (const entry of (dir as any).values()) {
                if (entry.kind === 'directory') await scan(entry as FileSystemDirectoryHandle, [...path, entry.name]);
                else if (entry.kind === 'file' && entry.name.endsWith('.json')) await processJsonEntry(entry as FileSystemFileHandle, dir);
            }
        };
        await scan(dirHandle, []);
    } catch(e) {}
    
    return Array.from(mediaMap.values());
};

const loadPhotosFromDirectory = (dirHandle: FileSystemDirectoryHandle): Promise<Photo[]> => loadMediaFromDirectory<Photo>(dirHandle, 'photo');
const loadVideosFromDirectory = (dirHandle: FileSystemDirectoryHandle): Promise<Video[]> => loadMediaFromDirectory<Video>(dirHandle, 'video');


// --- Notes, Logs, Calendar ---
const saveNoteToDirectory = (dirHandle: FileSystemDirectoryHandle, note: Note) => saveJsonOnlyEntity(dirHandle, 'notes', note);
const deleteNoteFromDirectory = (dirHandle: FileSystemDirectoryHandle, id: string) => deleteJsonOnlyEntity(dirHandle, 'notes', id);
const loadNotesFromDirectory = (dirHandle: FileSystemDirectoryHandle): Promise<Note[]> => loadJsonOnlyEntities<Note>(dirHandle, 'notes');

const saveLogEntryToDirectory = (dirHandle: FileSystemDirectoryHandle, entry: LogEntry) => saveJsonOnlyEntity(dirHandle, 'logs', entry);
const loadLogEntriesFromDirectory = (dirHandle: FileSystemDirectoryHandle): Promise<LogEntry[]> => loadJsonOnlyEntities<LogEntry>(dirHandle, 'logs');

const saveCalendarEventToDirectory = (dirHandle: FileSystemDirectoryHandle, event: CalendarEvent) => saveJsonOnlyEntity(dirHandle, 'calendar_events', event);
const deleteCalendarEventFromDirectory = (dirHandle: FileSystemDirectoryHandle, id: string) => deleteJsonOnlyEntity(dirHandle, 'calendar_events', id);
const loadCalendarEventsFromDirectory = (dirHandle: FileSystemDirectoryHandle): Promise<CalendarEvent[]> => loadJsonOnlyEntities<CalendarEvent>(dirHandle, 'calendar_events');

// --- Bulk Save ---
const saveAllDataToDirectory = async (dirHandle: FileSystemDirectoryHandle, data: { recordings: Recording[], photos: Photo[], videos: Video[], notes: Note[], noteRecordings: NoteRecording[], logEntries: LogEntry[], calendarEvents: CalendarEvent[] }) => {
    for (const rec of data.recordings) await saveRecordingToDirectory(dirHandle, rec);
    for (const photo of data.photos) await savePhotoToDirectory(dirHandle, photo);
    for (const video of data.videos) await saveVideoToDirectory(dirHandle, video);
    for (const note of data.notes) await saveNoteToDirectory(dirHandle, note);
    for (const noteRec of data.noteRecordings) await saveNoteRecordingToDirectory(dirHandle, noteRec);
    for (const log of data.logEntries) await saveLogEntryToDirectory(dirHandle, log);
    for (const event of data.calendarEvents) await saveCalendarEventToDirectory(dirHandle, event);
}

// --- Product Description Specific ---
const saveProductDescription = async (dirHandle: FileSystemDirectoryHandle, item: ParsedProductData, structuredData: Record<string, string>) => {
    const sanitize = (str: string) => (str || '').replace(/[^a-zA-Z0-9-_\.]/g, '_').trim();
    const brandFolder = sanitize(item.brand) || 'Unbranded';
    
    if (!item.sku || !item.sku.trim()) {
        throw new Error("Cannot save to folder: SKU is missing. Please ensure the SKU is present in the product information to properly separate variants.");
    }

    const skuFolder = sanitize(item.sku);
    const productPath = `Generated_Content/${brandFolder}/${skuFolder}`;

    // Save main description text file
    const productDirHandle = await getOrCreateNestedDirectory(dirHandle, productPath);
    await writeFile(productDirHandle, `description.txt`, item.fullText);
    
    // Save structured data to JSON backup folder
    const jsonBackupRoot = await getOrCreateDirectory(dirHandle, JSON_BACKUPS_DIR);
    const jsonProductDirHandle = await getOrCreateNestedDirectory(jsonBackupRoot, productPath);
    await writeFile(jsonProductDirHandle, 'details.json', JSON.stringify(structuredData, null, 2));
}

// --- New Functions for File Browser ---

const getDirectoryHandleByPath = async (rootHandle: FileSystemDirectoryHandle, pathParts: string[]): Promise<FileSystemDirectoryHandle> => {
    let currentHandle = rootHandle;
    for (const part of pathParts) {
        if (part) { // handle empty parts from splitting
            currentHandle = await currentHandle.getDirectoryHandle(part);
        }
    }
    return currentHandle;
};

const renameItem = async (
    rootHandle: FileSystemDirectoryHandle,
    path: string[],
    oldName: string,
    newName: string
): Promise<void> => {
    if (!newName || newName.includes('/') || newName === '.' || newName === '..') {
        throw new Error('Invalid new name.');
    }
    if (newName === oldName) {
        return; // Nothing to do
    }

    const parentHandle = await getDirectoryHandleByPath(rootHandle, path);

    // Check for existing item with the new name to prevent overwriting
    try {
        await parentHandle.getDirectoryHandle(newName);
        throw new Error(`An item named "${newName}" already exists.`);
    } catch (e: any) {
        if (e.name !== 'NotFoundError') throw e;
    }
    try {
        await parentHandle.getFileHandle(newName);
        throw new Error(`An item named "${newName}" already exists.`);
    } catch (e: any) {
        if (e.name !== 'NotFoundError') throw e;
    }

    // The move() method renames an entry within the same directory.
    await (parentHandle as any).move(oldName, newName);
};


const listDirectoryContents = async (rootHandle: FileSystemDirectoryHandle, path: string): Promise<{ name: string; kind: 'file' | 'directory'; size?: number; lastModified?: number; }[]> => {
    try {
        const pathParts = path.split('/').filter(p => p);
        const dirHandle = await getDirectoryHandleByPath(rootHandle, pathParts);
        
        const contents = [];
        for await (const entry of (dirHandle as any).values()) {
            let details: { name: string; kind: 'file' | 'directory'; size?: number; lastModified?: number; } = {
                name: entry.name,
                kind: entry.kind,
            };

            if (entry.kind === 'file') {
                try {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    details.size = file.size;
                    details.lastModified = file.lastModified;
                } catch (e) {
                    console.warn(`Could not get file details for ${entry.name}`, e);
                }
            }
            contents.push(details);
        }
        return contents.sort((a, b) => {
            if (a.kind === b.kind) return a.name.localeCompare(b.name);
            return a.kind === 'directory' ? -1 : 1; // Folders first
        });
    } catch (error) {
        console.warn(`Could not list directory contents for path "${path}":`, error);
        return [];
    }
};

const readFileContentByPath = async (rootHandle: FileSystemDirectoryHandle, path: string): Promise<string | Blob> => {
    try {
        const pathParts = path.split('/');
        const fileName = pathParts.pop();
        if (!fileName) throw new Error("Invalid file path");
        
        const dirHandle = await getDirectoryHandleByPath(rootHandle, pathParts.filter(p => p));
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();

        if (file.type.startsWith('text/') || file.type === 'application/json') {
            return await file.text();
        }
        return file; // Return as Blob for images/videos
    } catch (error) {
        console.error(`Error reading file content for path "${path}":`, error);
        throw error;
    }
};

const deleteItemFromDirectory = async (
    rootHandle: FileSystemDirectoryHandle,
    path: string[],
    itemName: string,
    isRecursive: boolean
): Promise<void> => {
    const parentHandle = await getDirectoryHandleByPath(rootHandle, path);
    await removeEntryWithRetry(parentHandle, itemName, { recursive: isRecursive }, rootHandle);
};


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
    saveVideoToDirectory,
    loadVideosFromDirectory,
    deleteVideoFromDirectory,
    saveNoteToDirectory,
    loadNotesFromDirectory,
    deleteNoteFromDirectory,
    saveNoteRecordingToDirectory,
    loadNoteRecordingsFromDirectory,
    deleteNoteRecordingFromDirectory,
    saveLogEntryToDirectory,
    loadLogEntriesFromDirectory,
    saveCalendarEventToDirectory,
    loadCalendarEventsFromDirectory,
    deleteCalendarEventFromDirectory,
    saveAllDataToDirectory,
    saveProductDescription,
    listDirectoryContents,
    readFileContentByPath,
    renameItem,
    deleteItemFromDirectory,
};
