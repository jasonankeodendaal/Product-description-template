import { Template, Recording, Photo, Note, BackupData, NoteRecording, LogEntry, CalendarEvent } from '../App';
import { SiteSettings } from '../constants';

// Declare JSZip to inform TypeScript about the global variable from the CDN.
declare var JSZip: any;

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


export const createBackup = async (
    siteSettings: SiteSettings,
    templates: Template[],
    recordings: Recording[],
    photos: Photo[],
    notes: Note[],
    noteRecordings: NoteRecording[],
    logEntries: LogEntry[],
    calendarEvents: CalendarEvent[],
): Promise<void> => {
    if (typeof JSZip === 'undefined') {
        alert("Error: JSZip library is not loaded. Cannot create backup file.");
        throw new Error("JSZip not loaded");
    }
    const zip = new JSZip();

    const metadata: Omit<BackupData, 'recordings' | 'photos' | 'noteRecordings'> = {
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

type ApiBackupData = Omit<BackupData, 'recordings' | 'photos' | 'noteRecordings'> & {
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

// --- Google Drive Auth Service ---
export const cloudAuthService = {
  async checkStatus(): Promise<{ connected: boolean; email?: string }> {
    try {
      const res = await fetch('/api/auth/status');
      if (!res.ok) return { connected: false };
      return await res.json();
    } catch (e) {
      console.error("Failed to check auth status", e);
      return { connected: false };
    }
  },
  connect(): void {
    // This is a full-page redirect to the Google OAuth consent screen.
    window.location.href = '/api/auth/google';
  },
  async disconnect(): Promise<void> {
    try {
      await fetch('/api/auth/disconnect', { method: 'POST' });
    } catch (e) {
      console.error("Failed to disconnect", e);
    }
  }
};