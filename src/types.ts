import { SiteSettings } from './constants';

// --- Type Definitions ---
export type View = 'home' | 'generator' | 'recordings' | 'photos' | 'notepad' | 'image-tool' | 'timesheet' | 'calendar' | 'browser';
export type UserRole = 'user' | 'creator';

export interface Template {
  id: string;
  name: string;
  prompt: string;
  category?: string;
}

export interface ParsedProductData {
    brand: string;
    sku: string;
    name: string;
    fullText: string;
}

export interface Recording {
  id: string;
  name: string;
  date: string;
  transcript: string;
  notes: string;
  audioBlob: Blob;
  tags: string[];
  photoIds: string[];
  isTranscribing?: boolean;
}

export interface Photo {
    id: string;
    name: string;
    notes: string;
    date: string;
    folder: string;
    imageBlob: Blob;
    imageMimeType: string;
    tags: string[];
    width?: number;
    height?: number;
}

export interface Video {
    id: string;
    name: string;
    notes: string;
    date: string;
    folder: string;
    videoBlob: Blob;
    videoMimeType: string;
    tags: string[];
    width?: number;
    height?: number;
}


export interface NoteRecording {
  id: string;
  noteId: string;
  name: string;
  date: string;
  audioBlob: Blob;
}

export interface Note {
    id: string;
    title: string;
    content: string; // Rich text content stored as an HTML string
    category: string;
    tags: string[];
    date: string;
    color: string; // e.g., 'sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'
    isLocked: boolean;
    heroImage?: string | null; // Data URL for the hero image
    paperStyle: string; // 'paper-white', 'paper-dark', 'paper-yellow-lined', 'paper-grid'
    fontStyle: string; // 'font-sans', 'font-serif', 'font-mono'
    dueDate?: string | null;
    reminderDate?: string | null;
    reminderFired?: boolean;
    recordingIds?: string[];
    photoIds?: string[];
}

export interface LogEntry {
    id: string;
    type: 'Clock In' | 'Clock Out' | 'Note Created' | 'Photo Added' | 'Recording Added' | 'Manual Task';
    timestamp: string;
    task?: string;
    startTime?: string;
    endTime?: string;
}


export interface CalendarEvent {
  id: string;
  startDateTime: string; // Full ISO string
  endDateTime: string;   // Full ISO string
  title: string;
  notes: string;
  photoId?: string;
  recordingIds?: string[];
  color: string;
  reminderOffset: number;
  reminderFired: boolean;
  createdAt: string;
}


export interface BackupData {
    siteSettings: SiteSettings;
    templates: Template[];
    recordings: Recording[];
    photos: Photo[];
    videos: Video[];
    notes: Note[];
    noteRecordings: NoteRecording[];
    logEntries: LogEntry[];
    calendarEvents: CalendarEvent[];
}

export interface FileSystemItem {
    name: string;
    type: 'directory' | 'file';
    kind?: 'photo' | 'video' | 'text' | 'json' | string;
    id?: string;
    dateModified?: string;
    size?: number;
    path: string;
    mediaSrc?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GenerationResult {
    text: string;
    sources?: GroundingChunk[];
}

export interface StorageBreakdownItem {
    name: string;
    bytes: number;
    count: number;
    fill: string;
}

export interface StorageUsage {
    total: number;
    breakdown: StorageBreakdownItem[];
}

export interface PrintableEntry {
    date: string;
    time: string;
    type: string;
    description: string;
    duration: string;
}
