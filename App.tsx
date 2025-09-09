

import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel, ParsedProductData, GenerationResult } from './components/OutputPanel';
import { TemplateManager } from './components/TemplateManager';
import { AuthModal } from './components/AuthModal';
import { CreatorInfo } from './components/CreatorInfo';
import { DownloadManager } from './components/DownloadManager';
import { Hero } from './components/Hero';
import { generateProductDescription, transcribeAudio } from './services/geminiService';
import { DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE, DEFAULT_SITE_SETTINGS, SiteSettings } from './constants';
import { db } from './services/db';
import { base64ToBlob, dataURLtoBlob } from './utils/dataUtils';
import { fileSystemService } from './services/fileSystemService';
import { FullScreenLoader } from './components/FullScreenLoader';

// Lazy-load heavy components that are not visible on initial render
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const RecordingManager = lazy(() => import('./components/RecordingManager').then(module => ({ default: module.RecordingManager })));
const ImageTool = lazy(() => import('./components/ImageTool').then(module => ({ default: module.ImageTool })));
const PhotoManager = lazy(() => import('./components/PhotoManager').then(module => ({ default: module.PhotoManager })));
const Notepad = lazy(() => import('./components/Notepad').then(module => ({ default: module.Notepad })));


export interface Template {
  id: string;
  name: string;
  prompt: string;
}

export interface QueuedItem extends ParsedProductData {
  id:string;
}

export interface Recording {
  id: string;
  name: string;
  date: string;
  notes: string;
  audioBlob: Blob;
  duration: number; // in seconds
  transcript?: string;
  isTranscribing?: boolean; // Client-side only
  tags?: string[];
  images?: { id: string; dataUrl: string; }[];
}

export interface Photo {
    id: string;
    name: string;
    notes: string;
    date: string;
    folder: string;
    imageBlob: Blob;
    imageMimeType: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}


// For backup/restore functionality
export interface BackupData {
    siteSettings?: SiteSettings;
    templates: Template[];
    recordings: Omit<Recording, 'audioBlob' | 'isTranscribing'> & { audioBase64: string, audioMimeType: string };
    photos: Omit<Photo, 'imageBlob'> & { imageBase64: string };
    notes: Note[];
}

