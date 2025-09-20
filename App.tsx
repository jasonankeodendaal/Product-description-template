import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DEFAULT_SITE_SETTINGS, SiteSettings, DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE } from './constants';
import { GeneratorView } from './components/GeneratorView';
import { generateProductDescription } from './services/geminiService';
import { GenerationResult } from './components/OutputPanel';
import { FullScreenLoader } from './components/FullScreenLoader';
import { db } from './services/db';
import { fileSystemService } from './services/fileSystemService';
import { apiSyncService } from './utils/dataUtils';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { RecordingManager } from './components/RecordingManager';
import { PhotoManager } from './components/PhotoManager';
import { Notepad } from './components/Notepad';
import { ImageTool } from './components/ImageTool';
import { BottomNavBar } from './components/BottomNavBar';
import { InfoModal } from './components/InfoModal';
import { CreatorInfo } from './components/CreatorInfo';
import { ManualInstallModal } from './components/ManualInstallModal';
import { UpdateToast } from './components/UpdateToast';
import { InstallOptionsModal } from './components/InstallOptionsModal';
// FIX: Import the MobileHeader component to resolve the 'Cannot find name' error.
import { MobileHeader } from './components/MobileHeader';
import { projectFiles } from './utils/sourceCode';

// FIX: Declare JSZip to inform TypeScript about the global variable from the CDN.
declare var JSZip: any;

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
export type View = 'generator' | 'recordings' | 'photos' | 'notepad' | 'image-tool';

export interface Template {
  id: string;
  name: string;
  prompt: string;
}

export interface ParsedProductData {
    brand: string;
    sku: string;
    name: string;
    fullText: string;
    csvText: string;
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
}

export interface Note {
    id: string;
    title: string;
    content: string; // Can be simple text or HTML for checklists
    category: string;
    tags: string[];
    date: string;
    isLocked?: boolean;
    dueDate?: string | null;
}

export interface BackupData {
    siteSettings: SiteSettings;
    templates: Template[];
    recordings: Recording[];
    photos: Photo[];
    notes: Note[];
}

