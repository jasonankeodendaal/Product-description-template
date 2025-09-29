import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './Hero';
import { DEFAULT_SITE_SETTINGS, SiteSettings, DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE, CREATOR_PIN, GITHUB_APK_URL } from './constants';
import { GeneratorView } from './components/GeneratorView';
import { generateProductDescription, getWeatherInfo, performAiAction } from './services/geminiService';
import { GenerationResult } from './components/OutputPanel';
import { FullScreenLoader } from './components/FullScreenLoader';
import { db } from './services/db';
import { fileSystemService } from './services/fileSystemService';
import { apiSyncService, cloudAuthService, waitForGlobal } from './utils/dataUtils';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { RecordingManager } from './components/RecordingManager';
import { PhotoManager } from './components/PhotoManager';
import { Notepad } from './components/Notepad';
import { ImageTool } from './ImageTool';
import { BottomNavBar } from './components/BottomNavBar';
import { InfoModal } from './components/InfoModal';
import { CreatorInfo } from './components/CreatorInfo';
import { ManualInstallModal } from './components/ManualInstallModal';
import { UpdateToast } from './components/UpdateToast';
import { MobileHeader } from './components/MobileHeader';
import { Home } from './components/Home';
import { PinSetupModal } from './components/PinSetupModal';
import { CalendarView } from './components/CalendarView';
// FIX: Corrected import path for TimesheetManager from components/ to root, to match provided file structure.
import { TimesheetManager } from './TimesheetManager';
import { StorageUsage, calculateStorageUsage } from './utils/storageUtils';
// FIX: Corrected import path for OnboardingTour from components/ to root, to match provided file structure.
import { OnboardingTour } from './OnboardingTour';
import { PrintPreview } from './components/PrintPreview';
import { InstallOptionsModal } from './components/InstallOptionsModal';
import { InactivityManager } from './components/InactivityManager';
import { FileBrowser } from './components/FileBrowser';

// A type for the BeforeInstallPromptEvent, which is not yet in standard TS libs
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}


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

// Updated data model for Notepad to match new design
export interface Note {
    id: string;
    title: string;
    content: string; // Rich text content stored as an HTML string
    category: string;
    tags: string[];
    date: string;
    color: string; // e.g., 'sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'
    isLocked: boolean;
    // New fields for advanced editor
    heroImage?: string | null; // Data URL for the hero image
    paperStyle: string; // 'paper-white', 'paper-dark', 'paper-yellow-lined', 'paper-grid'
    fontStyle: string; // 'font-sans', 'font-serif', 'font-mono'
    dueDate?: string | null;
    reminderDate?: string | null;
    reminderFired?: boolean;
    recordingIds?: string[];
    photoIds?: string[]; // For scanned documents and other images
}

export interface LogEntry {
    id: string;
    type: 'Clock In' | 'Clock Out' | 'Note Created' | 'Photo Added' | 'Recording Added' | 'Manual Task';
    timestamp: string; // For auto-events, this is the main time. For manual, it's the date.
    task?: string;     // For manual tasks
    startTime?: string; // ISO string for manual tasks
    endTime?: string;   // ISO string for manual tasks
}


