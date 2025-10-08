
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../Hero';
import { DEFAULT_SITE_SETTINGS, DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE, GITHUB_APK_URL, CREATOR_DETAILS, CreatorDetails, GIST_ID } from './constants';
import { GeneratorView } from '../components/GeneratorView';
import { generateProductDescription, getWeatherInfo, performAiAction } from '../services/geminiService';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { db } from '../services/db';
import { fileSystemService } from '../services/fileSystemService';
import { apiSyncService, waitForGlobal } from '../utils/dataUtils';
import { AuthModal } from '../components/AuthModal';
import { Dashboard } from '../components/Dashboard';
import { RecordingManager } from '../components/RecordingManager';
import { PhotoManager } from '../components/PhotoManager';
import { Notepad } from '../components/Notepad';
import { ImageTool } from '../ImageTool';
import { BottomNavBar } from '../components/BottomNavBar';
import { InfoModal } from '../components/InfoModal';
import { CreatorInfo } from '../components/CreatorInfo';
import { ManualInstallModal } from '../components/ManualInstallModal';
import { UpdateToast } from '../components/UpdateToast';
import { MobileHeader } from '../components/MobileHeader';
import { Home } from '../components/Home';
import { PinSetupModal } from '../components/PinSetupModal';
import { CalendarView } from '../components/CalendarView';
import { TimesheetManager } from '../TimesheetManager';
import { calculateStorageUsage } from '../utils/storageUtils';
import { OnboardingTour } from '../OnboardingTour';
import { PrintPreview } from '../components/PrintPreview';
import { InstallOptionsModal } from '../components/InstallOptionsModal';
import { InactivityManager } from '../components/InactivityManager';
import { FileBrowser } from '../components/FileBrowser';
import { FolderOpenIcon } from '../components/icons/FolderOpenIcon';
import type { SiteSettings } from './constants';
import type { View, UserRole, Template, ParsedProductData, Recording, Photo, Video, NoteRecording, Note, LogEntry, CalendarEvent, StorageUsage, GenerationResult, FileSystemItem, BackupData } from './types';