const App: React.FC = () => {
    // --- State ---
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');
    const [error, setError] = useState<string | null>(null);

    const [userInput, setUserInput] = useState('');
    const [generatedOutput, setGeneratedOutput] = useState<GenerationResult | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [tone, setTone] = useState('Professional');
    
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isCreatorInfoOpen, setIsCreatorInfoOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const [isApiConnecting, setIsApiConnecting] = useState(false);
    const [isApiConnected, setIsApiConnected] = useState(false);

    const [currentView, setCurrentView] = useState<View>('generator');
    
    // PWA Install Prompt State
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(
        () => window.matchMedia('(display-mode: standalone)').matches
    );
    const [isManualInstallModalOpen, setIsManualInstallModalOpen] = useState(false);
    const [isInstallOptionsModalOpen, setIsInstallOptionsModalOpen] = useState(false);
    
    // App Update State
    const [showUpdateToast, setShowUpdateToast] = useState(false);


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

    const handleBrowserInstall = async () => {
        if (!installPromptEvent) return;
        
        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        
        console.log(`User response to the install prompt: ${outcome}`);
        setInstallPromptEvent(null);
    };
    
    const handlePwaInstall = () => {
        setIsInstallOptionsModalOpen(false);
        // If the install prompt is available, show it.
        if (installPromptEvent) {
            handleBrowserInstall();
        } else {
            // Otherwise, show instructions on how to install manually.
            setIsManualInstallModalOpen(true);
        }
    };
    
    const handleDownloadSourceZip = async () => {
        setIsInstallOptionsModalOpen(false); // Close modal first
        setIsLoading(true);
        setLoadingMessage('Packaging source code...');
        try {
            if (typeof JSZip === 'undefined') {
                alert("Error: JSZip library is not loaded. Cannot create .zip file.");
                throw new Error("JSZip not loaded");
            }
            const zip = new JSZip();

            // Helper to create folders recursively
            const getFolder = (path: string): any => {
                let folder = zip;
                const parts = path.split('/');
                for (const part of parts) {
                    if (part) {
                        folder = folder.folder(part)!;
                    }
                }
                return folder;
            };
            
            for (const [fullPath, content] of Object.entries(projectFiles)) {
                const pathParts = fullPath.split('/');
                const fileName = pathParts.pop()!;
                const folderPath = pathParts.join('/');
                
                const folder = getFolder(folderPath);
                folder.file(fileName, content);
            }
            
            const blob = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `AiTools_SourceCode_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (e) {
            console.error("Failed to create zip:", e);
            alert("An error occurred while packaging the source code. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Data Loading and Initialization ---
    useEffect(() => {
        // Handle URL-based view navigation from PWA shortcuts
        const urlParams = new URLSearchParams(window.location.search);
        const requestedView = urlParams.get('view') as View;
        const validViews: View[] = ['generator', 'recordings', 'photos', 'notepad', 'image-tool'];
        if (requestedView && validViews.includes(requestedView)) {
            setCurrentView(requestedView);
        }

        const initializeApp = async () => {
            try {
                const storedSettings = localStorage.getItem('siteSettings');
                let settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SITE_SETTINGS;

                const storedTemplates = localStorage.getItem('templates');
                let initialTemplates = storedTemplates ? JSON.parse(storedTemplates) : [];
                 if (initialTemplates.length === 0) {
                    initialTemplates.push({ id: 'default-product-desc', name: 'Default E-commerce Product Description', prompt: DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE });
                }
                setTemplates(initialTemplates);
                setSelectedTemplateId(initialTemplates[0]?.id || '');

                const handle = await db.getDirectoryHandle();
                if (handle) {
                    // FIX: The standard FileSystemDirectoryHandle type may not include 'queryPermission'. Cast to 'any' to bypass the check for this widely supported but sometimes untyped method.
                    if (await (handle as any).queryPermission({ mode: 'readwrite' }) === 'granted') {
                        setDirectoryHandle(handle);
                        settings = { ...settings, syncMode: 'folder' };
                        await syncFromDirectory(handle);
                    } else {
                        await db.clearDirectoryHandle();
                    }
                } else if (settings.syncMode === 'api' && settings.customApiEndpoint && settings.customApiAuthKey) {
                    await handleApiConnect(settings.customApiEndpoint, settings.customApiAuthKey, true);
                } else {
                    const [dbRecordings, dbPhotos, dbNotes] = await Promise.all([
                        db.getAllRecordings(),
                        db.getAllPhotos(),
                        db.getAllNotes(),
                    ]);
                    setRecordings(dbRecordings);
                    setPhotos(dbPhotos);
                    setNotes(dbNotes);
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
    
    // FIX: Handle auth modal logic in an effect to avoid side-effects in render.
    useEffect(() => {
        if (isDashboardOpen && !isUnlocked) {
            setIsAuthModalOpen(true);
        }
    }, [isDashboardOpen, isUnlocked]);


    // --- Generic Data Handlers (Centralized) ---
    const handleSaveRecording = useCallback(async (recording: Recording) => {
        setRecordings(prev => [recording, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await db.saveRecording(recording);
        if (directoryHandle) await fileSystemService.saveRecordingToDirectory(directoryHandle, recording);
    }, [directoryHandle]);

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
    }, [directoryHandle]);

    const handleUpdatePhoto = useCallback(async (photo: Photo) => {
        // FIX: Corrected a typo in the map function. The variable should be 'p', not 'r'.
        setPhotos(prev => prev.map(p => p.id === photo.id ? photo : p));
        await db.savePhoto(photo);
        if (directoryHandle) await fileSystemService.savePhotoToDirectory(directoryHandle, photo);
    }, [directoryHandle]);

    const handleDeletePhoto = useCallback(async (photo: Photo) => {
        setPhotos(prev => prev.filter(p => p.id !== photo.id));
        await db.deletePhoto(photo.id);
        if (directoryHandle) await fileSystemService.deletePhotoFromDirectory(directoryHandle, photo);
    }, [directoryHandle]);

    const handleSaveNote = useCallback(async (note: Note) => {
        setNotes(prev => [note, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        await db.saveNote(note);
        if (directoryHandle) await fileSystemService.saveNoteToDirectory(directoryHandle, note);
    }, [directoryHandle]);

    const handleUpdateNote = useCallback(async (note: Note) => {
        // FIX: Corrected a typo in the map function. The variable should be 'n', not 'r'.
        setNotes(prev => prev.map(n => n.id === note.id ? note : n));
        await db.saveNote(note);
        if (directoryHandle) await fileSystemService.saveNoteToDirectory(directoryHandle, note);
    }, [directoryHandle]);

    const handleDeleteNote = useCallback(async (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        await db.deleteNote(id);
        if (directoryHandle) await fileSystemService.deleteNoteFromDirectory(directoryHandle, id);
    }, [directoryHandle]);

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
    
    const handleSaveToFolder = useCallback(async (item: ParsedProductData) => {
        if (!directoryHandle) {
             alert("Local folder connection is required to use this feature. Please connect a folder in the Dashboard.");
             throw new Error("Directory not connected");
        }
        try {
            await fileSystemService.saveProductDescription(directoryHandle, item);
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

    const handleAddTemplate = useCallback(async (name: string, prompt: string) => {
        const newTemplate: Template = { id: crypto.randomUUID(), name, prompt };
        const updatedTemplates = [...templates, newTemplate];
        setTemplates(updatedTemplates);
        localStorage.setItem('templates', JSON.stringify(updatedTemplates));
        if(directoryHandle) await fileSystemService.saveTemplates(directoryHandle, updatedTemplates);
    }, [templates, directoryHandle]);

    const onEditTemplate = useCallback(async (id: string, newName: string) => {
        const updatedTemplates = templates.map(t => t.id === id ? { ...t, name: newName } : t);
        setTemplates(updatedTemplates);
        localStorage.setItem('templates', JSON.stringify(updatedTemplates));
        if(directoryHandle) await fileSystemService.saveTemplates(directoryHandle, updatedTemplates);
    }, [templates, directoryHandle]);

    const syncFromDirectory = async (handle: FileSystemDirectoryHandle, showSuccess = false) => {
        setLoadingMessage('Syncing from folder...');
        setIsLoading(true);
        try {
            const [dirSettings, dirTemplates, {recordings: dirRecordings}, dirPhotos, dirNotes] = await Promise.all([
                fileSystemService.loadSettings(handle),
                fileSystemService.loadTemplates(handle),
                fileSystemService.loadRecordingsFromDirectory(handle),
                fileSystemService.loadPhotosFromDirectory(handle),
                fileSystemService.loadNotesFromDirectory(handle),
            ]);
            
            if (dirSettings) setSiteSettings(prev => ({...prev, ...dirSettings, syncMode: 'folder' }));
            if (dirTemplates) setTemplates(dirTemplates);
            setRecordings(dirRecordings);
            setPhotos(dirPhotos);
            setNotes(dirNotes);
            
            if (showSuccess) alert('Sync from folder complete!');

        } catch (e) {
            console.error("Sync error:", e);
            alert(`Error syncing from directory: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSyncDirectory = useCallback(async () => {
        try {
            const handle = await fileSystemService.getDirectoryHandle();
            if (await fileSystemService.directoryHasData(handle)) {
                if (!window.confirm("The selected folder contains data. Do you want to overwrite your current session with the folder's data?")) {
                    return;
                }
                await syncFromDirectory(handle);
            } else {
                await Promise.all([
                    fileSystemService.saveSettings(handle, siteSettings),
                    fileSystemService.saveTemplates(handle, templates),
                    fileSystemService.saveAllDataToDirectory(handle, { recordings, photos, notes }),
                ]);
                alert("Connected to new folder and saved current data.");
            }
            await db.setDirectoryHandle(handle);
            setDirectoryHandle(handle);
            setSiteSettings(s => ({ ...s, syncMode: 'folder' }));

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            alert(`Could not connect to directory: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [siteSettings, templates, recordings, photos, notes]);

    const handleDisconnectDirectory = useCallback(async () => {
        if(window.confirm("Are you sure you want to disconnect? The app will switch back to using local browser storage.")) {
            await db.clearDirectoryHandle();
            setDirectoryHandle(null);
            setSiteSettings(s => ({ ...s, syncMode: 'local' }));
            const [dbRecordings, dbPhotos, dbNotes] = await Promise.all([
                db.getAllRecordings(),
                db.getAllPhotos(),
                db.getAllNotes(),
            ]);
            setRecordings(dbRecordings);
            setPhotos(dbPhotos);
            setNotes(dbNotes);
        }
    }, []);

    const handleClearLocalData = useCallback(async () => {
        if (window.confirm("WARNING: This will permanently delete all recordings, photos, and notes from your browser's local storage. This cannot be undone. Are you absolutely sure?")) {
            await db.clearAllData();
            setRecordings([]);
            setPhotos([]);
            setNotes([]);
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

                setSiteSettings({ ...data.siteSettings, customApiEndpoint: apiUrl, customApiAuthKey: apiKey, syncMode: 'api' });
                setTemplates(data.templates);
                setRecordings(newRecordings);
                setPhotos(newPhotos);
                setNotes(data.notes);
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
            setSiteSettings(s => ({ ...s, customApiEndpoint: null, customApiAuthKey: null, syncMode: 'local' }));
        }
    }, []);

    const onRestore = useCallback(async (file: File) => {
        if (typeof JSZip === 'undefined') {
            alert("Error: JSZip library is not loaded. Cannot process backup file.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Restoring backup...');
        try {
            const zip = await JSZip.loadAsync(file);
            const metadataFile = zip.file('metadata.json');
            if (!metadataFile) throw new Error('Invalid backup: metadata.json not found.');
            
            const metadata = JSON.parse(await metadataFile.async('string'));
            
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

            if (directoryHandle) await handleDisconnectDirectory();

            await db.clearAllData();
            await Promise.all([
                ...restoredRecordings.map(r => db.saveRecording(r)),
                ...restoredPhotos.map(p => db.savePhoto(p)),
                ...metadata.notes.map((n: Note) => db.saveNote(n)),
            ]);

            setSiteSettings(metadata.siteSettings);
            setTemplates(metadata.templates);
            setRecordings(restoredRecordings);
            setPhotos(restoredPhotos);
            setNotes(metadata.notes);

            alert("Backup restored successfully!");

        } catch (e) {
            console.error("Restore failed:", e);
            alert(`Failed to restore backup: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [directoryHandle, handleDisconnectDirectory]);

    if (!isInitialized) {
        return <FullScreenLoader message="Initializing App..." />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'generator':
                return (
                    <>
                        <Hero heroImageSrc={siteSettings.heroImageSrc} />
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
                            // FIX: Pass the handleDeletePhoto function to GeneratorView to resolve prop error in child component.
                            onDeletePhoto={handleDeletePhoto}
                            recordings={recordings}
                            notes={notes}
                        />
                    </>
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
                />;
            case 'image-tool':
                return <ImageTool />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen font-sans text-[var(--theme-text-primary)] flex flex-col">
            {/* --- Desktop Navigation --- */}
            <Header 
                siteSettings={siteSettings} 
                isApiConnected={isApiConnected}
                currentView={currentView}
                onNavigate={setCurrentView}
                onOpenDashboard={() => setIsDashboardOpen(true)}
                onOpenInfo={() => setIsInfoModalOpen(true)}
                onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)}
                showInstallButton={!isAppInstalled}
                onInstallClick={() => setIsInstallOptionsModalOpen(true)}
            />

            {/* --- Mobile Navigation --- */}
            <MobileHeader 
                siteSettings={siteSettings}
                onNavigate={setCurrentView}
                onOpenDashboard={() => setIsDashboardOpen(true)}
                onOpenInfo={() => setIsInfoModalOpen(true)}
                onOpenCreatorInfo={() => setIsCreatorInfoOpen(true)}
                showInstallButton={!isAppInstalled}
                onInstallClick={() => setIsInstallOptionsModalOpen(true)}
            />
            
            <main className="flex-1 pt-[76px] flex flex-col overflow-hidden">
                {renderView()}
            </main>
            
            <BottomNavBar
                 currentView={currentView} 
                 onNavigate={setCurrentView} 
            />

            {isLoading && !generatedOutput?.text && <FullScreenLoader message={loadingMessage} />}
            
            {isAuthModalOpen && <AuthModal 
                onClose={() => {
                    setIsAuthModalOpen(false);
                    // Also close dashboard if auth is cancelled to prevent re-opening modal
                    setIsDashboardOpen(false);
                }}
                onUnlock={() => {
                    setIsUnlocked(true);
                    setIsAuthModalOpen(false);
                }}
            />}
            {isDashboardOpen && isUnlocked && (
                <Dashboard 
                    onClose={() => setIsDashboardOpen(false)}
                    onLock={() => {
                        setIsUnlocked(false);
                        setIsDashboardOpen(false);
                    }}
                    templates={templates}
                    recordings={recordings}
                    photos={photos}
                    notes={notes}
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
                    onDownloadSource={handleDownloadSourceZip}
                />
            )}
            {isInfoModalOpen && <InfoModal onClose={() => setIsInfoModalOpen(false)} />}
            {isCreatorInfoOpen && <CreatorInfo creator={siteSettings.creator} onClose={() => setIsCreatorInfoOpen(false)} />}
            {isManualInstallModalOpen && <ManualInstallModal onClose={() => setIsManualInstallModalOpen(false)} />}
            {isInstallOptionsModalOpen && (
                <InstallOptionsModal 
                    onClose={() => setIsInstallOptionsModalOpen(false)}
                    onPwaInstall={handlePwaInstall}
                    onDownloadSource={handleDownloadSourceZip}
                    siteSettings={siteSettings}
                />
            )}
            {showUpdateToast && <UpdateToast onUpdate={() => window.location.reload()} />}
        </div>
    );
};

export default App;