export interface CalendarEvent {
  id: string;
  startDateTime: string; // Full ISO string
  endDateTime: string;   // Full ISO string
  title: string;
  notes: string;
  photoId?: string;
  recordingIds?: string[];
  color: string; // e.g., 'sky', 'purple', 'emerald'
  reminderOffset: number; // in minutes before the event. -1 for no reminder.
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

// Function to migrate old notes to the new format
const migrateNote = (note: any): Note => {
    const defaultColors = ['sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'];
    const randomColor = () => defaultColors[Math.floor(Math.random() * defaultColors.length)];

    const baseNote: Partial<Note> = {
        id: note.id || crypto.randomUUID(),
        title: note.title || 'Untitled',
        content: '<p></p>',
        category: note.category || 'General',
        tags: note.tags || [],
        date: note.date || new Date().toISOString(),
        color: note.color || randomColor(),
        isLocked: note.isLocked || false, // Ensure isLocked is initialized
        heroImage: note.heroImage || null,
        paperStyle: note.paperStyle || 'paper-dark',
        fontStyle: note.fontStyle || 'font-sans',
        dueDate: note.dueDate || null,
        reminderDate: note.reminderDate || null,
        reminderFired: note.reminderFired || false,
        recordingIds: note.recordingIds || [],
        photoIds: note.photoIds || [], // Initialize photoIds
    };

    // Old canvas format (content is an object with 'elements')
    if (typeof note.content === 'object' && note.content && note.content.elements) {
        const textElement = note.content.elements.find((e: any) => e.type === 'text');
        baseNote.content = textElement ? textElement.html : '<p></p>';
    } 
    // Old simple text format or already migrated format
    else if (typeof note.content === 'string') {
        // Ensure content is wrapped in a paragraph tag if it's plain text
        baseNote.content = note.content.trim().startsWith('<') ? note.content : `<p>${note.content}</p>`;
    }

    return baseNote as Note;
};


const App: React.FC = () => {
    // --- State ---
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [noteRecordings, setNoteRecordings] = useState<NoteRecording[]>([]);
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [storageUsage, setStorageUsage] = useState<StorageUsage>({ total: 0, breakdown: [] });
    
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');
    const [error, setError] = useState<string | null>(null);

    const [userInput, setUserInput] = useState('');
    const [generatedOutput, setGeneratedOutput] = useState<GenerationResult | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [tone, setTone] = useState('Professional');
    
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isCreatorInfoOpen, setIsCreatorInfoOpen] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>('user');
    const [isPinSetupModalOpen, setIsPinSetupModalOpen] = useState(false);
    const [isPinResetting, setIsPinResetting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    const [isApiConnecting, setIsApiConnecting] = useState(false);
    const [isApiConnected, setIsApiConnected] = useState(false);
    
    const [googleDriveStatus, setGoogleDriveStatus] = useState({ connected: false, email: '' });

    const [currentView, setCurrentView] = useState<View>('home');
    const [imageToEdit, setImageToEdit] = useState<Photo | null>(null);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    
    // Timer State
    const [activeTimer, setActiveTimer] = useState<{ startTime: number; task: string } | null>(null);
    const [timerDuration, setTimerDuration] = useState(0);
    
    // PWA Install Prompt State
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(
        () => window.matchMedia('(display-mode: standalone)').matches
    );
    const [isInstallOptionsModalOpen, setIsInstallOptionsModalOpen] = useState(false);
    const [isManualInstallModalOpen, setIsManualInstallModalOpen] = useState(false);
    
    // App Update State
    const [showUpdateToast, setShowUpdateToast] = useState(false);

    // Effect to recalculate storage whenever data changes
    useEffect(() => {
        setStorageUsage(calculateStorageUsage({ photos, recordings, videos, notes, logEntries, templates, calendarEvents }));
    }, [photos, recordings, videos, notes, logEntries, templates, calendarEvents]);

    // Effect for the live timer
    useEffect(() => {
        let interval: number | null = null;
        if (activeTimer) {
            // Set initial duration immediately
            setTimerDuration(Math.floor((Date.now() - activeTimer.startTime) / 1000));
            interval = window.setInterval(() => {
                setTimerDuration(Math.floor((Date.now() - activeTimer.startTime) / 1000));
            }, 1000);
        } else {
            setTimerDuration(0);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [activeTimer]);

    // --- PWA Installation Logic ---
    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPromptEvent(event as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const handleAppInstalled = () => {
            setInstallPromptEvent(null);
            setIsAppInstalled(true);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Listen for the custom event from the service worker
        const handleSwUpdate = () => {
            setShowUpdateToast(true);
        };
        window.addEventListener('sw-updated', handleSwUpdate);


        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('sw-updated', handleSwUpdate);
        };
    }, []);
    
    const handleInstallClick = async () => {
        // If the PWA install prompt is available, show it directly. This is the ideal flow.
        if (installPromptEvent) {
            installPromptEvent.prompt();
            const { outcome } = await installPromptEvent.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // The prompt can only be used once, so we clear it.
            setInstallPromptEvent(null);
        } else {
            // If the prompt is not available (e.g., on iOS, or if previously dismissed),
            // open the modal that provides other options like APK download or manual instructions.
            setIsInstallOptionsModalOpen(true);
        }
    };

    const handlePwaInstallFromModal = () => {
        // This handler is called from the InstallOptionsModal. At this point, we know the
        // direct prompt is not available, so we show the manual installation guide.
        setIsInstallOptionsModalOpen(false);
        setIsManualInstallModalOpen(true);
    };
    
    const handleDownloadApk = () => {
        window.open(GITHUB_APK_URL, '_blank');
        setIsInstallOptionsModalOpen(false);
    };


    // --- Generic Data Handlers (Centralized) ---
    const handleSaveLogEntry = useCallback(async (entry: Omit<LogEntry, 'id'>) => {
        const newEntry: LogEntry = {
            id: crypto.randomUUID(),
            ...entry
        };
        const updatedEntries = [newEntry, ...logEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogEntries(updatedEntries);
        await db.saveLogEntry(newEntry);
        if (directoryHandle) await fileSystemService.saveLogEntryToDirectory(directoryHandle, newEntry);
    }, [directoryHandle, logEntries]);

    // --- Data Loading and Initialization ---
    useEffect(() => {
        // Handle URL-based view navigation from PWA shortcuts
        const urlParams = new URLSearchParams(window.location.search);
        const requestedView = urlParams.get('view') as View;
        const validViews: View[] = ['home', 'generator', 'recordings', 'photos', 'notepad', 'image-tool', 'timesheet', 'browser'];
        if (requestedView && validViews.includes(requestedView)) {
            setCurrentView(requestedView);
        }

        const initializeApp = async () => {
            try {
                // Check for persisted login
                const loginDataString = localStorage.getItem('loginData');
                if (loginDataString) {
                  const loginData = JSON.parse(loginDataString);
                  const now = new Date().getTime();
                  const oneDay = 24 * 60 * 60 * 1000;
                  if (now - loginData.timestamp < oneDay) {
                    setIsAuthenticated(true);
                    setUserRole(loginData.role);
                  } else {
                    localStorage.removeItem('loginData');
                  }
                }

                // Check Google Drive connection status
                const gDriveStatus = await cloudAuthService.checkStatus();
                // FIX: Ensure gDriveStatus.email has a default value to match the state type.
                setGoogleDriveStatus({ connected: gDriveStatus.connected, email: gDriveStatus.email || '' });


                const storedSettings = localStorage.getItem('siteSettings');
                let settings: SiteSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SITE_SETTINGS;

                if (!settings.pinIsSet) {
                    setIsPinSetupModalOpen(true);
                } else if (!settings.onboardingCompleted) {
                    setIsOnboardingOpen(true);
                }

                const storedTemplates = localStorage.getItem('templates');
                let initialTemplates = storedTemplates ? JSON.parse(storedTemplates) : [];
                 if (initialTemplates.length === 0) {
                    initialTemplates.push({ id: 'default-product-desc', name: 'Default E-commerce Product Description', prompt: DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE, category: 'E-commerce' });
                }
                setTemplates(initialTemplates);
                setSelectedTemplateId(initialTemplates[0]?.id || '');
                
                const handle = await db.getDirectoryHandle();
                let folderSyncSuccess = false;

                if (handle) {
                    let hasPermission = false;
                    // Check silently first.
                    // FIX: The standard FileSystemDirectoryHandle type may not include 'queryPermission'. Cast to 'any' to bypass the check for this widely supported but sometimes untyped method.
                    if ((await (handle as any).queryPermission({ mode: 'readwrite' })) === 'granted') {
                        hasPermission = true;
                    } else {
                        // If not granted, try to re-request it. This may show a browser prompt.
                        try {
                            // FIX: The standard FileSystemDirectoryHandle type may not include 'requestPermission'. Cast to 'any' to bypass the check for this widely supported but sometimes untyped method.
                            if ((await (handle as any).requestPermission({ mode: 'readwrite' })) === 'granted') {
                                hasPermission = true;
                            }
                        } catch (err) {
                            console.warn('Could not re-acquire permission for folder handle.', err);
                        }
                    }

                    if (hasPermission) {
                        setDirectoryHandle(handle);
                        settings = { ...settings, syncMode: 'folder' };
                        await syncFromDirectory(handle);
                        folderSyncSuccess = true;
                    } else {
                        // Permission was not granted, so disconnect.
                        await db.clearDirectoryHandle();
                        settings.syncMode = 'local'; // Fallback to local storage.
                    }
                }
                
                if (!folderSyncSuccess) {
                    if (settings.syncMode === 'api' && settings.customApiEndpoint && settings.customApiAuthKey) {
                        await handleApiConnect(settings.customApiEndpoint, settings.customApiAuthKey, true);
                    } else {
                        // This is the fallback for local storage
                        const [dbRecordings, dbPhotos, dbVideos, dbNotes, dbNoteRecordings, dbLogEntries, dbCalendarEvents] = await Promise.all([
                            db.getAllRecordings(),
                            db.getAllPhotos(),
                            db.getAllVideos(),
                            db.getAllNotes(),
                            db.getAllNoteRecordings(),
                            db.getAllLogEntries(),
                            db.getAllCalendarEvents(),
                        ]);
                        setRecordings(dbRecordings);
                        setPhotos(dbPhotos);
                        setVideos(dbVideos);
                        setNotes(dbNotes.map(migrateNote));
                        setNoteRecordings(dbNoteRecordings);
                        setLogEntries(dbLogEntries);
                        setCalendarEvents(dbCalendarEvents);
                    }
                }
                setSiteSettings(settings);

            } catch (err) {
                console.error("Initialization Error:", err);
                alert("There was an error initializing the application. Please check the console for details.");
            } finally {
                setIsInitialized(true);
            }
        };
        initializeApp();
    }, []);
    
    
    // --- Reminder Service ---
    const handleSaveCalendarEvent = useCallback(async (event: CalendarEvent, silent = false) => {
        setCalendarEvents(prev => {
            const existing = prev.find(e => e.id === event.id);
            return existing ? prev.map(e => e.id === event.id ? event : e) : [event, ...prev];
        });
        await db.saveCalendarEvent(event);
        if (directoryHandle) await fileSystemService.saveCalendarEventToDirectory(directoryHandle, event);
    }, [directoryHandle]);

    const handleUpdateNote = useCallback(async (note: Note, silent = false) => {
        setNotes(prev => prev.map(n => n.id === note.id ? note : n));
        await db.saveNote(note);
        if (directoryHandle) await fileSystemService.saveNoteToDirectory(directoryHandle, note);
    }, [directoryHandle]);

    useEffect(() => {
        const checkReminders = async () => {
            if (Notification.permission !== 'granted') return;
            const now = new Date();
            const upcomingEvents = calendarEvents.filter(e => e.reminderOffset >= 0 && !e.reminderFired);

            for (const event of upcomingEvents) {
                const eventTime = new Date(event.startDateTime);
                const reminderTime = new Date(eventTime.getTime() - event.reminderOffset * 60000);

                if (now >= reminderTime) {
                    new Notification(event.title, {
                        body: stripHtml(event.notes).substring(0, 100) + '...',
                        icon: '/logo192.png', // Using a default icon path
                        tag: event.id, // Prevent duplicate notifications
                    });
                    const updatedEvent = { ...event, reminderFired: true };
                    await handleSaveCalendarEvent(updatedEvent, true); 
                }
            }
        };
        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, [calendarEvents, handleSaveCalendarEvent]);

    useEffect(() => {
        const checkNoteReminders = async () => {
            if (Notification.permission !== 'granted') return;
            const now = new Date();
            const upcomingNotes = notes.filter(n => n.reminderDate && !n.reminderFired);

            for (const note of upcomingNotes) {
                const reminderTime = new Date(note.reminderDate!);
                if (now >= reminderTime) {
                    new Notification(`Reminder: ${note.title}`, {
                        body: stripHtml(note.content).substring(0, 100) + '...',
                        icon: '/logo192.png',
                        tag: note.id,
                    });
                    const updatedNote = { ...note, reminderFired: true };
                    await handleUpdateNote(updatedNote, true);
                }
            }
        };
        const intervalId = setInterval(checkNoteReminders, 60000);
        return () => clearInterval(intervalId);
    }, [notes, handleUpdateNote]);


    // --- Generic Data Handlers (Centralized) ---
    const handleSetUserPin = async (pin: string, name: string) => {
        const newSettings = { ...siteSettings, userPin: pin, pinIsSet: true, userName: name };
        await handleUpdateSettings(newSettings);
        setIsPinSetupModalOpen(false);
        // After setting pin for the first time, show onboarding.
        if (!siteSettings.onboardingCompleted) {
            setIsOnboardingOpen(true);
        }
    };
    
    const handleInitiatePinReset = () => {
        setIsPinResetting(true);
        setIsDashboardOpen(false); // Close dashboard to show PIN modal
    };
    
    const handleSetNewPinAfterReset = async (pin: string) => {
        const newSettings = { ...siteSettings, userPin: pin, pinIsSet: true };
        await handleUpdateSettings(newSettings);
        setIsPinResetting(false);
        alert("PIN has been successfully reset.");
    };

    const handleSaveRecording = useCallback(async (recording: Recording) => {
        const newRecording = { ...recording, id: recording.id || crypto.randomUUID() };
        setRecordings(prev => [newRecording, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await db.saveRecording(newRecording);
        if (directoryHandle) await fileSystemService.saveRecordingToDirectory(directoryHandle, newRecording);
        await handleSaveLogEntry({type: 'Recording Added', timestamp: new Date().toISOString()});
        return newRecording; // Return the saved recording so its ID can be used
    }, [directoryHandle, handleSaveLogEntry]);

    const handleUpdateRecording = useCallback(async (recording: Recording) => {
        setRecordings(prev => prev.map(r => r.id === recording.id ? recording : r));
        await db.saveRecording(recording);
        if (directoryHandle) await fileSystemService.saveRecordingToDirectory(directoryHandle, recording);
    }, [directoryHandle]);

    const handleDeleteRecording = useCallback(async (id: string) => {
        setRecordings(prev => prev.filter(r => r.id !== id));
        await db.deleteRecording(id);
        if (directoryHandle) await fileSystemService.deleteRecordingFromDirectory(directoryHandle, id);
    }, [directoryHandle]);
    
    const handleSavePhoto = useCallback(async (photo: Photo) => {
        setPhotos(prev => [photo, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await db.savePhoto(photo);
        if (directoryHandle) await fileSystemService.savePhotoToDirectory(directoryHandle, photo);
        await handleSaveLogEntry({type: 'Photo Added', timestamp: new Date().toISOString()});
    }, [directoryHandle, handleSaveLogEntry]);

    const handleUpdatePhoto = useCallback(async (photo: Photo) => {
        setPhotos(prev => prev.map(p => p.id === photo.id ? photo : p));
        await db.savePhoto(photo);
        if (directoryHandle) await fileSystemService.savePhotoToDirectory(directoryHandle, photo);
    }, [directoryHandle]);

    const handleDeletePhoto = useCallback(async (photo: Photo) => {
        setPhotos(prev => prev.filter(p => p.id !== photo.id));
        await db.deletePhoto(photo.id);
        if (directoryHandle) await fileSystemService.deletePhotoFromDirectory(directoryHandle, photo);
    }, [directoryHandle]);
    
    const handleSaveVideo = useCallback(async (video: Video) => {
        setVideos(prev => [video, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await db.saveVideo(video);
        if (directoryHandle) await fileSystemService.saveVideoToDirectory(directoryHandle, video);
    }, [directoryHandle]);

    const handleUpdateVideo = useCallback(async (video: Video) => {
        setVideos(prev => prev.map(v => v.id === video.id ? video : v));
        await db.saveVideo(video);
        if (directoryHandle) await fileSystemService.saveVideoToDirectory(directoryHandle, video);
    }, [directoryHandle]);

    const handleDeleteVideo = useCallback(async (video: Video) => {
        setVideos(prev => prev.filter(v => v.id !== video.id));
        await db.deleteVideo(video.id);
        if (directoryHandle) await fileSystemService.deleteVideoFromDirectory(directoryHandle, video);
    }, [directoryHandle]);


    const handleSaveNote = useCallback(async (note: Note) => {
        setNotes(prevNotes => {
            const existing = prevNotes.find(n => n.id === note.id);
            let newNotes;
            if (!existing) {
                newNotes = [note, ...prevNotes];
                handleSaveLogEntry({ type: 'Note Created', timestamp: new Date().toISOString() }); // Only log on creation
            } else {
                newNotes = prevNotes.map(n => (n.id === note.id ? note : n));
            }
            return newNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        await db.saveNote(note);
        if (directoryHandle) await fileSystemService.saveNoteToDirectory(directoryHandle, note);
    }, [directoryHandle, handleSaveLogEntry]);
    

    const handleDeleteNote = useCallback(async (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        await db.deleteNote(id);
        if (directoryHandle) await fileSystemService.deleteNoteFromDirectory(directoryHandle, id);
    }, [directoryHandle]);

    const handleSaveNoteRecording = useCallback(async (rec: NoteRecording) => {
        setNoteRecordings(prev => [rec, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await db.saveNoteRecording(rec);
        if (directoryHandle) await fileSystemService.saveNoteRecordingToDirectory(directoryHandle, rec);
    }, [directoryHandle]);
    
    const handleUpdateNoteRecording = useCallback(async (rec: NoteRecording) => {
        setNoteRecordings(prev => prev.map(r => r.id === rec.id ? rec : r));
        await db.saveNoteRecording(rec);
        if (directoryHandle) await fileSystemService.saveNoteRecordingToDirectory(directoryHandle, rec);
    }, [directoryHandle]);

    const handleDeleteNoteRecording = useCallback(async (id: string) => {
        setNoteRecordings(prev => prev.filter(r => r.id !== id));
        await db.deleteNoteRecording(id);
        if (directoryHandle) await fileSystemService.deleteNoteRecordingFromDirectory(directoryHandle, id);
    }, [directoryHandle]);

    const handleDeleteCalendarEvent = useCallback(async (id: string) => {
        setCalendarEvents(prev => prev.filter(e => e.id !== id));
        await db.deleteCalendarEvent(id);
        if (directoryHandle) await fileSystemService.deleteCalendarEventFromDirectory(directoryHandle, id);
    }, [directoryHandle]);

    // --- Timer Handlers ---
    const handleStartTimer = (task: string) => {
        if (activeTimer) return; // Prevent starting a new timer if one is active
        setActiveTimer({ startTime: Date.now(), task });
    };

    const handleStopTimer = () => {
        if (!activeTimer) return;
        
        const endTime = new Date();
        const startTime = new Date(activeTimer.startTime);

        // Don't log entries less than a second
        if (endTime.getTime() - startTime.getTime() < 1000) {
            setActiveTimer(null);
            return;
        }
        
        const newEntry: Omit<LogEntry, 'id'> = {
            type: 'Manual Task',
            task: activeTimer.task,
            timestamp: startTime.toISOString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };

        handleSaveLogEntry(newEntry);
        setActiveTimer(null);
    };

    // --- Other Handlers ---
    const handleGenerate = async () => {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!selectedTemplate) {
        setError('Please select a template first.');
        return;
      }
      setIsLoading(true);
      setError(null);
      setGeneratedOutput({ text: '', sources: [] });
      try {
        await generateProductDescription(
          userInput,
          selectedTemplate.prompt,
          tone,
          siteSettings.customApiEndpoint,
          siteSettings.customApiAuthKey,
          (partialResult) => setGeneratedOutput(partialResult)
        );
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
        setGeneratedOutput(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    const handleSaveToFolder = useCallback(async (item: ParsedProductData, structuredData: Record<string, string>) => {
        if (!directoryHandle) {
             alert("Local folder connection is required to use this feature. Please connect a folder in the Dashboard.");
             throw new Error("Directory not connected");
        }
        try {
            await fileSystemService.saveProductDescription(directoryHandle, item, structuredData);
        } catch(e) {
            console.error("Error saving to folder:", e);
            alert(`Failed to save to folder: ${e instanceof Error ? e.message : String(e)}`);
            throw e;
        }
    }, [directoryHandle]);

    const handleUpdateSettings = useCallback(async (newSettings: SiteSettings) => {
        setSiteSettings(newSettings);
        localStorage.setItem('siteSettings', JSON.stringify(newSettings));
        if(directoryHandle) {
            await fileSystemService.saveSettings(directoryHandle, newSettings);
        }
    }, [directoryHandle]);
    
    const handleFinishOnboarding = useCallback(async () => {
        const newSettings = { ...siteSettings, onboardingCompleted: true };
        await handleUpdateSettings(newSettings);
        setIsOnboardingOpen(false);
    }, [siteSettings, handleUpdateSettings]);

    const handleOpenOnboarding = () => {
        setIsOnboardingOpen(true);
    };

    const handleAddTemplate = useCallback(async (name: string, prompt: string, category: string) => {
        const newTemplate: Template = { id: crypto.randomUUID(), name, prompt, category };
        const updatedTemplates = [...templates, newTemplate];
        setTemplates(updatedTemplates);
        localStorage.setItem('templates', JSON.stringify(updatedTemplates));
        if(directoryHandle) await fileSystemService.saveTemplates(directoryHandle, updatedTemplates);
    }, [templates, directoryHandle]);

    const onEditTemplate = useCallback(async (id: string, newName: string, newPrompt: string, newCategory: string) => {
        const updatedTemplates = templates.map(t => t.id === id ? { ...t, name: newName, prompt: newPrompt, category: newCategory } : t);
        setTemplates(updatedTemplates);
        localStorage.setItem('templates', JSON.stringify(updatedTemplates));
        if(directoryHandle) await fileSystemService.saveTemplates(directoryHandle, updatedTemplates);
    }, [templates, directoryHandle]);

    const handleEditImage = (photo: Photo) => {
        setImageToEdit(photo);
        setCurrentView('image-tool');
    };

    const syncFromDirectory = useCallback(async (handle: FileSystemDirectoryHandle, showSuccess = false) => {
        setLoadingMessage('Syncing from folder...');
        setIsLoading(true);
        try {
            const [dirSettings, dirTemplates, {recordings: dirRecordings}, dirPhotos, dirVideos, dirNotes, dirNoteRecordings, dirLogEntries, dirCalendarEvents] = await Promise.all([
                fileSystemService.loadSettings(handle),
                fileSystemService.loadTemplates(handle),
                fileSystemService.loadRecordingsFromDirectory(handle),
                fileSystemService.loadPhotosFromDirectory(handle),
                fileSystemService.loadVideosFromDirectory(handle),
                fileSystemService.loadNotesFromDirectory(handle),
                fileSystemService.loadNoteRecordingsFromDirectory(handle),
                fileSystemService.loadLogEntriesFromDirectory(handle),
                fileSystemService.loadCalendarEventsFromDirectory(handle),
            ]);
            
            if (dirSettings) setSiteSettings(prev => ({...prev, ...dirSettings, syncMode: 'folder' }));
            if (dirTemplates) setTemplates(dirTemplates);
            setRecordings(dirRecordings);
            setPhotos(dirPhotos);
            setVideos(dirVideos);
            setNotes(dirNotes.map(migrateNote));
            setNoteRecordings(dirNoteRecordings);
            setLogEntries(dirLogEntries);
            setCalendarEvents(dirCalendarEvents);
            
            if (showSuccess) alert('Sync from folder complete!');

        } catch (e) {
            console.error("Sync error:", e);
            alert(`Error syncing from directory: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleSyncDirectory = useCallback(async () => {
        try {
            const handle = await fileSystemService.getDirectoryHandle();
            const newSettings = { ...siteSettings, syncMode: 'folder' as const };

            if (await fileSystemService.directoryHasData(handle)) {
                await syncFromDirectory(handle, true);
            } else {
                await Promise.all([
                    fileSystemService.saveSettings(handle, newSettings),
                    fileSystemService.saveTemplates(handle, templates),
                    fileSystemService.saveAllDataToDirectory(handle, { recordings, photos, videos, notes, noteRecordings, logEntries, calendarEvents }),
                ]);
                alert("Connected to new folder and saved current data.");
            }
            await db.setDirectoryHandle(handle);
            setDirectoryHandle(handle);
            setSiteSettings(newSettings);
            localStorage.setItem('siteSettings', JSON.stringify(newSettings));

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            alert(`Could not connect to directory: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [siteSettings, templates, recordings, photos, videos, notes, noteRecordings, logEntries, calendarEvents, syncFromDirectory]);

    const handleDisconnectDirectory = useCallback(async () => {
        if(window.confirm("Are you sure you want to disconnect? The app will switch back to using local browser storage.")) {
            await db.clearDirectoryHandle();
            setDirectoryHandle(null);
            
            const newSettings = { ...siteSettings, syncMode: 'local' as const };
            setSiteSettings(newSettings);
            localStorage.setItem('siteSettings', JSON.stringify(newSettings));

            const [dbRecordings, dbPhotos, dbVideos, dbNotes, dbNoteRecordings, dbLogEntries, dbCalendarEvents] = await Promise.all([
                db.getAllRecordings(),
                db.getAllPhotos(),
                db.getAllVideos(),
                db.getAllNotes(),
                db.getAllNoteRecordings(),
                db.getAllLogEntries(),
                db.getAllCalendarEvents(),
            ]);
            setRecordings(dbRecordings);
            setPhotos(dbPhotos);
            setVideos(dbVideos);
            setNotes(dbNotes.map(migrateNote));
            setNoteRecordings(dbNoteRecordings);
            setLogEntries(dbLogEntries);
            setCalendarEvents(dbCalendarEvents);
        }
    }, [siteSettings]);

    const handleClearLocalData = useCallback(async () => {
        if (window.confirm("WARNING: This will permanently delete all recordings, photos, videos, notes, logs, and calendar events from your browser's local storage. This cannot be undone. Are you absolutely sure?")) {
            await db.clearAllData();
            setRecordings([]);
            setPhotos([]);
            setVideos([]);
            setNotes([]);
            setNoteRecordings([]);
            setLogEntries([]);
            setCalendarEvents([]);
            alert("Local data has been cleared.");
        }
    }, []);

    const handleApiConnect = useCallback(async (apiUrl: string, apiKey: string, silent = false) => {
        setIsApiConnecting(true);
        try {
            const isConnected = await apiSyncService.connect(apiUrl, apiKey);
            if(isConnected) {
                const data = await apiSyncService.fetchAllData(apiUrl, apiKey);
                const newRecordings = await Promise.all(data.recordings.map(async r => ({ ...r, audioBlob: apiSyncService.base64ToBlob(r.audioBase64, r.audioMimeType) })));
                const newPhotos = await Promise.all(data.photos.map(async p => ({ ...p, imageBlob: apiSyncService.base64ToBlob(p.imageBase64, p.imageMimeType) })));
                const newNoteRecordings = await Promise.all(data.noteRecordings.map(async r => ({ ...r, audioBlob: apiSyncService.base64ToBlob(r.audioBase64, r.audioMimeType) })));

                const newSettings = { ...data.siteSettings, customApiEndpoint: apiUrl, customApiAuthKey: apiKey, syncMode: 'api' as const };
                setSiteSettings(newSettings);
                localStorage.setItem('siteSettings', JSON.stringify(newSettings));
                
                setTemplates(data.templates);
                setRecordings(newRecordings);
                setPhotos(newPhotos);
                setVideos([]); // TODO: Add video support to API sync
                setNotes(data.notes.map(migrateNote));
                setNoteRecordings(newNoteRecordings);
                setLogEntries(data.logEntries);
                setCalendarEvents(data.calendarEvents || []);
                setIsApiConnected(true);
                if (!silent) alert("Successfully connected to API server and synced data.");
            } else {
                throw new Error("Connection test failed. Check API URL and server status.");
            }
        } catch(e) {
            console.error("API Connection error:", e);
            if (!silent) alert(`Failed to connect to API: ${e instanceof Error ? e.message : String(e)}`);
            setIsApiConnected(false);
        } finally {
            setIsApiConnecting(false);
        }
    }, []);
    
    const handleApiDisconnect = useCallback(() => {
        if(window.confirm("Disconnect from the API server? The app will revert to local browser storage.")) {
            setIsApiConnected(false);
            const newSettings = { ...siteSettings, customApiEndpoint: null, customApiAuthKey: null, syncMode: 'local' as const };
            setSiteSettings(newSettings);
            localStorage.setItem('siteSettings', JSON.stringify(newSettings));
        }
    }, [siteSettings]);

    const handleGoogleDriveConnect = useCallback(() => {
        const newSettings = { ...siteSettings, syncMode: 'api' as const };
        handleUpdateSettings(newSettings);
        cloudAuthService.connect();
    }, [siteSettings, handleUpdateSettings]);
    
    const handleGoogleDriveDisconnect = useCallback(async () => {
        await cloudAuthService.disconnect();
        setGoogleDriveStatus({ connected: false, email: '' });
        const newSettings = { ...siteSettings, syncMode: 'local' as const };
        handleUpdateSettings(newSettings);
        alert("Disconnected from Google Drive.");
    }, [siteSettings, handleUpdateSettings]);

    const onRestore = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadingMessage('Restoring backup...');
        try {
            const JSZip = await waitForGlobal<any>('JSZip');
            const zip = await JSZip.loadAsync(file);
            const metadataFile = zip.file('metadata.json');
            if (!metadataFile) throw new Error('Invalid backup: metadata.json not found.');
            
            const metadata: BackupData = JSON.parse(await metadataFile.async('string'));
            
            const restoredRecordings: Recording[] = [];
            const recordingsFolder = zip.folder('assets/recordings');
            if (recordingsFolder) {
                for (const fileName in recordingsFolder.files) {
                    if (fileName.endsWith('.json')) {
                        const recMetadata = JSON.parse(await recordingsFolder.files[fileName].async('string'));
                        const audioFile = zip.file(`assets/recordings/${recMetadata.id}.webm`);
                        if (audioFile) {
                            const audioBlob = await audioFile.async('blob');
                            restoredRecordings.push({ ...recMetadata, audioBlob });
                        }
                    }
                }
            }

            const restoredNoteRecordings: NoteRecording[] = [];
            const noteRecordingsFolder = zip.folder('assets/note_recordings');
            if (noteRecordingsFolder) {
                for (const fileName in noteRecordingsFolder.files) {
                    if (fileName.endsWith('.json')) {
                        const recMetadata = JSON.parse(await noteRecordingsFolder.files[fileName].async('string'));
                        const audioFile = zip.file(`assets/note_recordings/${recMetadata.id}.webm`);
                        if (audioFile) {
                            const audioBlob = await audioFile.async('blob');
                            restoredNoteRecordings.push({ ...recMetadata, audioBlob });
                        }
                    }
                }
            }
            
            const restoredPhotos: Photo[] = [];
            const photosFolder = zip.folder('assets/photos');
            if (photosFolder) {
                 const processFolder = async (folder: any, path: string) => {
                    for (const fileName in folder.files) {
                        const fullPath = path + fileName;
                        const fileInFolder = folder.files[fileName];
                        if (fileInFolder.dir) {
                           await processFolder(fileInFolder, fullPath);
                        } else if (fileName.endsWith('.json')) {
                            const photoMetadata = JSON.parse(await fileInFolder.async('string'));
                            const ext = photoMetadata.imageMimeType.split('/')[1] || 'png';
                            const imageFile = zip.file(`assets/photos/${photoMetadata.folder}/${photoMetadata.id}.${ext}`);
                            if (imageFile) {
                                const imageBlob = await imageFile.async('blob');
                                restoredPhotos.push({ ...photoMetadata, imageBlob });
                            }
                        }
                    }
                };
                await processFolder(photosFolder, '');
            }
            
            const restoredVideos: Video[] = [];
            const videosFolder = zip.folder('assets/videos');
            if (videosFolder) {
                 const processFolder = async (folder: any) => {
                    for (const fileName in folder.files) {
                        if (fileName.endsWith('.json')) {
                            const videoMetadata = JSON.parse(await folder.files[fileName].async('string'));
                            const ext = videoMetadata.videoMimeType.split('/')[1] || 'mp4';
                            const videoFile = zip.file(`assets/videos/${videoMetadata.folder}/${videoMetadata.id}.${ext}`);
                            if (videoFile) {
                                const videoBlob = await videoFile.async('blob');
                                restoredVideos.push({ ...videoMetadata, videoBlob });
                            }
                        }
                    }
                };
                await processFolder(videosFolder);
            }

            if (directoryHandle) await handleDisconnectDirectory();

            await db.clearAllData();
            await Promise.all([
                ...restoredRecordings.map(r => db.saveRecording(r)),
                ...restoredPhotos.map(p => db.savePhoto(p)),
                ...restoredVideos.map(v => db.saveVideo(v)),
                ...metadata.notes.map((n: Note) => db.saveNote(n)),
                ...restoredNoteRecordings.map(r => db.saveNoteRecording(r)),
                ...(metadata.logEntries || []).map((l: LogEntry) => db.saveLogEntry(l)),
                ...(metadata.calendarEvents || []).map((e: CalendarEvent) => db.saveCalendarEvent(e)),
            ]);

            setSiteSettings(metadata.siteSettings);
            setTemplates(metadata.templates);
            setRecordings(restoredRecordings);
            setPhotos(restoredPhotos);
            setVideos(restoredVideos);
            setNotes(metadata.notes.map(migrateNote));
            setNoteRecordings(restoredNoteRecordings);
            setLogEntries(metadata.logEntries || []);
            setCalendarEvents(metadata.calendarEvents || []);

            alert("Backup restored successfully!");

        } catch (e) {
            console.error("Restore failed:", e);
            alert(`Failed to restore backup: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [directoryHandle, handleDisconnectDirectory]);

    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    };

     const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setIsAuthenticated(true);
        handleSaveLogEntry({ type: 'Clock In', timestamp: new Date().toISOString() });
        const loginData = {
          timestamp: new Date().getTime(),
          role: role
        };
        localStorage.setItem('loginData', JSON.stringify(loginData));
    };

    const handleLogout = useCallback(() => {
        handleSaveLogEntry({ type: 'Clock Out', timestamp: new Date().toISOString() });
        setIsAuthenticated(false);
        setUserRole('user');
        localStorage.removeItem('loginData');
    }, [handleSaveLogEntry]);


    if (!isInitialized) {
        return <FullScreenLoader message="Initializing App..." />;
    }
    
    if (isPinResetting) {
        return <PinSetupModal 
            onSetPin={(pin, _) => handleSetNewPinAfterReset(pin)} 
            mode="reset" 
            siteSettings={siteSettings}
            showInstallButton={!isAppInstalled}
            onInstallClick={handleInstallClick}
        />;
    }

    if (isPinSetupModalOpen) {
        return <PinSetupModal 
            onSetPin={handleSetUserPin} 
            mode="setup" 
            siteSettings={siteSettings}
            showInstallButton={!isAppInstalled}
            onInstallClick={handleInstallClick}
        />;
    }
    
    if (isOnboardingOpen) {
        return <OnboardingTour onFinish={handleFinishOnboarding} />;
    }

    if (!isAuthenticated) {
        return <AuthModal 
            onUnlock={handleLogin} 
            userPin={siteSettings.userPin} 
            siteSettings={siteSettings} 
            showInstallButton={!isAppInstalled}
            onInstallClick={handleInstallClick}
        />;
    }


    const renderView = () => {
        switch (currentView) {
            case 'home':
                return (
                    <Home
                        onNavigate={setCurrentView}
                        notes={notes}
                        photos={photos}
                        recordings={recordings}
                        logEntries={logEntries}
                        onSaveLogEntry={(type) => handleSaveLogEntry({type, timestamp: new Date().toISOString()})}
                        siteSettings={siteSettings}
                        onOpenDashboard={() => setIsDashboardOpen(true)}
                        calendarEvents={calendarEvents}
                        getWeatherInfo={getWeatherInfo}
                        storageUsage={storageUsage}
                        onLogout={handleLogout}
                        userRole={userRole}
                        onOpenOnboarding={handleOpenOnboarding}
                        onOpenCalendar={() => setIsCalendarModalOpen(true)}
                    />
                );
            case 'generator':
                return (
                    <GeneratorView 
                        userInput={userInput}
                        onUserInputChange={setUserInput}
                        generatedOutput={generatedOutput}
                        isLoading={isLoading}
                        error={error}
                        templates={templates}
                        onAddTemplate={handleAddTemplate}
                        onEditTemplate={onEditTemplate}
                        selectedTemplateId={selectedTemplateId}
                        onTemplateChange={setSelectedTemplateId}
                        tone={tone}
                        onToneChange={setTone}
                        onGenerate={handleGenerate}
                        onSaveToFolder={handleSaveToFolder}
                        siteSettings={siteSettings}
                        photos={photos}
                        onSavePhoto={handleSavePhoto}
                        onDeletePhoto={handleDeletePhoto}
                        videos={videos}
                        onSaveVideo={handleSaveVideo}
                        onDeleteVideo={handleDeleteVideo}
                        recordings={recordings}
                        notes={notes}
                        onEditImage={handleEditImage}
                        onUpdatePhoto={handleUpdatePhoto}
                        heroImageSrc={siteSettings.heroImageSrc}
                        onNavigate={setCurrentView}
                    />
                );
             case 'recordings':
                return <RecordingManager 
                    recordings={recordings}
                    onSave={handleSaveRecording}
                    onUpdate={handleUpdateRecording}
                    onDelete={handleDeleteRecording}
                    photos={photos}
                    onSavePhoto={handleSavePhoto}
                    siteSettings={siteSettings}
                 />;
            case 'photos':
                return <PhotoManager 
                    photos={photos}
                    onSave={handleSavePhoto}
                    onUpdate={handleUpdatePhoto}
                    onDelete={handleDeletePhoto}
                />;
            case 'notepad':
                return <Notepad 
                    notes={notes}
                    onSave={handleSaveNote}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                    noteRecordings={noteRecordings}
                    onSaveNoteRecording={handleSaveNoteRecording}
                    onUpdateNoteRecording={handleUpdateNoteRecording}
                    onDeleteNoteRecording={handleDeleteNoteRecording}
                    photos={photos}
                    onSavePhoto={handleSavePhoto}
                    onUpdatePhoto={handleUpdatePhoto}
                    performAiAction={(prompt, context) => performAiAction(prompt, context, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey)}
                />;
            case 'image-tool':
                return <ImageTool 
                    initialImage={imageToEdit} 
                    onClearInitialImage={() => setImageToEdit(null)}
                    onNavigate={setCurrentView}
                />;
            case 'timesheet':
                return <TimesheetManager 
                    logEntries={logEntries}
                    activeTimer={activeTimer}
                    timerDuration={timerDuration}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
                    onNavigate={setCurrentView}
                />;
            case 'browser':
                return <FileBrowser 
                    photos={photos}
                    videos={videos}
                    directoryHandle={directoryHandle}
                    syncMode={siteSettings.syncMode}
                    onNavigate={setCurrentView}
                />;
            case 'calendar':
                // This view is now handled by a modal, so this case is effectively unused.
                return null;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen font-sans text-[var(--theme-text-primary)] flex flex-col">
            <InactivityManager onLogout={handleLogout} />
            
            {/* --- Mobile App Shell (Remains fixed at top for mobile) --- */}
            <div className="lg:hidden">
                 <MobileHeader 
                    siteSettings={siteSettings}
                    onNavigate={setCurrentView}
                    onOpenDashboard={() => setIsDashboardOpen(true)}
                    onOpenInfo={() => setIsInfoModalOpen(true)}
                    onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)}
                    showInstallButton={!isAppInstalled}
                    onInstallClick={handleInstallClick}
                    onToggleOrientation={() => {}}
                    isLandscapeLocked={false}
                    userRole={userRole}
                    isApiConnected={isApiConnected}
                />
            </div>
            
            <main className="flex-1 pt-[76px] lg:pt-0 flex flex-col pb-24 lg:pb-0">
                 <div className="bg-slate-950/70 flex-1 w-full overflow-hidden flex flex-col backdrop-blur-sm">
                    {/* --- Desktop Header (Now inside the main panel) --- */}
                    <Header 
                        siteSettings={siteSettings} 
                        isApiConnected={isApiConnected}
                        currentView={currentView}
                        onNavigate={setCurrentView}
                        onOpenDashboard={() => setIsDashboardOpen(true)}
                        onOpenInfo={() => setIsInfoModalOpen(true)}
                        onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)}
                        showInstallButton={!isAppInstalled}
                        onInstallClick={handleInstallClick}
                        onToggleOrientation={() => {}}
                        isLandscapeLocked={false}
                    />
                    {renderView()}
                </div>
            </main>
            
            <BottomNavBar
                 currentView={currentView} 
                 onNavigate={setCurrentView}
            />

            {isLoading && !generatedOutput?.text && <FullScreenLoader message={loadingMessage} />}
            
            {isDashboardOpen && (
                <Dashboard 
                    onClose={() => setIsDashboardOpen(false)}
                    templates={templates}
                    recordings={recordings}
                    photos={photos}
                    videos={videos}
                    notes={notes}
                    noteRecordings={noteRecordings}
                    logEntries={logEntries}
                    calendarEvents={calendarEvents}
                    siteSettings={siteSettings}
                    onUpdateSettings={handleUpdateSettings}
                    onRestore={onRestore}
                    directoryHandle={directoryHandle}
                    onSyncDirectory={handleSyncDirectory}
                    onDisconnectDirectory={handleDisconnectDirectory}
                    onClearLocalData={handleClearLocalData}
                    onApiConnect={handleApiConnect}
                    onApiDisconnect={handleApiDisconnect}
                    isApiConnecting={isApiConnecting}
                    isApiConnected={isApiConnected}
                    userRole={userRole}
                    onInitiatePinReset={handleInitiatePinReset}
                    onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)}
                    googleDriveStatus={googleDriveStatus}
                    onGoogleDriveConnect={handleGoogleDriveConnect}
                    onGoogleDriveDisconnect={handleGoogleDriveDisconnect}
                />
            )}
            {isPrintPreviewOpen && (
                <PrintPreview 
                    logEntries={logEntries} 
                    onClose={() => setIsPrintPreviewOpen(false)}
                    siteSettings={siteSettings}
                />
            )}
             {isCalendarModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 md:p-4" onClick={() => setIsCalendarModalOpen(false)}>
                    <div className="bg-[var(--theme-dark-bg)] w-full h-full md:max-w-4xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in" onClick={e => e.stopPropagation()}>
                        <CalendarView
                            onClose={() => setIsCalendarModalOpen(false)}
                            events={calendarEvents}
                            onSaveEvent={handleSaveCalendarEvent}
                            onDeleteEvent={handleDeleteCalendarEvent}
                            photos={photos}
                            onSavePhoto={handleSavePhoto}
                            recordings={recordings}
                            onSaveRecording={handleSaveRecording}
                        />
                    </div>
                </div>
            )}
            {isInfoModalOpen && <InfoModal onClose={() => setIsInfoModalOpen(false)} />}
            {isCreatorInfoOpen && <CreatorInfo creator={siteSettings.creator} onClose={() => setIsCreatorInfoOpen(false)} />}
            {isInstallOptionsModalOpen && (
                <InstallOptionsModal 
                    onClose={() => setIsInstallOptionsModalOpen(false)}
                    onPwaInstall={handlePwaInstallFromModal}
                    onDownloadApk={handleDownloadApk}
                    siteSettings={siteSettings}
                />
            )}
            {isManualInstallModalOpen && <ManualInstallModal onClose={() => setIsManualInstallModalOpen(false)} />}
            {showUpdateToast && <UpdateToast onUpdate={() => window.location.reload()} />}
        </div>
    );
};

export default App;