// A type for the BeforeInstallPromptEvent, which is not yet in standard TS libs
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
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
    const [creatorDetails, setCreatorDetails] = useState<CreatorDetails>(CREATOR_DETAILS); // Initialize with fallback
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
    
    // --- New State for Reconnection Flow ---
    const [reconnectPrompt, setReconnectPrompt] = useState<{ handle: FileSystemDirectoryHandle; visible: boolean } | null>(null);
    
    // --- New State for Smart Orientation Lock ---
    const [isLandscapeLocked, setIsLandscapeLocked] = useState(false);
    const [isOrientationApiSupported, setIsOrientationApiSupported] = useState(false);

    // New state for PWA integrations
    const [noteToSelectId, setNoteToSelectId] = useState<string | null>(null);
    const [fileToEdit, setFileToEdit] = useState<File | null>(null);
    const initialUrlChecked = useRef(false);


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

    // --- Smart Orientation Lock Logic ---
    useEffect(() => {
        const isSupported = 'orientation' in screen && 'lock' in screen.orientation;
        setIsOrientationApiSupported(isSupported);
        
        if (!isSupported) return;

        const handleOrientationChange = () => {
            // If the orientation changes to portrait, the lock is no longer active.
            if (screen.orientation.type.startsWith('portrait')) {
                setIsLandscapeLocked(false);
            }
        };

        screen.orientation.addEventListener('change', handleOrientationChange);
        return () => screen.orientation.removeEventListener('change', handleOrientationChange);
    }, []);

    const handleToggleOrientation = useCallback(async () => {
        if (!isOrientationApiSupported) {
            alert("Screen orientation control is not supported on this device.");
            return;
        }
        
        try {
            if (!isLandscapeLocked) {
                // Attempt to lock to landscape
                await (screen.orientation as any).lock('landscape-primary');
                setIsLandscapeLocked(true);
            } else {
                // Unlock
                (screen.orientation as any).unlock();
                setIsLandscapeLocked(false);
            }
        } catch (err) {
            // This catch block is crucial. It triggers if the OS prevents the lock.
            console.error("Failed to lock orientation:", err);
            if (err instanceof DOMException && err.name === 'NotSupportedError') {
                 alert("Could not lock orientation. Please make sure your device's auto-rotate is enabled.");
            } else {
                 alert("An error occurred while trying to lock the screen orientation.");
            }
            setIsLandscapeLocked(false); // Ensure our state is correct
        }
    }, [isLandscapeLocked, isOrientationApiSupported]);


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
    
    // Effect to dynamically update PWA icons when the site logo changes.
    useEffect(() => {
        const logoUrl = siteSettings.logoSrc;
        if (logoUrl) {
            const faviconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
            if (faviconLink) faviconLink.href = logoUrl;

            const appleTouchIconLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
            if (appleTouchIconLink) appleTouchIconLink.href = logoUrl;
        }
    }, [siteSettings.logoSrc]);

    // Effect to dynamically update app background image
    useEffect(() => {
        if (siteSettings.backgroundImageSrc) {
            document.body.style.setProperty('--app-background-image', `url(${siteSettings.backgroundImageSrc})`);
        } else {
            document.body.style.removeProperty('--app-background-image');
        }
    }, [siteSettings.backgroundImageSrc]);

    const handleInstallClick = async () => {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            const { outcome } = await installPromptEvent.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            setInstallPromptEvent(null);
        } else {
            setIsInstallOptionsModalOpen(true);
        }
    };

    const handlePwaInstallFromModal = () => {
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
    
     const loadLocalData = useCallback(async () => {
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
    }, []);

    const handleReconnect = async () => {
        if (!reconnectPrompt) return;
        const handle = reconnectPrompt.handle;
        setReconnectPrompt(null); // Hide prompt immediately

        try {
            const permissionState = await (handle as any).requestPermission({ mode: 'readwrite' });
            if (permissionState === 'granted') {
                setDirectoryHandle(handle);
                await handleUpdateSettings({ ...siteSettings, syncMode: 'folder' });
                await syncFromDirectory(handle);
            } else {
                throw new Error("Permission denied.");
            }
        } catch (err) {
            console.warn('Reconnection failed:', err);
            await db.clearDirectoryHandle();
            await handleUpdateSettings({ ...siteSettings, syncMode: 'local' });
            await loadLocalData(); // Fallback to local
        }
    };

    const handleDeclineReconnect = async () => {
        setReconnectPrompt(null);
        await db.clearDirectoryHandle();
        await handleUpdateSettings({ ...siteSettings, syncMode: 'local' });
        await loadLocalData();
    };

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

    // --- Data Loading and Initialization ---
    useEffect(() => {
        const fetchCreatorDetails = async () => {
            if (!GIST_ID) {
                console.warn("GIST_ID is not configured. Falling back to local creator details.");
                return;
            }
            try {
                const response = await fetch(`https://gist.githubusercontent.com/${GIST_ID}/raw/creator_details.json?t=${new Date().getTime()}`);
                if (!response.ok) throw new Error('Failed to fetch creator details from Gist.');
                const data = await response.json();
                setCreatorDetails(data);
                console.log("Successfully loaded live creator details.");
            } catch (error) {
                console.error("Could not fetch live creator details:", error, "Using local fallback.");
            }
        };

        fetchCreatorDetails();

        const initializeApp = async () => {
            try {
                if (!initialUrlChecked.current) {
                    initialUrlChecked.current = true;
                    const urlParams = new URLSearchParams(window.location.search);

                    if (urlParams.get('new-note') === 'true') {
                        const defaultColors = ['sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'];
                        const newNote: Note = {
                            id: crypto.randomUUID(),
                            title: 'New Note',
                            content: '<p></p>',
                            category: 'General',
                            tags: [],
                            date: new Date().toISOString(),
                            color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
                            isLocked: false,
                            heroImage: null,
                            paperStyle: 'paper-dark',
                            fontStyle: 'font-sans',
                            dueDate: null,
                            reminderDate: null,
                            reminderFired: false,
                            recordingIds: [],
                            photoIds: [],
                        };
                        await handleSaveNote(newNote);
                        setNoteToSelectId(newNote.id);
                        setCurrentView('notepad');
                    }

                    if (urlParams.get('from-share') === 'true') {
                        const title = urlParams.get('title') || 'Shared Content';
                        const text = urlParams.get('text') || '';
                        const url = urlParams.get('url') || '';
                        let content = '';
                        if (text) content += `<p>${text.replace(/\n/g, '<br>')}</p>`;
                        if (url) content += `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`;
                        
                        const defaultColors = ['sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'];
                        const newNote: Note = {
                            id: crypto.randomUUID(),
                            title: title,
                            content: content || '<p></p>',
                            category: 'Shared',
                            tags: ['shared'],
                            date: new Date().toISOString(),
                            color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
                            isLocked: false,
                            heroImage: null,
                            paperStyle: 'paper-dark',
                            fontStyle: 'font-sans',
                            dueDate: null,
                            reminderDate: null,
                            reminderFired: false,
                            recordingIds: [],
                            photoIds: [],
                        };
                        await handleSaveNote(newNote);
                        setNoteToSelectId(newNote.id);
                        setCurrentView('notepad');
                    }
                }

                const urlParams = new URLSearchParams(window.location.search);
                const requestedView = urlParams.get('view') as View;
                const validViews: View[] = ['home', 'generator', 'recordings', 'photos', 'notepad', 'image-tool', 'timesheet', 'browser'];
                if (requestedView && validViews.includes(requestedView)) {
                    setCurrentView(requestedView);
                }

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

                if (handle) {
                    const permissionState = await (handle as any).queryPermission({ mode: 'readwrite' });
                    if (permissionState === 'granted') {
                        setDirectoryHandle(handle);
                        await handleUpdateSettings({ ...settings, syncMode: 'folder' });
                        await syncFromDirectory(handle);
                    } else if (permissionState === 'prompt') {
                        setReconnectPrompt({ handle, visible: true });
                    } else {
                        await db.clearDirectoryHandle();
                        await handleUpdateSettings({ ...settings, syncMode: 'local' });
                        await loadLocalData();
                    }
                } else {
                    if (settings.syncMode === 'api' && settings.customApiEndpoint && settings.customApiAuthKey) {
                        await handleApiConnect(settings.customApiEndpoint, settings.customApiAuthKey, true);
                    } else {
                        await loadLocalData();
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
    }, [loadLocalData, handleSaveNote]);
    
    useEffect(() => {
        if ('launchQueue' in window && (window as any).launchQueue) {
            (window as any).launchQueue.setConsumer(async (launchParams: any) => {
                if (launchParams.files && launchParams.files.length > 0) {
                    const fileHandle = launchParams.files[0];
                    const file = await fileHandle.getFile();
                    setFileToEdit(file);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (fileToEdit) {
            const tempPhoto: Photo = {
                id: `temp-${crypto.randomUUID()}`,
                name: fileToEdit.name,
                notes: 'Opened from file system',
                date: new Date().toISOString(),
                folder: '_temp_opened',
                imageBlob: fileToEdit,
                imageMimeType: fileToEdit.type,
                tags: ['opened-file'],
            };
            setImageToEdit(tempPhoto);
            setCurrentView('image-tool');
            setFileToEdit(null); // Reset after handling
        }
    }, [fileToEdit]);
    
    // --- Reminder Service ---
    const handleSaveCalendarEvent = useCallback(async (event: CalendarEvent) => {
        setCalendarEvents(prev => {
            const existing = prev.find(e => e.id === event.id);
            return existing ? prev.map(e => e.id === event.id ? event : e) : [event, ...prev];
        });
        await db.saveCalendarEvent(event);
        if (directoryHandle) await fileSystemService.saveCalendarEventToDirectory(directoryHandle, event);
    }, [directoryHandle]);

    const handleUpdateNote = useCallback(async (note: Note) => {
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
                        icon: '/android-launchericon-192-192.png',
                        tag: event.id,
                    });
                    const updatedEvent = { ...event, reminderFired: true };
                    await handleSaveCalendarEvent(updatedEvent); 
                }
            }
        };
        const intervalId = setInterval(checkReminders, 60000);
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
                        icon: '/android-launchericon-192-192.png',
                        tag: note.id,
                    });
                    const updatedNote = { ...note, reminderFired: true };
                    await handleUpdateNote(updatedNote);
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
        if (!siteSettings.onboardingCompleted) {
            setIsOnboardingOpen(true);
        }
    };
    
    const handleInitiatePinReset = () => {
        setIsPinResetting(true);
        setIsDashboardOpen(false);
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
        return newRecording;
    }, [directoryHandle, handleSaveLogEntry]);

    const handleUpdateRecording = useCallback(async (recording: Recording) => {
        setRecordings(prev => prev.map(r => r.id === recording.id ? recording : r));
        await db.saveRecording(recording);
        if (directoryHandle) await fileSystemService.saveRecordingToDirectory(directoryHandle, recording);
    }, [directoryHandle]);

    const handleDeleteRecording = useCallback(async (id: string) => {
        let originalRecordings: Recording[] | null = null;
        setRecordings(prev => {
            originalRecordings = prev;
            return prev.filter(r => r.id !== id);
        });
        try {
            await db.deleteRecording(id);
            if (directoryHandle) await fileSystemService.deleteRecordingFromDirectory(directoryHandle, id);
        } catch (e) {
            if (originalRecordings) setRecordings(originalRecordings);
            console.error("Failed to delete recording:", e);
            alert(`Failed to delete recording: ${e instanceof Error ? e.message : String(e)}`);
        }
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
        let originalPhotos: Photo[] | null = null;
        setPhotos(prev => {
            originalPhotos = prev;
            return prev.filter(p => p.id !== photo.id);
        });
        try {
            await db.deletePhoto(photo.id);
            if (directoryHandle) await fileSystemService.deletePhotoFromDirectory(directoryHandle, photo);
        } catch (e) {
            if (originalPhotos) setPhotos(originalPhotos);
            console.error("Failed to delete photo:", e);
            alert(`Failed to delete photo: ${e instanceof Error ? e.message : String(e)}`);
        }
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
        let originalVideos: Video[] | null = null;
        setVideos(prev => {
            originalVideos = prev;
            return prev.filter(v => v.id !== video.id);
        });
        try {
            await db.deleteVideo(video.id);
            if (directoryHandle) await fileSystemService.deleteVideoFromDirectory(directoryHandle, video);
        } catch (e) {
            if (originalVideos) setVideos(originalVideos);
            console.error("Failed to delete video:", e);
            alert(`Failed to delete video: ${e instanceof Error ? e.message : String(e)}`);
        }
    }, [directoryHandle]);

    const handleDeleteFolderContents = useCallback(async (folderPath: string) => {
        const photosToDelete = photos.filter(p => p.folder.startsWith(folderPath));
        const videosToDelete = videos.filter(v => v.folder.startsWith(folderPath));

        for (const photo of photosToDelete) await handleDeletePhoto(photo);
        for (const video of videosToDelete) await handleDeleteVideo(video);
    }, [photos, videos, handleDeletePhoto, handleDeleteVideo]);

    const handleDeleteNote = useCallback(async (id: string) => {
        let originalNotes: Note[] | null = null;
        setNotes(prev => {
            originalNotes = prev;
            return prev.filter(n => n.id !== id);
        });
        try {
            await db.deleteNote(id);
            if (directoryHandle) await fileSystemService.deleteNoteFromDirectory(directoryHandle, id);
        } catch (e) {
            if (originalNotes) setNotes(originalNotes);
            console.error("Failed to delete note:", e);
            alert(`Failed to delete note: ${e instanceof Error ? e.message : String(e)}`);
        }
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
        let originalNoteRecordings: NoteRecording[] | null = null;
        setNoteRecordings(prev => {
            originalNoteRecordings = prev;
            return prev.filter(r => r.id !== id);
        });
        try {
            await db.deleteNoteRecording(id);
            if (directoryHandle) await fileSystemService.deleteNoteRecordingFromDirectory(directoryHandle, id);
        } catch (e) {
            if (originalNoteRecordings) setNoteRecordings(originalNoteRecordings);
            console.error("Failed to delete note recording:", e);
            alert(`Failed to delete note recording: ${e instanceof Error ? e.message : String(e)}`);
        }
    }, [directoryHandle]);

    const handleDeleteCalendarEvent = useCallback(async (id: string) => {
        let originalEvents: CalendarEvent[] | null = null;
        setCalendarEvents(prev => {
            originalEvents = prev;
            return prev.filter(e => e.id !== id);
        });
        try {
            await db.deleteCalendarEvent(id);
            if (directoryHandle) await fileSystemService.deleteCalendarEventFromDirectory(directoryHandle, id);
        } catch (e) {
            if (originalEvents) setCalendarEvents(originalEvents);
            console.error("Failed to delete calendar event:", e);
            alert(`Failed to delete calendar event: ${e instanceof Error ? e.message : String(e)}`);
        }
    }, [directoryHandle]);

    const handleRenameItem = useCallback(async (item: FileSystemItem, newName: string) => {
        if (siteSettings.syncMode !== 'local') return;

        if (item.type === 'directory') {
            const oldPath = item.path;
            const pathParts = oldPath.split('/');
            pathParts[pathParts.length - 1] = newName;
            const newPath = pathParts.join('/');

            const updatedPhotosPromises = photos.map(p => {
                let newFolder = p.folder;
                if (p.folder === oldPath) newFolder = newPath;
                else if (p.folder.startsWith(oldPath + '/')) newFolder = newPath + p.folder.substring(oldPath.length);
                if (newFolder !== p.folder) {
                    const updatedPhoto = { ...p, folder: newFolder };
                    return db.savePhoto(updatedPhoto).then(() => updatedPhoto);
                }
                return Promise.resolve(p);
            });
    
            const updatedVideosPromises = videos.map(v => {
                let newFolder = v.folder;
                if (v.folder === oldPath) newFolder = newPath;
                else if (v.folder.startsWith(oldPath + '/')) newFolder = newPath + v.folder.substring(oldPath.length);
                if (newFolder !== v.folder) {
                    const updatedVideo = { ...v, folder: newFolder };
                    return db.saveVideo(updatedVideo).then(() => updatedVideo);
                }
                return Promise.resolve(v);
            });

            const [updatedPhotos, updatedVideos] = await Promise.all([
                Promise.all(updatedPhotosPromises),
                Promise.all(updatedVideosPromises),
            ]);
            
            setPhotos(updatedPhotos);
            setVideos(updatedVideos);

        } else { // It's a file
            if (item.kind === 'photo') {
                const photoToUpdate = photos.find(p => p.id === item.id);
                if (photoToUpdate) await handleUpdatePhoto({ ...photoToUpdate, name: newName });
            } else if (item.kind === 'video') {
                const videoToUpdate = videos.find(v => v.id === item.id);
                if (videoToUpdate) await handleUpdateVideo({ ...videoToUpdate, name: newName });
            }
        }
    }, [siteSettings.syncMode, photos, videos, handleUpdatePhoto, handleUpdateVideo]);

    const handleStartTimer = (task: string) => {
        if (activeTimer) return;
        setActiveTimer({ startTime: Date.now(), task });
    };

    const handleStopTimer = () => {
        if (!activeTimer) return;
        
        const endTime = new Date();
        const startTime = new Date(activeTimer.startTime);

        if (endTime.getTime() - startTime.getTime() < 1000) {
            setActiveTimer(null);
            return;
        }
        
        const newEntry: Omit<LogEntry, 'id'> = { type: 'Manual Task', task: activeTimer.task, timestamp: startTime.toISOString(), startTime: startTime.toISOString(), endTime: endTime.toISOString() };
        handleSaveLogEntry(newEntry);
        setActiveTimer(null);
    };

    const handleGenerate = async () => {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (!selectedTemplate) { setError('Please select a template first.'); return; }
      setIsLoading(true);
      setError(null);
      setGeneratedOutput({ text: '', sources: [] });
      try {
        await generateProductDescription(userInput, selectedTemplate.prompt, tone, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey, (partialResult: GenerationResult) => setGeneratedOutput(partialResult));
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
        setGeneratedOutput(null);
      } finally { setIsLoading(false); }
    };
    
    const handleSaveToFolder = useCallback(async (item: ParsedProductData, structuredData: Record<string, string>) => {
        if (!directoryHandle) { alert("Local folder connection is required."); throw new Error("Directory not connected"); }
        try {
            await fileSystemService.saveProductDescription(directoryHandle, item, structuredData);
        } catch(e) { console.error("Error saving to folder:", e); alert(`Failed to save to folder: ${e instanceof Error ? e.message : String(e)}`); throw e; }
    }, [directoryHandle]);

    const handleUpdateSettings = useCallback(async (newSettings: SiteSettings) => {
        setSiteSettings(newSettings);
        localStorage.setItem('siteSettings', JSON.stringify(newSettings));
        if(directoryHandle) await fileSystemService.saveSettings(directoryHandle, newSettings);
    }, [directoryHandle]);
    
    const handleFinishOnboarding = useCallback(async () => {
        const newSettings = { ...siteSettings, onboardingCompleted: true };
        await handleUpdateSettings(newSettings);
        setIsOnboardingOpen(false);
    }, [siteSettings, handleUpdateSettings]);

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
                fileSystemService.loadSettings(handle), fileSystemService.loadTemplates(handle),
                fileSystemService.loadRecordingsFromDirectory(handle), fileSystemService.loadPhotosFromDirectory(handle),
                fileSystemService.loadVideosFromDirectory(handle), fileSystemService.loadNotesFromDirectory(handle),
                fileSystemService.loadNoteRecordingsFromDirectory(handle), fileSystemService.loadLogEntriesFromDirectory(handle),
                fileSystemService.loadCalendarEventsFromDirectory(handle),
            ]);
            
            if (dirSettings) setSiteSettings(prev => ({...prev, ...dirSettings, syncMode: 'folder' }));
            if (dirTemplates) setTemplates(dirTemplates);
            setRecordings(dirRecordings); setPhotos(dirPhotos); setVideos(dirVideos);
            setNotes(dirNotes.map(migrateNote)); setNoteRecordings(dirNoteRecordings);
            setLogEntries(dirLogEntries); setCalendarEvents(dirCalendarEvents);
            
            if (showSuccess) alert('Sync from folder complete!');

        } catch (e) { console.error("Sync error:", e); alert(`Error syncing from directory: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally { setIsLoading(false); }
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
        } catch (err) { if (err instanceof DOMException && err.name === 'AbortError') return; alert(`Could not connect to directory: ${err instanceof Error ? err.message : String(err)}`); }
    }, [siteSettings, templates, recordings, photos, videos, notes, noteRecordings, logEntries, calendarEvents, syncFromDirectory]);

    const handleDisconnectDirectory = useCallback(async () => {
        if(window.confirm("Are you sure? The app will switch back to local browser storage.")) {
            await db.clearDirectoryHandle(); setDirectoryHandle(null);
            const newSettings = { ...siteSettings, syncMode: 'local' as const };
            setSiteSettings(newSettings); localStorage.setItem('siteSettings', JSON.stringify(newSettings));
            await loadLocalData();
        }
    }, [siteSettings, loadLocalData]);

    const handleClearLocalData = useCallback(async () => {
        if (window.confirm("WARNING: This will permanently delete all data from local storage. This cannot be undone. Are you sure?")) {
            await db.clearAllData();
            setRecordings([]); setPhotos([]); setVideos([]); setNotes([]);
            setNoteRecordings([]); setLogEntries([]); setCalendarEvents([]);
            alert("Local data has been cleared.");
        }
    }, []);

    const handleApiConnect = useCallback(async (apiUrl: string, apiKey: string, silent = false) => {
        setIsApiConnecting(true);
        try {
            if(await apiSyncService.connect(apiUrl, apiKey)) {
                const data = await apiSyncService.fetchAllData(apiUrl, apiKey);
                const newRecordings = await Promise.all((data.recordings as any[]).map(async (r: any) => ({ ...r, audioBlob: apiSyncService.base64ToBlob(r.audioBase64, r.audioMimeType) })));
                const newPhotos = await Promise.all((data.photos as any[]).map(async (p: any) => ({ ...p, imageBlob: apiSyncService.base64ToBlob(p.imageBase64, p.imageMimeType) })));
                const newNoteRecordings = await Promise.all((data.noteRecordings as any[]).map(async (r: any) => ({ ...r, audioBlob: apiSyncService.base64ToBlob(r.audioBase64, r.audioMimeType) })));

                const newSettings = { ...data.siteSettings, customApiEndpoint: apiUrl, customApiAuthKey: apiKey, syncMode: 'api' as const };
                setSiteSettings(newSettings); localStorage.setItem('siteSettings', JSON.stringify(newSettings));
                setTemplates(data.templates); setRecordings(newRecordings); setPhotos(newPhotos);
                setVideos([]); setNotes(data.notes.map(migrateNote)); setNoteRecordings(newNoteRecordings);
                setLogEntries(data.logEntries); setCalendarEvents(data.calendarEvents || []); setIsApiConnected(true);
                if (!silent) alert("Successfully connected and synced.");
            } else throw new Error("Connection test failed.");
        } catch(e) {
            console.error("API Connection error:", e);
            if (!silent) alert(`Failed to connect to API: ${e instanceof Error ? e.message : String(e)}`);
            setIsApiConnected(false);
        } finally { setIsApiConnecting(false); }
    }, []);
    
    const handleApiDisconnect = useCallback(() => {
        if(window.confirm("Disconnect from API? The app will revert to local storage.")) {
            setIsApiConnected(false);
            const newSettings = { ...siteSettings, customApiEndpoint: null, customApiAuthKey: null, syncMode: 'local' as const };
            setSiteSettings(newSettings);
            localStorage.setItem('siteSettings', JSON.stringify(newSettings));
        }
    }, [siteSettings]);

    const onRestore = useCallback(async (file: File) => {
        setIsLoading(true); setLoadingMessage('Restoring backup...');
        try {
            const JSZip = await waitForGlobal<any>('JSZip');
            const zip = await JSZip.loadAsync(file);
            const metadataFile = zip.file('metadata.json');
            if (!metadataFile) throw new Error('Invalid backup: metadata.json not found.');
            
            const metadata: BackupData = JSON.parse(await metadataFile.async('string'));
            
            const restoredRecordings: Recording[] = [];
            const recordingsFolder = zip.folder('assets/recordings');
            if(recordingsFolder) {
                for (const fileName in recordingsFolder.files) {
                    if (fileName.endsWith('.json')) {
                        const recMeta = JSON.parse(await recordingsFolder.files[fileName].async('string'));
                        const audioFile = zip.file(`assets/recordings/${recMeta.id}.webm`);
                        if (audioFile) restoredRecordings.push({ ...recMeta, audioBlob: await audioFile.async('blob') });
                    }
                }
            }

            const restoredNoteRecordings: NoteRecording[] = [];
            const noteRecsFolder = zip.folder('assets/note_recordings');
            if(noteRecsFolder) {
                for (const fileName in noteRecsFolder.files) {
                    if (fileName.endsWith('.json')) {
                        const recMeta = JSON.parse(await noteRecsFolder.files[fileName].async('string'));
                        const audioFile = zip.file(`assets/note_recordings/${recMeta.id}.webm`);
                        if (audioFile) restoredNoteRecordings.push({ ...recMeta, audioBlob: await audioFile.async('blob') });
                    }
                }
            }
            
            const restoredPhotos: Photo[] = [];
            const photosFolder = zip.folder('assets/photos');
            if (photosFolder) {
                 const processFolder = async (folder: any) => {
                    for (const fileName in folder.files) {
                        if (fileName.endsWith('.json')) {
                            const photoMeta = JSON.parse(await folder.files[fileName].async('string'));
                            const ext = photoMeta.imageMimeType.split('/')[1] || 'png';
                            const imageFile = zip.file(`assets/photos/${photoMeta.folder}/${photoMeta.id}.${ext}`);
                            if (imageFile) restoredPhotos.push({ ...photoMeta, imageBlob: await imageFile.async('blob') });
                        }
                    }
                };
                await processFolder(photosFolder);
            }
            
            const restoredVideos: Video[] = [];
            const videosFolder = zip.folder('assets/videos');
            if (videosFolder) {
                 const processFolder = async (folder: any) => {
                    for (const fileName in folder.files) {
                        if (fileName.endsWith('.json')) {
                            const videoMeta = JSON.parse(await folder.files[fileName].async('string'));
                            const ext = videoMeta.videoMimeType.split('/')[1] || 'mp4';
                            const videoFile = zip.file(`assets/videos/${videoMeta.folder}/${videoMeta.id}.${ext}`);
                            if (videoFile) restoredVideos.push({ ...videoMeta, videoBlob: await videoFile.async('blob') });
                        }
                    }
                };
                await processFolder(videosFolder);
            }

            if (directoryHandle) await handleDisconnectDirectory();

            await db.clearAllData();
            await Promise.all([
                ...restoredRecordings.map((r: Recording) => db.saveRecording(r)),
                ...restoredPhotos.map((p: Photo) => db.savePhoto(p)),
                ...restoredVideos.map((v: Video) => db.saveVideo(v)),
                ...metadata.notes.map((n: Note) => db.saveNote(n)),
                ...restoredNoteRecordings.map((r: NoteRecording) => db.saveNoteRecording(r)),
                ...(metadata.logEntries || []).map((l: LogEntry) => db.saveLogEntry(l)),
                ...(metadata.calendarEvents || []).map((e: CalendarEvent) => db.saveCalendarEvent(e)),
            ]);

            setSiteSettings(metadata.siteSettings); setTemplates(metadata.templates);
            setRecordings(restoredRecordings); setPhotos(restoredPhotos); setVideos(restoredVideos);
            setNotes(metadata.notes.map(migrateNote)); setNoteRecordings(restoredNoteRecordings);
            setLogEntries(metadata.logEntries || []); setCalendarEvents(metadata.calendarEvents || []);
            alert("Backup restored successfully!");
        } catch (e) { console.error("Restore failed:", e); alert(`Failed to restore backup: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally { setIsLoading(false); }
    }, [directoryHandle, handleDisconnectDirectory]);

    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    };

     const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setIsAuthenticated(true);
        handleSaveLogEntry({ type: 'Clock In', timestamp: new Date().toISOString() });
        const loginData = { timestamp: new Date().getTime(), role: role };
        localStorage.setItem('loginData', JSON.stringify(loginData));
    };

    const handleLogout = useCallback(() => {
        handleSaveLogEntry({ type: 'Clock Out', timestamp: new Date().toISOString() });
        setIsAuthenticated(false);
        setUserRole('user');
        localStorage.removeItem('loginData');
    }, [handleSaveLogEntry]);


    if (!isInitialized) return <FullScreenLoader message="Initializing App..." />;
    if (isPinResetting) return <PinSetupModal onSetPin={(pin) => handleSetNewPinAfterReset(pin)} mode="reset" siteSettings={siteSettings} creatorDetails={creatorDetails} showInstallButton={!isAppInstalled} onInstallClick={handleInstallClick} />;
    if (isPinSetupModalOpen) return <PinSetupModal onSetPin={handleSetUserPin} mode="setup" siteSettings={siteSettings} creatorDetails={creatorDetails} showInstallButton={!isAppInstalled} onInstallClick={handleInstallClick} />;
    if (isOnboardingOpen) return <OnboardingTour onFinish={handleFinishOnboarding} />;
    if (!isAuthenticated) return <AuthModal onUnlock={handleLogin} userPin={siteSettings.userPin} siteSettings={siteSettings} creatorDetails={creatorDetails} showInstallButton={!isAppInstalled} onInstallClick={handleInstallClick} />;


    const renderView = () => {
        switch (currentView) {
            case 'home':
                return <Home onNavigate={setCurrentView} notes={notes} photos={photos} recordings={recordings} logEntries={logEntries} onSaveLogEntry={(type) => handleSaveLogEntry({type, timestamp: new Date().toISOString()})} siteSettings={siteSettings} creatorDetails={creatorDetails} onOpenDashboard={() => setIsDashboardOpen(true)} calendarEvents={calendarEvents} getWeatherInfo={getWeatherInfo} storageUsage={storageUsage} onLogout={handleLogout} userRole={userRole} onOpenOnboarding={() => setIsOnboardingOpen(true)} onOpenCalendar={() => setIsCalendarModalOpen(true)} isApiConnected={isApiConnected} />;
            case 'generator':
                return <GeneratorView userInput={userInput} onUserInputChange={setUserInput} generatedOutput={generatedOutput} isLoading={isLoading} error={error} templates={templates} onAddTemplate={handleAddTemplate} onEditTemplate={onEditTemplate} selectedTemplateId={selectedTemplateId} onTemplateChange={setSelectedTemplateId} tone={tone} onToneChange={setTone} onGenerate={handleGenerate} onSaveToFolder={handleSaveToFolder} siteSettings={siteSettings} photos={photos} onSavePhoto={handleSavePhoto} onDeletePhoto={handleDeletePhoto} videos={videos} onSaveVideo={handleSaveVideo} onDeleteVideo={handleDeleteVideo} recordings={recordings} notes={notes} onEditImage={handleEditImage} onUpdatePhoto={handleUpdatePhoto} heroImageSrc={siteSettings.heroImageSrc} onNavigate={setCurrentView} />;
             case 'recordings':
                return <RecordingManager recordings={recordings} onSave={handleSaveRecording} onUpdate={handleUpdateRecording} onDelete={handleDeleteRecording} photos={photos} onSavePhoto={handleSavePhoto} siteSettings={siteSettings} />;
            case 'photos':
                return <PhotoManager photos={photos} onSave={handleSavePhoto} onUpdate={handleUpdatePhoto} onDelete={handleDeletePhoto} />;
            case 'notepad':
                return <Notepad notes={notes} onSave={handleSaveNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} noteRecordings={noteRecordings} onSaveNoteRecording={handleSaveNoteRecording} onUpdateNoteRecording={handleUpdateNoteRecording} onDeleteNoteRecording={handleDeleteNoteRecording} photos={photos} onSavePhoto={handleSavePhoto} onUpdatePhoto={handleUpdatePhoto} performAiAction={(prompt, context) => performAiAction(prompt, context, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey)} siteSettings={siteSettings} noteToSelectId={noteToSelectId} onNoteSelected={() => setNoteToSelectId(null)} />;
            case 'image-tool':
                return <ImageTool initialImage={imageToEdit} onClearInitialImage={() => setImageToEdit(null)} onNavigate={setCurrentView} />;
            case 'timesheet':
                return <TimesheetManager logEntries={logEntries} activeTimer={activeTimer} timerDuration={timerDuration} onStartTimer={handleStartTimer} onStopTimer={handleStopTimer} onOpenPrintPreview={() => setIsPrintPreviewOpen(true)} onNavigate={setCurrentView} />;
            case 'browser':
                return <FileBrowser photos={photos} videos={videos} directoryHandle={directoryHandle} syncMode={siteSettings.syncMode || 'local'} onNavigate={setCurrentView} onDeletePhoto={handleDeletePhoto} onDeleteVideo={handleDeleteVideo} onDeleteFolderVirtual={handleDeleteFolderContents} onRenameItem={handleRenameItem} />;
            case 'calendar': return null;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen font-sans text-[var(--theme-text-primary)] flex flex-col">
            <InactivityManager onLogout={handleLogout} />
            <div className="lg:hidden"><MobileHeader siteSettings={siteSettings} onNavigate={setCurrentView} onOpenDashboard={() => setIsDashboardOpen(true)} onOpenInfo={() => setIsInfoModalOpen(true)} onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)} showInstallButton={!isAppInstalled} onInstallClick={handleInstallClick} onToggleOrientation={handleToggleOrientation} isLandscapeLocked={isLandscapeLocked} userRole={userRole} isApiConnected={isApiConnected} /></div>
            <main className="flex-1 pt-[76px] lg:pt-0 flex flex-col pb-24 lg:pb-0">
                 <div className="bg-slate-950/40 flex-1 w-full overflow-hidden flex flex-col backdrop-blur-sm">
                    <Header siteSettings={siteSettings} isApiConnected={isApiConnected} currentView={currentView} onNavigate={setCurrentView} onOpenDashboard={() => setIsDashboardOpen(true)} onOpenInfo={() => setIsInfoModalOpen(true)} showInstallButton={!isAppInstalled} onInstallClick={handleInstallClick} onToggleOrientation={handleToggleOrientation} isLandscapeLocked={isLandscapeLocked} onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)} />
                    {renderView()}
                </div>
            </main>
            <BottomNavBar currentView={currentView} onNavigate={setCurrentView} />
            {reconnectPrompt?.visible && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--theme-card-bg)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--theme-border)]/50 p-6 text-center animate-modal-scale-in">
                        <FolderOpenIcon className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">Reconnect to Folder?</h2>
                        <p className="text-slate-400 mt-2">Would you like to reconnect to your last used folder, <strong className="text-white">"{reconnectPrompt.handle.name}"</strong>?</p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button onClick={handleDeclineReconnect} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">Use Browser Storage</button>
                            <button onClick={handleReconnect} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">Reconnect</button>
                        </div>
                    </div>
                </div>
            )}
            {isLoading && !generatedOutput?.text && <FullScreenLoader message={loadingMessage} />}
            {isDashboardOpen && <Dashboard onClose={() => setIsDashboardOpen(false)} templates={templates} recordings={recordings} photos={photos} videos={videos} notes={notes} noteRecordings={noteRecordings} logEntries={logEntries} calendarEvents={calendarEvents} siteSettings={siteSettings} creatorDetails={creatorDetails} onUpdateSettings={handleUpdateSettings} onRestore={onRestore} directoryHandle={directoryHandle} onSyncDirectory={handleSyncDirectory} onDisconnectDirectory={handleDisconnectDirectory} onClearLocalData={handleClearLocalData} onApiConnect={handleApiConnect} onApiDisconnect={handleApiDisconnect} isApiConnecting={isApiConnecting} isApiConnected={isApiConnected} userRole={userRole} onInitiatePinReset={handleInitiatePinReset} onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)} />}
            {isPrintPreviewOpen && <PrintPreview logEntries={logEntries} onClose={() => setIsPrintPreviewOpen(false)} siteSettings={siteSettings} />}
            {isCalendarModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 md:p-4" onClick={() => setIsCalendarModalOpen(false)}>
                    <div className="bg-[var(--theme-bg)] w-full h-full md:max-w-4xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in" onClick={e => e.stopPropagation()}>
                        <CalendarView onClose={() => setIsCalendarModalOpen(false)} events={calendarEvents} onSaveEvent={handleSaveCalendarEvent} onDeleteEvent={handleDeleteCalendarEvent} photos={photos} onSavePhoto={handleSavePhoto} recordings={recordings} onSaveRecording={handleSaveRecording} />
                    </div>
                </div>
            )}
            {isInfoModalOpen && <InfoModal onClose={() => setIsInfoModalOpen(false)} />}
            {isCreatorInfoOpen && <CreatorInfo onClose={() => setIsCreatorInfoOpen(false)} creatorDetails={creatorDetails} />}
            {isInstallOptionsModalOpen && <InstallOptionsModal onClose={() => setIsInstallOptionsModalOpen(false)} onPwaInstall={handlePwaInstallFromModal} onDownloadApk={handleDownloadApk} siteSettings={siteSettings} />}
            {isManualInstallModalOpen && <ManualInstallModal onClose={() => setIsManualInstallModalOpen(false)} />}
            {showUpdateToast && <UpdateToast onUpdate={() => window.location.reload()} />}
        </div>
    );
};

export default App;