const PermissionPrompt: React.FC<{ handle: FileSystemDirectoryHandle; onGrant: () => void; onDeny: () => void; }> = ({ handle, onGrant, onDeny }) => {
    const requestPermission = async () => {
        try {
            const permission = await (handle as any).requestPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
                onGrant();
            } else {
                alert("Permission was not granted. To disconnect from the folder, please click 'Use Local'.");
            }
        } catch (e) {
            console.error("Error requesting permission:", e);
            alert("Could not get permission to access the folder.");
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-[var(--theme-yellow)] text-[var(--theme-dark-bg)] p-3 text-sm z-[100] flex justify-center items-center shadow-lg text-center animate-fade-in-down">
            <div className="container mx-auto flex justify-between items-center px-4">
                <p>
                    <strong>Action Required:</strong> Reconnect to your local folder <strong className="font-mono bg-black/10 px-1 py-0.5 rounded">{handle.name}</strong> to continue syncing your data.
                </p>
                <div className='flex items-center gap-2'>
                    <button onClick={requestPermission} className="bg-black/20 hover:bg-black/40 font-bold py-1.5 px-4 rounded-md transition-colors">Grant Access</button>
                    <button onClick={onDeny} className="font-bold py-1.5 px-4 rounded-md hover:bg-black/20 transition-colors">Use Local Instead</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional');

  const [downloadQueue, setDownloadQueue] = useState<QueuedItem[]>([]);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [isDashboardLocked, setIsDashboardLocked] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  // New state for modules
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isRecordingManagerOpen, setIsRecordingManagerOpen] = useState<boolean>(false);
  const [isImageToolOpen, setIsImageToolOpen] = useState<boolean>(false);
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState<boolean>(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState<boolean>(false);
  
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isPermissionPromptVisible, setIsPermissionPromptVisible] = useState<boolean>(false);


  // Effect to load data on mount
  useEffect(() => {
    const loadDataFromLocalStorage = async () => {
        try {
            const savedSettings = localStorage.getItem('siteSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...parsedSettings });
            }

            const savedTemplates = localStorage.getItem('productGenTemplates');
            if (savedTemplates) {
                const parsedTemplates = JSON.parse(savedTemplates) as Template[];
                setTemplates(parsedTemplates);
                if (parsedTemplates.length > 0) setSelectedTemplateId(parsedTemplates[0].id);
            } else {
                const defaultTemplate: Template = { id: crypto.randomUUID(), name: 'Default E-commerce Template', prompt: DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE };
                setTemplates([defaultTemplate]);
                setSelectedTemplateId(defaultTemplate.id);
                localStorage.setItem('productGenTemplates', JSON.stringify([defaultTemplate]));
            }

            const savedLockState = localStorage.getItem('dashboardLocked');
            if (savedLockState) setIsDashboardLocked(JSON.parse(savedLockState));

            setRecordings(await db.getAllRecordings());
            setPhotos(await db.getAllPhotos());
            setNotes(await db.getAllNotes());

        } catch (e) {
            console.error("Failed to load data from localStorage:", e);
        }
    }

    const loadInitialData = async () => {
      const handle = await db.getDirectoryHandle();
      if (handle) {
        setDirectoryHandle(handle);
        const permissionStatus = await (handle as any).queryPermission({ mode: 'readwrite' });
        
        if (permissionStatus === 'granted') {
          console.log("Loading all data from connected directory...");
          try {
            const loadedSettings = await fileSystemService.loadSettings(handle);
             if (loadedSettings) setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...loadedSettings });

            setTemplates(await fileSystemService.loadTemplates(handle) || []);
            setRecordings((await fileSystemService.loadRecordingsFromDirectory(handle)).recordings);
            setPhotos(await fileSystemService.loadPhotosFromDirectory(handle));
            setNotes(await fileSystemService.loadNotesFromDirectory(handle));
          } catch (e) {
            console.error("Error loading data from granted directory:", e);
            alert("An error occurred while reading from your synchronized folder. The app will disconnect and load local data.");
            await db.clearDirectoryHandle();
            setDirectoryHandle(null);
            await loadDataFromLocalStorage();
          }
        } else {
          console.warn("Permission to access directory not granted. Prompting user.");
          setIsPermissionPromptVisible(true);
          await loadDataFromLocalStorage();
        }
      } else {
        await loadDataFromLocalStorage();
      }
    };
    
    loadInitialData();
  }, []);

  const handleGrantPermission = useCallback(async () => {
      setIsPermissionPromptVisible(false);
      if (directoryHandle) {
          console.log("Permission granted, reloading data from directory...");
          localStorage.clear();
          await db.clearAllData();

          const loadedSettings = await fileSystemService.loadSettings(directoryHandle);
          if (loadedSettings) setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...loadedSettings });
          setTemplates(await fileSystemService.loadTemplates(directoryHandle) || []);
          setRecordings((await fileSystemService.loadRecordingsFromDirectory(directoryHandle)).recordings);
          setPhotos(await fileSystemService.loadPhotosFromDirectory(directoryHandle));
          setNotes(await fileSystemService.loadNotesFromDirectory(directoryHandle));
          alert(`Successfully reconnected to folder '${directoryHandle.name}'.`);
      }
  }, [directoryHandle]);

  const handleDenyPermission = useCallback(async () => {
      if (window.confirm("This will disconnect you from the synchronized folder and the app will use local browser storage. Are you sure?")) {
        setIsPermissionPromptVisible(false);
        await db.clearDirectoryHandle();
        setDirectoryHandle(null);
        alert("Disconnected from folder. The app is now using local storage.");
      }
  }, []);

  const handleUpdateSettings = useCallback(async (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    if (directoryHandle) {
        await fileSystemService.saveSettings(directoryHandle, newSettings);
    } else {
        localStorage.setItem('siteSettings', JSON.stringify(newSettings));
    }
  }, [directoryHandle]);

  const handleAddTemplate = useCallback(async (name: string, prompt: string) => {
    const newTemplate: Template = { id: crypto.randomUUID(), name, prompt };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    setSelectedTemplateId(newTemplate.id);
    if (directoryHandle) {
        await fileSystemService.saveTemplates(directoryHandle, updatedTemplates);
    } else {
        localStorage.setItem('productGenTemplates', JSON.stringify(updatedTemplates));
    }
  }, [templates, directoryHandle]);
  
  const handleEditTemplate = useCallback(async (id: string, newName: string) => {
    const updatedTemplates = templates.map(t => 
      t.id === id ? { ...t, name: newName } : t
    );
    setTemplates(updatedTemplates);
     if (directoryHandle) {
        await fileSystemService.saveTemplates(directoryHandle, updatedTemplates);
    } else {
        localStorage.setItem('productGenTemplates', JSON.stringify(updatedTemplates));
    }
  }, [templates, directoryHandle]);

  const handleGenerate = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter some product information.');
      return;
    }
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      setError('Please select a valid template.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOutput(null);

    try {
      const result = await generateProductDescription(
        userInput, 
        selectedTemplate.prompt, 
        tone, 
        siteSettings.customApiEndpoint,
        siteSettings.customApiAuthKey
      );
      setGeneratedOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, templates, selectedTemplateId, tone, siteSettings]);
  
  const handleSettingsClick = useCallback(() => {
    if (isDashboardLocked) {
      setIsAuthModalOpen(true);
    } else {
      setIsDashboardOpen(true);
    }
  }, [isDashboardLocked]);

  const handleUnlock = useCallback(() => {
    setIsDashboardLocked(false);
    localStorage.setItem('dashboardLocked', JSON.stringify(false));
    setIsAuthModalOpen(false);
    setIsDashboardOpen(true);
  }, []);
  
  const handleLock = useCallback(() => {
    setIsDashboardLocked(true);
    localStorage.setItem('dashboardLocked', JSON.stringify(true));
    setIsDashboardOpen(false);
  }, []);
  
  const handleRestoreBackup = useCallback(async (data: any) => {
    try {
        if (directoryHandle) {
            if (!window.confirm("Restoring a backup will disconnect the synchronized local folder. Are you sure you want to continue?")) {
                return;
            }
            setDirectoryHandle(null);
            await db.clearDirectoryHandle();
        }
        
        await db.clearAllData();
        localStorage.clear();

        if (data.siteSettings) {
            setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...data.siteSettings });
            localStorage.setItem('siteSettings', JSON.stringify(data.siteSettings));
        }

        const newTemplates = data.templates as Template[];
        setTemplates(newTemplates);
        localStorage.setItem('productGenTemplates', JSON.stringify(newTemplates));
        if (newTemplates.length > 0) setSelectedTemplateId(newTemplates[0].id);

        const restoredRecordings: Recording[] = [];
        for (const rec of (data.recordings || [])) {
            const audioBlob = base64ToBlob(rec.audioBase64, rec.audioMimeType);
            const newRecording: Recording = { ...rec, audioBlob };
            delete (newRecording as any).audioBase64;
            delete (newRecording as any).audioMimeType;
            await db.saveRecording(newRecording);
            restoredRecordings.push(newRecording);
        }
        setRecordings(restoredRecordings);

        const restoredPhotos: Photo[] = [];
        for (const photo of (data.photos || [])) {
            const imageBlob = base64ToBlob(photo.imageBase64, photo.imageMimeType);
            const newPhoto: Photo = { ...photo, imageBlob };
            delete (newPhoto as any).imageBase64;
            await db.savePhoto(newPhoto);
            restoredPhotos.push(newPhoto);
        }
        setPhotos(restoredPhotos);

        const restoredNotes: Note[] = data.notes || [];
        for (const note of restoredNotes) {
            await db.saveNote(note);
        }
        setNotes(restoredNotes);

        alert('Backup restored successfully! The connection to the local sync folder has been removed.');
        setIsDashboardOpen(false);
    } catch (err) {
        console.error("Failed to restore backup:", err);
        alert(`Error restoring backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [directoryHandle]);
  
   const handleClearLocalData = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete ALL locally stored data? This action cannot be undone.")) {
        localStorage.clear();
        await db.clearAllData();
        if (directoryHandle) {
             setDirectoryHandle(null);
             await db.clearDirectoryHandle();
        }
        alert("Local data cleared. The application will now reload.");
        window.location.reload();
    }
  }, [directoryHandle]);


  // Download Queue Handlers
  const handleAddToQueue = useCallback((item: ParsedProductData) => setDownloadQueue(prev => [...prev, { ...item, id: crypto.randomUUID() }]), []);
  const handleRemoveFromQueue = useCallback((id: string) => setDownloadQueue(prev => prev.filter(item => item.id !== id)), []);
  const handleClearQueue = useCallback(() => setDownloadQueue([]), []);

  // Sync and Data Handlers
  const handleSyncDirectory = useCallback(async () => {
    try {
        const handle = await fileSystemService.getDirectoryHandle();
        const folderDataExists = await fileSystemService.directoryHasData(handle);

        if (folderDataExists) {
             if (window.confirm("This folder contains existing data. Do you want to load it, overwriting your current app data?")) {
                localStorage.clear();
                await db.clearAllData();
             }
        } else {
            if (window.confirm("This folder appears to be empty. Would you like to save your current app data to this folder?")) {
                await fileSystemService.saveSettings(handle, siteSettings);
                await fileSystemService.saveTemplates(handle, templates);
                await fileSystemService.saveAllDataToDirectory(handle, { recordings, photos, notes });
            }
        }
        
        localStorage.clear();
        await db.clearAllData();
        setDirectoryHandle(handle);
        await db.setDirectoryHandle(handle);
        alert(`Successfully connected to folder '${handle.name}'. The app will now reload to sync.`);
        window.location.reload();

    } catch (error) {
      console.error("Failed to connect to directory:", error);
      alert(`Could not connect to directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [templates, siteSettings, recordings, photos, notes]);
  
  const handleDisconnectDirectory = useCallback(async () => {
    if (window.confirm("Are you sure you want to disconnect? The app will switch to using local browser storage.")) {
        setDirectoryHandle(null);
        await db.clearDirectoryHandle();
        alert("Disconnected from folder. The application will now reload and use local storage.");
        window.location.reload();
    }
  }, []);
  
  const handleUpdateRecording = useCallback(async (updated: Recording) => {
    setRecordings(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (directoryHandle) await fileSystemService.saveRecordingToDirectory(directoryHandle, updated);
    else await db.saveRecording(updated);
  }, [directoryHandle]);

  const handleTranscribe = useCallback(async (id: string) => {
    const rec = recordings.find(r => r.id === id);
    if (!rec || rec.transcript) return;

    setRecordings(prev => prev.map(r => r.id === id ? { ...r, isTranscribing: true } : r));
    try {
        const transcript = await transcribeAudio(rec.audioBlob, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey);
        await handleUpdateRecording({ ...rec, transcript, isTranscribing: false });
    } catch (error) {
        console.error('Transcription failed:', error);
        alert(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setRecordings(prev => prev.map(r => r.id === id ? { ...r, isTranscribing: false } : r));
    }
  }, [recordings, siteSettings, handleUpdateRecording]);

  const handleSaveRecording = useCallback(async (rec: Recording) => {
    setRecordings(prev => [...prev, rec].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    if (directoryHandle) await fileSystemService.saveRecordingToDirectory(directoryHandle, rec);
    else await db.saveRecording(rec);
    handleTranscribe(rec.id);
  }, [recordings, directoryHandle, handleTranscribe]);
  
  const handleDeleteRecording = useCallback(async (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    if (directoryHandle) await fileSystemService.deleteRecordingFromDirectory(directoryHandle, id);
    else await db.deleteRecording(id);
  }, [directoryHandle]);

  const handleSavePhoto = useCallback(async (photo: Photo) => {
    setPhotos(prev => {
        const existing = prev.find(p => p.id === photo.id);
        if (existing) return prev.map(p => p.id === photo.id ? photo : p);
        return [photo, ...prev].sort((a,b) => b.date.localeCompare(a.date));
    });
    if (directoryHandle) await fileSystemService.savePhotoToDirectory(directoryHandle, photo);
    else await db.savePhoto(photo);
  }, [directoryHandle]);

  const handleDeletePhoto = useCallback(async (photo: Photo) => {
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    if (directoryHandle) await fileSystemService.deletePhotoFromDirectory(directoryHandle, photo);
    else await db.deletePhoto(photo.id);
  }, [directoryHandle]);

  const handleSaveNote = useCallback(async (note: Note) => {
    setNotes(prev => {
        const existing = prev.find(n => n.id === note.id);
        if(existing) return prev.map(n => n.id === note.id ? note : n);
        return [note, ...prev].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
    });
    if (directoryHandle) await fileSystemService.saveNoteToDirectory(directoryHandle, note);
    else await db.saveNote(note);
  }, [directoryHandle]);

  const handleDeleteNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (directoryHandle) await fileSystemService.deleteNoteFromDirectory(directoryHandle, id);
    else await db.deleteNote(id);
  }, [directoryHandle]);

  return (
    <div className="min-h-screen font-sans flex flex-col">
      {isPermissionPromptVisible && directoryHandle && (
        <PermissionPrompt handle={directoryHandle} onGrant={handleGrantPermission} onDeny={handleDenyPermission} />
      )}
      <Header 
        onSettingsClick={handleSettingsClick}
        onRecordingsClick={() => setIsRecordingManagerOpen(true)}
        onImageToolClick={() => setIsImageToolOpen(true)}
        onPhotoManagerClick={() => setIsPhotoManagerOpen(true)}
        onNotepadClick={() => setIsNotepadOpen(true)}
        siteSettings={siteSettings}
      />
      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        <Hero heroImageSrc={siteSettings.heroImageSrc} />
        <TemplateManager templates={templates} onAddTemplate={handleAddTemplate} onEditTemplate={handleEditTemplate} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
          <InputPanel
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onTemplateChange={(e) => setSelectedTemplateId(e.target.value)}
            tone={tone}
            onToneChange={(e) => setTone(e.target.value)}
          />
          <OutputPanel output={generatedOutput} isLoading={isLoading} error={error} onAddToQueue={handleAddToQueue} queue={downloadQueue} />
        </div>
      </main>
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onUnlock={handleUnlock} />}
      <Suspense fallback={<FullScreenLoader message="Loading Module..."/>}>
        {isDashboardOpen && (
          <Dashboard
            onClose={() => setIsDashboardOpen(false)}
            onLock={handleLock}
            templates={templates}
            recordings={recordings}
            photos={photos}
            notes={notes}
            siteSettings={siteSettings}
            onUpdateSettings={handleUpdateSettings}
            onRestore={handleRestoreBackup}
            directoryHandle={directoryHandle}
            onSyncDirectory={handleSyncDirectory}
            onDisconnectDirectory={handleDisconnectDirectory}
            onClearLocalData={handleClearLocalData}
          />
        )}
        {isRecordingManagerOpen && (
          <RecordingManager onClose={() => setIsRecordingManagerOpen(false)} recordings={recordings} onSave={handleSaveRecording} onUpdate={handleUpdateRecording} onDelete={handleDeleteRecording} onTranscribe={handleTranscribe} directoryHandle={directoryHandle} />
        )}
        {isImageToolOpen && <ImageTool onClose={() => setIsImageToolOpen(false)} />}
        {isPhotoManagerOpen && <PhotoManager onClose={() => setIsPhotoManagerOpen(false)} photos={photos} onSave={handleSavePhoto} onDelete={handleDeletePhoto} />}
        {isNotepadOpen && <Notepad onClose={() => setIsNotepadOpen(false)} notes={notes} onSave={handleSaveNote} onDelete={handleDeleteNote} />}
      </Suspense>
      <CreatorInfo settings={siteSettings} />
      <DownloadManager queue={downloadQueue} onRemove={handleRemoveFromQueue} onClear={handleClearQueue} />
      <footer className="text-center py-4 text-[var(--theme-text-secondary)] text-sm border-t border-[var(--theme-border)]/50">
        <p>Powered by Google Gemini API</p>
        <p className="mt-1">© 2025 JSTYP.me — All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
