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
import { DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE, SITE_SETTINGS, SiteSettings } from './constants';
import { db } from './services/db';
import { base64ToBlob } from './utils/dataUtils';
import { fileSystemService } from './services/fileSystemService';
import { FullScreenLoader } from './components/FullScreenLoader';

// Lazy-load heavy components that are not visible on initial render
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const RecordingManager = lazy(() => import('./components/RecordingManager').then(module => ({ default: module.RecordingManager })));
const ImageTool = lazy(() => import('./components/ImageTool').then(module => ({ default: module.ImageTool })));

export interface Template {
  id: string;
  name: string;
  prompt: string;
}

export interface QueuedItem extends ParsedProductData {
  id: string;
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
}

// For backup/restore functionality
export interface BackupData {
    templates: Template[];
    recordings: Omit<Recording, 'audioBlob'> & { audioBase64: string, audioMimeType: string };
}

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional');

  const [downloadQueue, setDownloadQueue] = useState<QueuedItem[]>([]);

  // Site settings are now a static constant, not state.
  const siteSettings = SITE_SETTINGS;

  const [isDashboardLocked, setIsDashboardLocked] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  // New state for recording manager
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecordingManagerOpen, setIsRecordingManagerOpen] = useState<boolean>(false);
  const [isImageToolOpen, setIsImageToolOpen] = useState<boolean>(false);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Effect to load data on mount
  useEffect(() => {
    const loadDataFromLocalStorage = async () => {
        try {
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

            // Also load recordings from IndexedDB when falling back to local
            const savedRecordings = await db.getAllRecordings();
            setRecordings(savedRecordings);
        } catch (e) {
            console.error("Failed to load data from localStorage:", e);
        }
    }

    const loadInitialData = async () => {
      const handle = await db.getDirectoryHandle();
      if (handle) {
        try {
          // Check if we still have permission. This will throw an error if the handle is stale (e.g., folder deleted/moved).
          if ((await (handle as any).queryPermission({ mode: 'readwrite' })) === 'granted') {
            console.log("Loading all data from connected directory...");
            setDirectoryHandle(handle);
            // Settings are static, no need to load them.
            const loadedTemplates = await fileSystemService.loadTemplates(handle);
            if (loadedTemplates) setTemplates(loadedTemplates);
            const { recordings: fileRecordings } = await fileSystemService.loadRecordingsFromDirectory(handle);
            setRecordings(fileRecordings);
          } else {
            // This case is unlikely as queryPermission would throw, but included for completeness.
            throw new Error("Permission to access the directory was not granted.");
          }
        } catch (e) {
          // This block catches stale handles or permission denials, indicating a "disconnect".
          console.warn("Could not connect to the synchronized folder:", e);
          const localDataExists = localStorage.getItem('productGenTemplates');
          if (localDataExists) {
            if (window.confirm("Connection to the synchronized folder was lost. Do you want to load the last locally saved version of your data? This will disconnect you from the folder.")) {
              await db.clearDirectoryHandle();
              setDirectoryHandle(null);
              await loadDataFromLocalStorage();
              alert("Loaded local data and disconnected from folder.");
            } else {
              // User chose not to load, they can try to reconnect later. We load defaults.
              await loadDataFromLocalStorage();
            }
          } else {
            // No handle and no local data, just load defaults.
            await loadDataFromLocalStorage();
          }
        }
      } else {
        // No handle stored, normal startup using local storage.
        await loadDataFromLocalStorage();
      }
    };
    
    loadInitialData();
  }, []); // Intentionally empty to run once on mount


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
      const result = await generateProductDescription(userInput, selectedTemplate.prompt, tone);
      setGeneratedOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, templates, selectedTemplateId, tone]);
  
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
        // This function restores to localStorage/IndexedDB, disconnecting any sync folder.
        if (directoryHandle) {
            if (!window.confirm("Restoring a backup will disconnect the synchronized local folder. Are you sure you want to continue?")) {
                return;
            }
            setDirectoryHandle(null);
            await db.clearDirectoryHandle();
        }

        // Settings are code-based and are not restored.

        // Restore Templates
        const newTemplates = data.templates as Template[];
        setTemplates(newTemplates);
        localStorage.setItem('productGenTemplates', JSON.stringify(newTemplates));
        if (newTemplates.length > 0) setSelectedTemplateId(newTemplates[0].id);

        // Restore Recordings
        await db.clearAllRecordings();
        const restoredRecordings: Recording[] = [];
        for (const rec of data.recordings) {
            const audioBlob = base64ToBlob(rec.audioBase64, rec.audioMimeType);
            const newRecording: Recording = { ...rec, audioBlob };
            delete (newRecording as any).audioBase64;
            delete (newRecording as any).audioMimeType;
            await db.saveRecording(newRecording);
            restoredRecordings.push(newRecording);
        }
        setRecordings(restoredRecordings);

        alert('Backup restored successfully! The connection to the local sync folder has been removed.');
        setIsDashboardOpen(false);
    } catch (err) {
        console.error("Failed to restore backup:", err);
        alert(`Error restoring backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [directoryHandle]);
  
   const handleClearLocalData = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete ALL locally stored templates and recordings? This action cannot be undone.")) {
        localStorage.removeItem('productGenTemplates');
        localStorage.removeItem('dashboardLocked');
        await db.clearAllRecordings();
        // Disconnect folder if connected, as we are clearing local state
        if (directoryHandle) {
             setDirectoryHandle(null);
             await db.clearDirectoryHandle();
        }
        alert("Local data cleared. The application will now reload.");
        window.location.reload();
    }
  }, [directoryHandle]);


  // Download Queue Handlers
  const handleAddToQueue = useCallback((item: ParsedProductData) => {
    setDownloadQueue(prev => [...prev, { ...item, id: crypto.randomUUID() }]);
  }, []);
  const handleRemoveFromQueue = useCallback((id: string) => {
    setDownloadQueue(prev => prev.filter(item => item.id !== id));
  }, []);
  const handleClearQueue = useCallback(() => setDownloadQueue([]), []);

  // Sync and Recording Handlers
  const handleSyncDirectory = useCallback(async () => {
    try {
        const handle = await fileSystemService.getDirectoryHandle();

        const localDataExists = localStorage.getItem('productGenTemplates');
        const folderDataExists = await fileSystemService.directoryHasData(handle);

        if (folderDataExists) {
             if (window.confirm("This folder contains existing data. Do you want to load it, overwriting your current app data?")) {
                // Load from folder
                 const loadedTemplates = await fileSystemService.loadTemplates(handle);
                 if (loadedTemplates) setTemplates(loadedTemplates);
             }
        } else if (localDataExists) {
            if (window.confirm("This folder appears to be empty. Would you like to save your current app data to this folder?")) {
                // Save current data to folder
                await fileSystemService.saveTemplates(handle, templates);
            }
        }

        const { recordings: fileRecordings } = await fileSystemService.loadRecordingsFromDirectory(handle);
        setRecordings(fileRecordings);
        
        // Clear local storage for user data if we are now syncing
        localStorage.removeItem('productGenTemplates');
        await db.clearAllRecordings();

        setDirectoryHandle(handle);
        await db.setDirectoryHandle(handle);
        alert(`Successfully connected to folder '${handle.name}'. All data will now be synced.`);

    } catch (error) {
      console.error("Failed to connect to directory:", error);
      alert(`Could not connect to directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [templates]);
  
  const handleDisconnectDirectory = useCallback(async () => {
    if (window.confirm("Are you sure you want to disconnect from the synchronized folder? The app will switch to using local browser storage, and you will need to reconnect to access your synced files again. Your data will remain safe in the folder.")) {
        setDirectoryHandle(null);
        await db.clearDirectoryHandle();
        alert("Disconnected from folder. The application will now reload and use local storage.");
        window.location.reload();
    }
  }, []);

  const handleTranscribe = useCallback(async (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (!recording || recording.transcript) return;

    setRecordings(prev => prev.map(r => r.id === id ? { ...r, isTranscribing: true } : r));

    try {
        const transcript = await transcribeAudio(recording.audioBlob);
        const updatedRecording = { ...recording, transcript, isTranscribing: false };
        await handleUpdateRecording(updatedRecording);
    } catch (error) {
        console.error('Transcription failed:', error);
        alert(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setRecordings(prev => prev.map(r => r.id === id ? { ...r, isTranscribing: false } : r));
    }
  }, [recordings]);

  const handleSaveRecording = useCallback(async (recording: Recording) => {
    const sortedRecordings = [...recordings, recording].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecordings(sortedRecordings);
    
    if (directoryHandle) {
        await fileSystemService.saveRecordingToDirectory(directoryHandle, recording);
    } else {
        await db.saveRecording(recording);
    }
    // Automatically transcribe new recordings
    handleTranscribe(recording.id);
  }, [recordings, directoryHandle, handleTranscribe]);

  const handleUpdateRecording = useCallback(async (updatedRecording: Recording) => {
    setRecordings(prev => prev.map(r => r.id === updatedRecording.id ? updatedRecording : r));
    if (directoryHandle) {
        await fileSystemService.saveRecordingToDirectory(directoryHandle, updatedRecording);
    } else {
        await db.saveRecording(updatedRecording);
    }
  }, [directoryHandle]);
  
  const handleDeleteRecording = useCallback(async (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    if (directoryHandle) {
        await fileSystemService.deleteRecordingFromDirectory(directoryHandle, id);
    } else {
        await db.deleteRecording(id);
    }
  }, [directoryHandle]);
  
  const openRecordingsManager = useCallback(() => setIsRecordingManagerOpen(true), []);
  const closeRecordingsManager = useCallback(() => setIsRecordingManagerOpen(false), []);
  const openImageTool = useCallback(() => setIsImageToolOpen(true), []);
  const closeImageTool = useCallback(() => setIsImageToolOpen(false), []);
  const closeDashboard = useCallback(() => setIsDashboardOpen(false), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Header 
        onSettingsClick={handleSettingsClick}
        onRecordingsClick={openRecordingsManager}
        onImageToolClick={openImageTool}
        siteSettings={siteSettings}
      />
      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        <Hero heroImageSrc={siteSettings.heroImageSrc} />
        <TemplateManager 
          templates={templates}
          onAddTemplate={handleAddTemplate} 
          onEditTemplate={handleEditTemplate}
        />
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
          <OutputPanel
            output={generatedOutput}
            isLoading={isLoading}
            error={error}
            onAddToQueue={handleAddToQueue}
            queue={downloadQueue}
          />
        </div>
      </main>
      {isAuthModalOpen && (
        <AuthModal 
          onClose={closeAuthModal}
          onUnlock={handleUnlock}
        />
      )}
      <Suspense fallback={<FullScreenLoader message="Loading Module..."/>}>
        {isDashboardOpen && (
          <Dashboard
            onClose={closeDashboard}
            onLock={handleLock}
            templates={templates}
            recordings={recordings}
            onRestore={handleRestoreBackup}
            directoryHandle={directoryHandle}
            onSyncDirectory={handleSyncDirectory}
            onDisconnectDirectory={handleDisconnectDirectory}
            onClearLocalData={handleClearLocalData}
          />
        )}
        {isRecordingManagerOpen && (
          <RecordingManager
            onClose={closeRecordingsManager}
            recordings={recordings}
            onSave={handleSaveRecording}
            onUpdate={handleUpdateRecording}
            onDelete={handleDeleteRecording}
            directoryHandle={directoryHandle}
            onTranscribe={handleTranscribe}
          />
        )}
        {isImageToolOpen && (
          <ImageTool 
              onClose={closeImageTool}
          />
        )}
      </Suspense>
      <CreatorInfo settings={siteSettings} />
      <DownloadManager
        queue={downloadQueue}
        onRemove={handleRemoveFromQueue}
        onClear={handleClearQueue}
      />
      <footer className="text-center py-4 text-slate-500 text-sm border-t border-[var(--theme-border)]">
        <p>Powered by Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;