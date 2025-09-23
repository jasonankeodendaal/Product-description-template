import { Recording, Template, Photo, Note, ParsedProductData } from "../App";
import { SiteSettings } from "../constants";

// Declare the docx library which is loaded from a CDN script in index.html
declare var docx: any;

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
    const photosDir = await getOrCreateDirectory(dirHandle, 'photos');
    const folderDir = await getOrCreateNestedDirectory(photosDir, photo.folder || '_uncategorized');
    
    const metadata: Omit<Photo, 'imageBlob'> = { ...photo };
    delete (metadata as any).imageBlob;
    
    const ext = photo.imageMimeType.split('/')[1] || 'png';
    await writeFile(folderDir, `${photo.id}.json`, JSON.stringify(metadata, null, 2));
    await writeFile(folderDir, `${photo.id}.${ext}`, photo.imageBlob);
};

const deletePhotoFromDirectory = async (dirHandle: FileSystemDirectoryHandle, photo: Photo) => {
    try {
        const photosDir = await dirHandle.getDirectoryHandle('photos');
        const folderDir = await getNestedDirectory(photosDir, photo.folder || '_uncategorized');
        
        if (!folderDir) return; // Folder doesn't exist, so nothing to delete.

        const ext = photo.imageMimeType.split('/')[1] || 'png';
        try { await folderDir.removeEntry(`${photo.id}.json`); } catch(e) {}
        try { await folderDir.removeEntry(`${photo.id}.${ext}`); } catch(e) {}
    } catch (e) { /* 'photos' dir might not exist, ignore */ }
};

const loadPhotosFromDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<Photo[]> => {
    const photos: Photo[] = [];
    try {
        const photosDir = await dirHandle.getDirectoryHandle('photos');
        
        const processDirectory = async (dir: FileSystemDirectoryHandle) => {
            for await (const entry of dir.values()) {
                if (entry.kind === 'directory') {
                    // FIX: TypeScript can fail to narrow the type of `entry` within an async iterator.
                    // Explicitly cast `entry` to FileSystemDirectoryHandle to fix the type mismatch for the recursive call.
                    await processDirectory(entry as FileSystemDirectoryHandle);
                } else if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                    try {
                        const jsonFile = await (entry as FileSystemFileHandle).getFile();
                        const metadata = JSON.parse(await jsonFile.text());
                        
                        const ext = metadata.imageMimeType?.split('/')[1] || 'png';
                        const imageHandle = await dir.getFileHandle(`${metadata.id}.${ext}`);
                        const imageBlob = await imageHandle.getFile();
                        
                        photos.push({ ...metadata, imageBlob });
                    } catch (e) {
                        console.error(`Failed to load photo from ${entry.name} in ${dir.name}:`, e);
                    }
                }
            }
        };
        
        await processDirectory(photosDir);
    } catch(e) { /* 'photos' dir doesn't exist */ }
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

const saveAllDataToDirectory = async (dirHandle: FileSystemDirectoryHandle, data: { recordings: Recording[], photos: Photo[], notes: Note[] }) => {
    for (const rec of data.recordings) await saveRecordingToDirectory(dirHandle, rec);
    for (const photo of data.photos) await savePhotoToDirectory(dirHandle, photo);
    for (const note of data.notes) await saveNoteToDirectory(dirHandle, note);
}

const createDocxBlob = (structuredData: Record<string, string>): Promise<Blob> => {
    if (typeof docx === 'undefined') {
        throw new Error('DOCX library is not loaded.');
    }
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

    const children: any[] = [];
    
    children.push(new Paragraph({ text: structuredData['Name'] || 'Unnamed Product', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));

    const sections = [
        'Brand', 'SKU', 'Short Description', 'What’s in the Box',
        'Description', 'Key Features', 'Material Used',
        'Product Dimensions (CM) & Weight (KG)', 'Buying This Product Means',
        'Key Specifications', 'Terms & Conditions'
    ];
    
    sections.forEach(sectionTitle => {
        if (structuredData[sectionTitle]) {
            children.push(new Paragraph({ text: sectionTitle, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            // Handle multi-line sections like Key Features by splitting them
            const contentLines = structuredData[sectionTitle].split('\n');
            contentLines.forEach(line => {
                if (line.trim()) {
                    children.push(new Paragraph({ text: line.trim() }));
                }
            });
        }
    });

    const doc = new Document({
        sections: [{ children }],
    });
    
    return Packer.toBlob(doc);
};

const saveProductDescription = async (dirHandle: FileSystemDirectoryHandle, item: ParsedProductData, structuredData: Record<string, string>) => {
    const brandFolder = item.brand.replace(/[^a-zA-Z0-9-_\.]/g, '_').trim() || 'Unbranded';
    const skuFile = item.sku.replace(/[^a-zA-Z0-9-_\.]/g, '_').trim() || `product_${Date.now()}`;
    
    const brandDirHandle = await getOrCreateDirectory(dirHandle, brandFolder);

    const docxBlob = await createDocxBlob(structuredData);
    await writeFile(brandDirHandle, `${skuFile}.docx`, docxBlob);
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
    saveAllDataToDirectory,
    saveProductDescription,
};