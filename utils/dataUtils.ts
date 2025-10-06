
import type { Template, Recording, Photo, Note, BackupData, NoteRecording, LogEntry, CalendarEvent, Video } from '../src/types';
import { SiteSettings } from '../constants';

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL format');
    
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], {type:mime});
}

/**
 * Waits for a global variable (from a CDN script) to be available on the window object.
 * @param name The name of the global variable.
 * @param timeout The maximum time to wait in milliseconds.
 * @returns A promise that resolves with the library/variable.
 */
export const waitForGlobal = <T>(name: string, timeout = 5000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if ((window as any)[name]) {
        resolve((window as any)[name] as T);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Library ${name} did not load within ${timeout}ms.`));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};


export const createBackup = async (
    siteSettings: SiteSettings,
    templates: Template[],
    recordings: Recording[],
    photos: Photo[],
    videos: Video[],
    notes: Note[],
    noteRecordings: NoteRecording[],
    logEntries: LogEntry[],
    calendarEvents: CalendarEvent[],
): Promise<void> => {
    const JSZip = await waitForGlobal<any>('JSZip');
    const zip = new JSZip();

    const metadata: Omit<BackupData, 'recordings' | 'photos' | 'videos' | 'noteRecordings'> = {
        siteSettings,
        templates,
        notes,
        logEntries,
        calendarEvents,
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    const recordingsFolder = zip.folder('assets/recordings');
    if (recordingsFolder) {
        for (const rec of recordings) {
            const { audioBlob, isTranscribing, ...recMetadata } = rec;
            recordingsFolder.file(`${rec.id}.json`, JSON.stringify(recMetadata, null, 2));
            recordingsFolder.file(`${rec.id}.webm`, audioBlob);
        }
    }
    
    const noteRecordingsFolder = zip.folder('assets/note_recordings');
    if (noteRecordingsFolder) {
        for (const rec of noteRecordings) {
            const { audioBlob, ...recMetadata } = rec;
            noteRecordingsFolder.file(`${rec.id}.json`, JSON.stringify(recMetadata, null, 2));
            noteRecordingsFolder.file(`${rec.id}.webm`, audioBlob);
        }
    }

    const photosFolder = zip.folder('assets/photos');
    if (photosFolder) {
        for (const photo of photos) {
            const { imageBlob, ...photoMetadata } = photo;
            
            const pathParts = photo.folder.split('/').filter(p => p.trim() !== '' && p !== '.');
            let currentFolder = photosFolder;
            for (const part of pathParts) {
                currentFolder = currentFolder.folder(part)!;
            }
            
            currentFolder.file(`${photo.id}.json`, JSON.stringify(photoMetadata, null, 2));
            const ext = photo.imageMimeType.split('/')[1] || 'png';
            currentFolder.file(`${photo.id}.${ext}`, imageBlob);
        }
    }
    
    const videosFolder = zip.folder('assets/videos');
    if (videosFolder) {
        for (const video of videos) {
            const { videoBlob, ...videoMetadata } = video;
            
            const pathParts = video.folder.split('/').filter(p => p.trim() !== '' && p !== '.');
            let currentFolder = videosFolder;
            for (const part of pathParts) {
                currentFolder = currentFolder.folder(part)!;
            }
            
            currentFolder.file(`${video.id}.json`, JSON.stringify(videoMetadata, null, 2));
            const ext = video.videoMimeType.split('/')[1] || 'mp4';
            currentFolder.file(`${video.id}.${ext}`, videoBlob);
        }
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ai-tools-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};


// --- API Sync Service ---

const getHeaders = (key: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`
});

const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

type ApiBackupData = Omit<BackupData, 'recordings' | 'photos' | 'videos' | 'noteRecordings'> & {
    recordings: (Omit<Recording, 'audioBlob' | 'isTranscribing'> & { audioBase64: string, audioMimeType: string })[];
    photos: (Omit<Photo, 'imageBlob'> & { imageBase64: string, imageMimeType: string })[];
    noteRecordings: (Omit<NoteRecording, 'audioBlob'> & { audioBase64: string, audioMimeType: string })[];
}

export const apiSyncService = {
    base64ToBlob, // Export helper function
    async connect(apiUrl: string, apiKey: string): Promise<boolean> {
        const response = await fetch(`${apiUrl}/api/health`, { headers: getHeaders(apiKey) });
        return response.ok;
    },

    async fetchAllData(apiUrl: string, apiKey: string): Promise<ApiBackupData> {
        const response = await fetch(`${apiUrl}/api/data`, { headers: getHeaders(apiKey) });
        return handleApiResponse(response);
    },

    async saveData(apiUrl: string, apiKey: string, data: BackupData): Promise<any> {
        const response = await fetch(`${apiUrl}/api/data`, {
            method: 'POST',
            headers: getHeaders(apiKey),
            body: JSON.stringify(data),
        });
        return handleApiResponse(response);
    }
};
