import { Recording, Template } from "../App";
// FIX: SiteSettings is exported from constants.ts, while Recording and Template are from App.tsx.
import { SiteSettings } from "../constants";

const getDirectoryHandle = async (): Promise<FileSystemDirectoryHandle> => {
    if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API is not supported in this browser.');
    }
    const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
    });
    return handle;
};

const directoryHasData = async (dirHandle: FileSystemDirectoryHandle): Promise<boolean> => {
    try {
        await dirHandle.getFileHandle('settings.json');
        return true;
    } catch (e) {
        // settings.json not found, check for templates
    }
     try {
        await dirHandle.getFileHandle('templates.json');
        return true;
    } catch (e) {
        // neither settings nor templates found
    }
    return false;
}

// --- Settings ---
const saveSettings = async (dirHandle: FileSystemDirectoryHandle, settings: SiteSettings): Promise<void> => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const fileHandle = await dirHandle.getFileHandle('settings.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
};

const loadSettings = async (dirHandle: FileSystemDirectoryHandle): Promise<SiteSettings | null> => {
    try {
        const fileHandle = await dirHandle.getFileHandle('settings.json');
        const file = await fileHandle.getFile();
        const text = await file.text();
        return JSON.parse(text);
    } catch (error) {
        // @ts-ignore
        if (error.name === 'NotFoundError') return null;
        console.error("Failed to load settings.json:", error);
        return null;
    }
};

// --- Templates ---
const saveTemplates = async (dirHandle: FileSystemDirectoryHandle, templates: Template[]): Promise<void> => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const fileHandle = await dirHandle.getFileHandle('templates.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
};

const loadTemplates = async (dirHandle: FileSystemDirectoryHandle): Promise<Template[] | null> => {
    try {
        const fileHandle = await dirHandle.getFileHandle('templates.json');
        const file = await fileHandle.getFile();
        const text = await file.text();
        return JSON.parse(text);
    } catch (error) {
         // @ts-ignore
        if (error.name === 'NotFoundError') return null;
        console.error("Failed to load templates.json:", error);
        return null;
    }
};


// --- Recordings ---
const saveRecordingToDirectory = async (dirHandle: FileSystemDirectoryHandle, recording: Recording): Promise<void> => {
    // Save metadata
    const metadata: Omit<Recording, 'audioBlob' | 'isTranscribing'> = { ...recording };
    delete (metadata as any).audioBlob;
    delete (metadata as any).isTranscribing;
    
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const jsonFileHandle = await dirHandle.getFileHandle(`${recording.id}.json`, { create: true });
    const jsonWritable = await jsonFileHandle.createWritable();
    await jsonWritable.write(jsonBlob);
    await jsonWritable.close();

    // Save audio file
    const audioFileHandle = await dirHandle.getFileHandle(`${recording.id}.webm`, { create: true });
    const audioWritable = await audioFileHandle.createWritable();
    await audioWritable.write(recording.audioBlob);
    await audioWritable.close();
};

const deleteRecordingFromDirectory = async (dirHandle: FileSystemDirectoryHandle, id: string): Promise<void> => {
    try {
        await dirHandle.removeEntry(`${id}.json`);
        await dirHandle.removeEntry(`${id}.webm`);
    } catch (error) {
        // @ts-ignore
        if (error.name !== 'NotFoundError') {
            console.error(`Failed to delete files for recording ${id}:`, error);
        }
    }
};

const loadRecordingsFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<{ recordings: Recording[], errors: string[] }> => {
    const recordings: Recording[] = [];
    const errors: string[] = [];
    const jsonFiles: FileSystemFileHandle[] = [];

    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json') && !['settings.json', 'templates.json'].includes(entry.name)) {
           jsonFiles.push(entry as FileSystemFileHandle);
        }
    }
    
    for (const fileHandle of jsonFiles) {
        try {
            const file = await fileHandle.getFile();
            const text = await file.text();
            const metadata = JSON.parse(text) as Omit<Recording, 'audioBlob'>;

            // Find corresponding audio file
            const audioFileHandle = await dirHandle.getFileHandle(`${metadata.id}.webm`);
            const audioFile = await audioFileHandle.getFile();
            const audioBlob = new Blob([audioFile], { type: 'audio/webm' });

            recordings.push({ ...metadata, audioBlob });

        } catch (error) {
            errors.push(`Failed to load recording from ${fileHandle.name}: ${error}`);
        }
    }

    return { recordings, errors };
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
};