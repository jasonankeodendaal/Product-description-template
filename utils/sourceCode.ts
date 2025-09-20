export const projectFiles: Record<string, string> = {
    "index.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Declare globals for TypeScript since they are loaded from a CDN
declare var JSZip: any;
declare var WaveSurfer: any;

// Register the Service Worker to enable PWA offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Listen for updates to the service worker.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available and will be used when all tabs for this scope are closed.');
              // We can notify the user here. The \\\`controllerchange\\\` event will fire when the new worker takes over.
            }
          });
        }
      });
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });

    // Listen for when the new service worker has taken control.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New Service Worker activated. Ready for reload.');
      // Dispatch a custom event that the React app can listen to.
      window.dispatchEvent(new CustomEvent('sw-updated'));
    });
  });
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    "metadata.json": `{
  "name": "Product Description TEMPLATE",
  "description": "An AI-powered application to automatically generate structured and professional product descriptions based on raw product information, following a specific template.",
  "requestFramePermissions": [
    "microphone",
    "camera"
  ]
}`,
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <base href="/" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ai tools | AI Product Description Generator</title>
  <link rel="icon" href="https://i.postimg.cc/YCF8xX3R/image-removebg-preview-1.png" type="image/png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#1F2937">
  <link rel="apple-touch-icon" href="https://i.postimg.cc/YCF8xX3R/image-removebg-preview-1.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://unpkg.com/wavesurfer.js@7"></script>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">


  <style>
    :root {
      /* New Dark & Green Theme */
      --theme-bg: rgba(17, 24, 39, 0.8); /* Dark Slate Blue-Grey w/ transparency */
      --theme-card-bg: rgba(31, 41, 55, 0.85); /* Lighter Slate w/ transparency */
      --theme-dark-bg: #000000; /* Pure Black */
      --theme-border: #4B5563; /* Medium Grey */
      --theme-green: #34D399; /* Candy Apple Green (Emerald) */
      --theme-red: #F87171; /* Softer Red */
      --theme-text-primary: #F9FAFB; /* Off-white */
      --theme-text-secondary: #9CA3AF; /* Light Grey */
      
      /* Recorder Light Theme (Updated with Green Accent) */
      --theme-bg-light: #F9FAFB;
      --theme-card-bg-light: #FFFFFF;
      --theme-text-primary-light: #1F2937;
      --theme-text-secondary-light: #6B7280;
      --theme-border-light: #E5E7EB;
      --theme-green-light: #10B981; /* Darker Green for contrast on light BG */
      --theme-red-light: #EF4444;
      --theme-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

      /* Deprecated */
      --theme-blue: #3A6187;
      --theme-yellow: #D49E3C;
    }
    body {
      background-color: var(--theme-dark-bg);
      color: var(--theme-text-primary);
      font-family: 'Nunito', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      position: relative;
      overflow-x: hidden;
    }

    body::before,
    body::after {
        content: '';
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
    }

    /* Layer 1: The main image with a slow zoom (Ken Burns effect) */
    body::before {
        background-image: url('https://i.postimg.cc/Fd7t0xX1/bb343bbc-19bb-4fbd-a9d4-2df5d7292898.jpg');
        background-size: cover;
        background-position: center;
        animation: ken-burns 45s ease-in-out infinite;
    }

    /* Layer 2: A subtle, moving grid overlay and vignette */
    body::after {
        background-image: 
            linear-gradient(to right, rgba(52, 211, 153, 0.08) 1px, transparent 1px), /* Vertical lines */
            linear-gradient(to bottom, rgba(52, 211, 153, 0.08) 1px, transparent 1px), /* Horizontal lines */
            radial-gradient(ellipse at center, rgba(17, 24, 39, 0.1) 40%, rgba(17, 24, 39, 1) 100%); /* Vignette */
        background-size: 40px 40px, 40px 40px, 100% 100%;
        animation: move-grid 25s linear infinite;
    }
    
    .font-lora {
      font-family: 'Lora', serif;
    }
    .font-patrick-hand {
      font-family: 'Patrick Hand', cursive;
    }

    /* Custom scrollbar for webkit browsers */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }


    /* Notepad checklist styles */
    .note-editor-content ul[data-type="checklist"],
    ul[data-type="checklist"] {
      list-style-type: none;
      padding-left: 0;
      margin: 1rem 0;
    }
    .note-editor-content ul[data-type="checklist"] > li,
    ul[data-type="checklist"] > li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.25rem 0;
      cursor: grab;
    }
    .note-editor-content ul[data-type="checklist"] > li::before,
    ul[data-type="checklist"] > li::before {
      content: '';
      display: inline-block;
      width: 1.25em;
      height: 1.25em;
      border: 2px solid var(--theme-border);
      border-radius: 50%;
      cursor: pointer;
      flex-shrink: 0;
      background-color: transparent;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .note-editor-content ul[data-type="checklist"] > li[data-checked="true"]::before,
    ul[data-type="checklist"] > li[data-checked="true"]::before {
      background-color: var(--theme-green);
      border-color: var(--theme-green);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
      background-size: 80%;
      background-position: center;
      background-repeat: no-repeat;
    }
     .note-editor-content ul[data-type="checklist"] > li[data-checked="true"],
     ul[data-type="checklist"] li[data-checked="true"] {
      text-decoration: line-through;
      color: var(--theme-text-secondary);
    }
    
    .note-editor-content > *:first-child { margin-top: 0; }
    .note-editor-content > *:last-child { margin-bottom: 0; }
    .note-editor-content:focus { outline: none; }

    /* Drag & Drop for Notepad Checklist */
    .note-editor-content ul[data-type="checklist"] > li.dragging {
      opacity: 0.4;
      background-color: var(--theme-bg);
      border-radius: 4px;
    }
    .drop-indicator {
      height: 2px;
      background-color: var(--theme-green);
      margin: 4px 0;
      animation: hologram-pulse 1.5s infinite;
    }
    li.drop-indicator-li {
      list-style-type: none !important;
      padding: 0 !important;
      cursor: default !important;
      /* Override the default li styles */
      display: block !important;
      gap: 0 !important;
    }
    li.drop-indicator-li::before {
      display: none !important;
    }

    /* Logo Glow Effect */
    .logo-glow-effect {
      /* A subtle white "fog" and a stronger green "glow" */
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.1)) 
              drop-shadow(0 0 8px var(--theme-green));
      transition: filter 0.3s ease-in-out;
    }
    .logo-glow-effect:hover {
        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2)) 
                drop-shadow(0 0 12px var(--theme-green));
    }


    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes typing-arm {
      0%, 20%, 100% { transform: rotate(-5deg) translateY(2px); }
      10% { transform: rotate(0deg) translateY(0); }
    }
    @keyframes typing-finger {
      0%, 20%, 100% { transform: translateY(0); }
      10% { transform: translateY(2px); }
    }
    @keyframes hologram-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
    }
    @keyframes text-appear {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-modal-scale-in {
        animation: modal-scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes modal-scale-in {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .animate-flex-modal-scale-in {
        animation: flex-modal-scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes flex-modal-scale-in {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .animate-fade-in-down {
        animation: fade-in-down 0.2s ease-out forwards;
    }
    @keyframes fade-in-down {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slow-zoom {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes ken-burns {
        0%, 100% {
            transform: scale(1) translate(0, 0);
            filter: brightness(0.8);
        }
        50% {
            transform: scale(1.1) translate(-2%, 2%);
            filter: brightness(1.0);
        }
    }
    @keyframes move-grid {
        from {
            background-position: 0 0, 0 0, center;
        }
        to {
            background-position: -40px -40px, 0 0, center;
        }
    }
    
    /* New animations for responsive creator modal */
    @keyframes slide-in-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes slide-out-down {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
    @keyframes flex-modal-scale-out {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.9); opacity: 0; }
    }

    .creator-modal-animate-in {
        animation: slide-in-up 0.3s ease-out forwards;
    }
    .creator-modal-animate-out {
        animation: slide-out-down 0.3s ease-in forwards;
    }
    
    .fab-shadow {
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.05) inset;
    }

    /* md breakpoint: 768px */
    @media (min-width: 768px) {
        .creator-modal-animate-in {
            animation-name: flex-modal-scale-in;
            animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .creator-modal-animate-out {
            animation-name: flex-modal-scale-out;
            animation-timing-function: ease-in;
        }
    }
  </style>
<script type="importmap">
{
  "imports": {
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.20.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/",
    "react/": "https://aistudiocdn.com/react@^19.1.1/",
    "react": "https://aistudiocdn.com/react@^19.1.1",
    "@vercel/node": "https://aistudiocdn.com/@vercel/node@^5.3.22"
  }
}
</script>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>`,
    "App.tsx": `import React, { useState, useEffect, useCallback } from 'react';
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
        
        console.log(\`User response to the install prompt: \${outcome}\`);
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
            link.download = \`AiTools_SourceCode_\${new Date().toISOString().split('T')[0]}.zip\`;
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
            alert(\`Failed to save to folder: \${e instanceof Error ? e.message : String(e)}\`);
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
            alert(\`Error syncing from directory: \${e instanceof Error ? e.message : 'Unknown error'}\`);
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
            alert(\`Could not connect to directory: \${err instanceof Error ? err.message : String(err)}\`);
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
            if (!silent) alert(\`Failed to connect to API: \${e instanceof Error ? e.message : String(e)}\`);
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
                        const audioFile = zip.file(\`assets/recordings/\${recMetadata.id}.webm\`);
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
                            const imageFile = zip.file(\`assets/photos/\${photoMetadata.folder}/\${photoMetadata.id}.\${ext}\`);
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
            alert(\`Failed to restore backup: \${e instanceof Error ? e.message : 'Unknown error'}\`);
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

export default App;`,
    "components/Dashboard.tsx": `import React, { useState } from 'react';
import { Template, Recording, Photo, Note } from '../App';
import { XIcon } from './icons/XIcon';
import { DataManagement } from './DataManagement';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { createBackup } from '../utils/dataUtils';
import { SiteSettings } from '../constants';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CodeIcon } from './icons/CodeIcon';
import { NavButton } from './NavButton';
import { AboutThisApp } from './AboutThisApp';
import { SetupGuide } from './SetupGuide';
import { AndroidIcon } from './icons/AndroidIcon';
import { AppPublishingGuide } from './AppPublishingGuide';

interface DashboardProps {
  onClose: () => void;
  onLock: () => void;
  templates: Template[];
  recordings: Recording[];
  photos: Photo[];
  notes: Note[];
  siteSettings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onRestore: (data: File) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSyncDirectory: () => void;
  onDisconnectDirectory: () => void;
  onClearLocalData: () => void;
  onApiConnect: (apiUrl: string, apiKey: string) => Promise<void>;
  onApiDisconnect: () => void;
  isApiConnecting: boolean;
  isApiConnected: boolean;
  onDownloadSource: () => void;
}

type Section = 'data' | 'settings' | 'setup' | 'about' | 'publishing';

export const Dashboard: React.FC<DashboardProps> = ({ 
  onClose, 
  onLock,
  templates,
  recordings,
  photos,
  notes,
  siteSettings,
  onUpdateSettings,
  onRestore,
  directoryHandle,
  onSyncDirectory,
  onDisconnectDirectory,
  onClearLocalData,
  onApiConnect,
  onApiDisconnect,
  isApiConnecting,
  isApiConnected,
  onDownloadSource,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('about');

  const handleBackup = async () => {
    try {
        await createBackup(siteSettings, templates, recordings, photos, notes);
    } catch (err) {
        alert(\`Error creating backup: \${err instanceof Error ? err.message : String(err)}\`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text-primary)]">Dashboard</h2>
            <p className="text-[var(--theme-text-secondary)] mt-1 text-sm">Manage your application's data, settings, and local folder connection.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLock} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 transition-opacity">Lock Dashboard</button>
            <button onClick={onClose} className="text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            <aside className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-[var(--theme-border)] flex-shrink-0">
                <nav className="space-y-2">
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                    <NavButton active={activeSection === 'data'} onClick={() => setActiveSection('data')} icon={<DatabaseIcon />}>Data Management</NavButton>
                    <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} icon={<SettingsIcon />}>Site & Creator Settings</NavButton>
                    <NavButton active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} icon={<CodeIcon />}>Setup Guide</NavButton>
                    <NavButton active={activeSection === 'publishing'} onClick={() => setActiveSection('publishing')} icon={<AndroidIcon />}>App Publishing (APK)</NavButton>
                </nav>
            </aside>

            <main className="flex-grow md:overflow-y-auto p-4 bg-[var(--theme-bg)]/30">
                {activeSection === 'data' && (
                    <DataManagement 
                        templates={templates}
                        recordings={recordings}
                        photos={photos}
                        notes={notes}
                        onBackup={handleBackup}
                        onRestore={onRestore}
                        directoryHandle={directoryHandle}
                        onSyncDirectory={onSyncDirectory}
                        onDisconnectDirectory={onDisconnectDirectory}
                        onClearLocalData={onClearLocalData}
                        siteSettings={siteSettings}
                        onUpdateSettings={onUpdateSettings}
                        onApiConnect={onApiConnect}
                        onApiDisconnect={onApiDisconnect}
                        isApiConnecting={isApiConnecting}
                        isApiConnected={isApiConnected}
                    />
                )}
                {activeSection === 'settings' && (
                    <SiteSettingsEditor 
                        settings={siteSettings}
                        onSave={onUpdateSettings}
                    />
                )}
                {activeSection === 'setup' && <SetupGuide />}
                {activeSection === 'about' && <AboutThisApp onNavigateToSetup={() => setActiveSection('setup')} />}
                {activeSection === 'publishing' && <AppPublishingGuide onDownloadSource={onDownloadSource} />}
            </main>
        </div>
      </div>
    </div>
  );
};`,
    "components/icons/AndroidIcon.tsx": `import React from 'react';

export const AndroidIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M17 18c-2 0-2-2-4-2s-2 2-4 2" />
        <line x1="8" y1="14" x2="8" y2="14" />
        <line x1="16" y1="14" x2="16" y2="14" />
        <path d="M17.5 10.5c0 .5-.5 1-1 1s-1-.5-1-1 .5-1 1-1 1 .5 1 1z" fill="currentColor" />
        <path d="M7.5 10.5c0 .5-.5 1-1 1s-1-.5-1-1 .5-1 1-1 1 .5 1 1z" fill="currentColor" />
        <path d="M14 5L12 3 10 5" />
        <path d="M19 8a7 7 0 0 0-14 0" />
        <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    </svg>
);`,
    "components/AppPublishingGuide.tsx": `import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-black/50 p-3 rounded-md text-sm text-[var(--theme-text-primary)] font-mono overflow-x-auto whitespace-pre-wrap">
        <code>{children}</code>
    </pre>
);

const Step: React.FC<{ num: string; title: string; children: React.ReactNode; }> = ({ num, title, children }) => (
    <div className="pt-4">
        <h4 className="text-md font-semibold text-[var(--theme-text-primary)] mb-2">Step {num}: {title}</h4>
        <div className="pl-4 border-l-2 border-[var(--theme-border)]/50 space-y-3 text-[var(--theme-text-secondary)] text-sm">
            {children}
        </div>
    </div>
);

interface AppPublishingGuideProps {
    onDownloadSource: () => void;
}

export const AppPublishingGuide: React.FC<AppPublishingGuideProps> = ({ onDownloadSource }) => {
    return (
        <div className="space-y-10 text-sm leading-relaxed animate-fade-in-down max-w-4xl">
            <section>
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Publishing Your App to Android</h2>
                <p className="mt-2 text-[var(--theme-text-secondary)]">
                    This guide provides a complete walkthrough for packaging your Progressive Web App (PWA) into an Android APK file. This file can be installed directly on Android devices or submitted to the Google Play Store. We will use free, industry-standard tools for this process.
                </p>
            </section>

            <div className="p-4 bg-[var(--theme-green)]/10 rounded-lg border border-[var(--theme-green)]/30">
                <h4 className="font-semibold text-[var(--theme-green)]">The Big Picture</h4>
                 <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">
                    A web app can't magically become an APK on its own. The process involves two main stages:
                 </p>
                 <ol className="list-decimal list-inside mt-2 text-sm text-[var(--theme-text-secondary)] space-y-1">
                    <li><strong className="text-white">Hosting:</strong> First, we need to put your app's code on the public internet so it has a live URL (e.g., \\\`https://my-awesome-app.com\\\`).</li>
                    <li><strong className="text-white">Packaging:</strong> Then, we'll use a free online tool called PWABuilder to wrap your live web app in a native Android "shell," creating an Android Studio project.</li>
                    <li><strong className="text-white">Building:</strong> Finally, you'll open this project in Android Studio (the official tool for Android development) to build the final APK file.</li>
                </ol>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 1: Deploying Your Web App</h3>
                 <div className="space-y-6">
                    <Step num="1" title="Download Your App's Source Code">
                        <p>The first step is to get a complete copy of the application's code. Click the button below to download a \`.zip\` file containing everything you need.</p>
                        <button onClick={onDownloadSource} className="bg-[var(--theme-green)] hover:opacity-90 text-black font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2">
                            <DownloadIcon /> Download Source Code (.zip)
                        </button>
                    </Step>
                    
                    <Step num="2" title="Choose a Hosting Provider">
                        <p>You need to host this code on a platform that makes it available online. We recommend <strong className="text-white">Vercel</strong> because it's free, incredibly easy to use, and hosts the AI functions for this app.</p>
                        <p>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-green)] hover:underline">vercel.com</a> and sign up for a free account. Connecting with GitHub is the easiest option.</p>
                    </Step>

                    <Step num="3" title="Deploy on Vercel">
                        <p>1. Unzip the source code you downloaded in Step 1.</p>
                        <p>2. On your Vercel dashboard, click "Add New... &gt; Project".</p>
                        <p>3. Vercel will prompt you to connect a Git repository. Instead, look for the option to <strong className="text-white">"Deploy a Project from Your Computer"</strong> and drag your unzipped folder into the browser window.</p>
                        <p>4. Vercel will detect it's a web app. You don't need to change any build settings. Just click <strong className="text-white">"Deploy"</strong>.</p>
                        <p>5. You'll need to add your API keys as Environment Variables in Vercel. Go to your new project's settings, find "Environment Variables", and add your \`API_KEY\` and \`API_SECRET_KEY\` just like you did in your local \`.env\` file.</p>
                    </Step>
                     <Step num="4" title="Get Your Public URL">
                        <p>Once deployed, Vercel will give you a public URL, like <code className="bg-black/30 px-1 py-0.5 rounded text-xs">https://your-project-name.vercel.app</code>. Congratulations, your app is live! Copy this URL for the next part.</p>
                    </Step>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 2: Packaging for Android with PWABuilder</h3>
                <div className="space-y-6">
                    <Step num="1" title="Go to PWABuilder">
                        <p>PWABuilder is a free tool from Microsoft that helps package PWAs for app stores. Open <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-green)] hover:underline">www.pwabuilder.com</a> in your browser.</p>
                    </Step>
                    <Step num="2" title="Enter Your URL">
                        <p>Paste the public URL you got from Vercel into the input box and click <strong className="text-white">"Start"</strong>.</p>
                    </Step>
                    <Step num="3" title="Package for Android">
                        <p>PWABuilder will analyze your app. Once it's done, look for the "Package for Stores" section and click the <strong className="text-white">"Generate"</strong> button under the Android logo.</p>
                         <p>You can customize app details like the package ID if you wish, but the defaults are fine to start. Click <strong className="text-white">"Download"</strong> to get a \`.zip\` file of your Android Studio project.</p>
                    </Step>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 3: Building the APK in Android Studio</h3>
                 <div className="space-y-6">
                     <Step num="1" title="Install Android Studio">
                        <p>If you don't have it, download and install Android Studio from the <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-green)] hover:underline">official Android developer website</a>. This is a large application, so the download and installation may take some time.</p>
                    </Step>
                     <Step num="2" title="Open the Project">
                        <p>1. Unzip the file you downloaded from PWABuilder.</p>
                        <p>2. Open Android Studio.</p>
                        <p>3. Click <strong className="text-white">"Open"</strong> (do not choose "Import Project").</p>
                        <p>4. Navigate to and select the unzipped folder. Android Studio will then load and sync the project. This can take several minutes the first time.</p>
                    </Step>
                     <Step num="3" title="Build the APK">
                        <p>Once the project is loaded and all processes have finished (check the bottom status bar), go to the top menu and select:</p>
                        <p><strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong></p>
                        <p>Android Studio will start building your app. When it's finished, a notification will appear in the bottom-right corner.</p>
                    </Step>
                     <Step num="4" title="Locate Your APK File">
                        <p>In the notification, click the <strong className="text-white">"locate"</strong> link. This will open your computer's file explorer directly to the folder containing your APK.</p>
                        <p>The file is usually named <code className="bg-black/30 px-1 py-0.5 rounded text-xs">app-debug.apk</code>. You can now copy this file to an Android device and install it!</p>
                    </Step>
                </div>
            </div>
        </div>
    );
};`,
    "components/icons/ZipIcon.tsx": `import React from 'react';

export const ZipIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="zip-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6B7280" />
                <stop offset="100%" stopColor="#4B5563" />
            </linearGradient>
            <linearGradient id="zip-grad-tag" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9FAFB" />
                <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
            <filter id="zip-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
            </filter>
        </defs>
        <g filter="url(#zip-shadow)">
            <path d="M20 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l5 5z" fill="url(#zip-grad-bg)" />
            <path d="M13 2v5h5" fill="#9CA3AF" />
            <rect x="8" y="11" width="8" height="6" rx="1" fill="url(#zip-grad-tag)" />
            <path d="M12 11v-1h-1v1h-1v1h1v1h1v-1h1v1h1v-1h-1z" fill="#4B5563" />
        </g>
    </svg>
);`,
"components/InstallOptionsModal.tsx": `import React from 'react';
import { XIcon } from './icons/XIcon';
import { PwaIcon } from './icons/PwaIcon';
import { SiteSettings } from '../constants';
import { ZipIcon } from './icons/ZipIcon';

interface InstallOptionsModalProps {
    onClose: () => void;
    onPwaInstall: () => void;
    onDownloadSource: () => void;
    siteSettings: SiteSettings;
}

const InstallOption: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 bg-[var(--theme-bg)]/50 hover:bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-border)]/50 flex items-start gap-4 transition-colors"
    >
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">{icon}</div>
        <div>
            <h4 className="font-semibold text-base text-[var(--theme-text-primary)]">{title}</h4>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">{description}</p>
        </div>
    </button>
);

export const InstallOptionsModal: React.FC<InstallOptionsModalProps> = ({ onClose, onPwaInstall, onDownloadSource, siteSettings }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-lg shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in">
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">Install App</h2>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Choose your preferred installation method.</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
                        <XIcon />
                    </button>
                </header>
                <div className="p-6 space-y-4">
                    <InstallOption
                        title="Install Web App (Recommended)"
                        description="Fast, lightweight, and works on all devices (Desktop, iOS, Android). Always up-to-date."
                        icon={<PwaIcon />}
                        onClick={onPwaInstall}
                    />
                    <InstallOption
                        title="Download App Source (.zip)"
                        description="Download a complete package of the application's source code for offline use or self-hosting."
                        icon={<ZipIcon />}
                        onClick={onDownloadSource}
                    />
                </div>
            </div>
        </div>
    );
};`,
"components/Notepad.tsx": `import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Note } from '../App';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { useDebounce } from '../hooks/useDebounce';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { NotepadIcon } from './icons/NotepadIcon';

// --- Helper Functions ---
const getPreview = (htmlContent: string): { type: 'text' | 'checklist', content: string } => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const checklist = tempDiv.querySelector('ul[data-type="checklist"]');
    if (checklist) {
        const items = Array.from(checklist.querySelectorAll('li')).slice(0, 3).map(li => li.textContent || '').filter(Boolean);
        if (items.length > 0) {
            return { type: 'checklist', content: items.join(', ') };
        }
    }
    
    const text = tempDiv.textContent || 'No additional content';
    return { type: 'text', content: text.substring(0, 120) + (text.length > 120 ? '...' : '') };
};

const getFirstImage = (htmlContent: string): string | null => {
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
};


// --- Child Components ---

const NoteCard: React.FC<{ note: Note; isSelected: boolean; onClick: () => void; onDelete: (id: string) => void; }> = React.memo(({ note, isSelected, onClick, onDelete }) => {
    const preview = useMemo(() => getPreview(note.content), [note.content]);
    const imageUrl = useMemo(() => getFirstImage(note.content), [note.content]);
    const noteDate = useMemo(() => new Date(note.date), [note.date]);
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when deleting
        onDelete(note.id);
    };

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={\`w-full text-left rounded-lg transition-all duration-200 overflow-hidden flex flex-col h-full shadow-md \${
                    isSelected 
                        ? 'bg-[var(--theme-green)]/20 ring-2 ring-[var(--theme-green)]' 
                        : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-card-bg)]/80 hover:shadow-xl hover:-translate-y-1'
                }\`}
            >
                {imageUrl && (
                    <div className="h-32 w-full overflow-hidden">
                        <img src={imageUrl} alt="Note attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg font-lora text-[var(--theme-text-primary)] break-words">{note.title}</h3>
                    <p className="text-sm text-[var(--theme-text-secondary)] mt-2 flex-grow break-words">
                        {preview.type === 'checklist' && <ChecklistIcon />}
                        {preview.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]/80 mt-4">
                        <span>{noteDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        {note.category && note.category !== 'General' && <span className="font-semibold bg-white/5 px-2 py-1 rounded">{note.category}</span>}
                    </div>
                </div>
            </button>
             <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 bg-[var(--theme-bg)] rounded-full text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label={\`Delete note \${note.title}\`}
            >
                <TrashIcon />
            </button>
        </div>
    );
});


const NoteEditor = ({ note, onUpdate, onDelete, onBack }: { note: Note; onUpdate: (note: Note) => void; onDelete: (id: string) => void; onBack: () => void; }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [dueDate, setDueDate] = useState<string | null>(note.dueDate || null);

    const draggedItemRef = useRef<HTMLElement | null>(null);
    const dropIndicatorRef = useRef<HTMLElement | null>(null);

    const debouncedTitle = useDebounce(title, 500);
    const debouncedContent = useDebounce(content, 500);
    const debouncedDueDate = useDebounce(dueDate, 500);

    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        setDueDate(note.dueDate || null);
        if (editorRef.current && note.content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = note.content;
        }
        if (!dropIndicatorRef.current) {
            const indicator = document.createElement('li');
            indicator.className = 'drop-indicator-li';
            indicator.innerHTML = \`<div class="drop-indicator"></div>\`;
            dropIndicatorRef.current = indicator;
        }
    }, [note]);

    useEffect(() => {
        if (debouncedTitle !== note.title || debouncedContent !== note.content || debouncedDueDate !== (note.dueDate || null)) {
            onUpdate({ ...note, title: debouncedTitle, content: debouncedContent, dueDate: debouncedDueDate });
        }
    }, [debouncedTitle, debouncedContent, debouncedDueDate, note, onUpdate]);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        if (draggedItemRef.current) return;
        setContent(e.currentTarget.innerHTML);
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDueDate(e.target.value || null);
    };

    const handleChecklistClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI' && target.parentElement?.dataset.type === 'checklist') {
            const isChecked = target.dataset.checked === 'true';
            target.dataset.checked = isChecked ? 'false' : 'true';
            setContent(editorRef.current?.innerHTML || '');
        }
    };
    
    const insertChecklist = () => {
        if (editorRef.current) {
            const checklistHtml = \`
                <ul data-type="checklist">
                    <li data-checked="false">To-do item 1</li>
                    <li data-checked="false">To-do item 2</li>
                </ul><p><br></p>\`;
            editorRef.current.focus();
            document.execCommand('insertHTML', false, checklistHtml);
            setContent(editorRef.current.innerHTML);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI' && target.parentElement?.dataset.type === 'checklist') {
            draggedItemRef.current = target;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => target.classList.add('dragging'), 0);
        } else {
            e.preventDefault();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItem = draggedItemRef.current;
        const dropIndicator = dropIndicatorRef.current;
        if (!draggedItem || !dropIndicator) return;
        const targetLi = (e.target as HTMLElement).closest('li');
        if (!targetLi || targetLi === draggedItem || targetLi.parentElement?.dataset.type !== 'checklist' || targetLi === dropIndicator) {
             if (dropIndicator.parentElement) dropIndicator.parentElement.removeChild(dropIndicator);
            return;
        }
        const parentUl = targetLi.parentElement;
        if (!parentUl) return;
        const rect = targetLi.getBoundingClientRect();
        const isAfter = e.clientY > rect.top + rect.height / 2;
        parentUl.insertBefore(dropIndicator, isAfter ? targetLi.nextSibling : targetLi);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItem = draggedItemRef.current;
        const dropIndicator = dropIndicatorRef.current;
        if (!draggedItem || !dropIndicator || !dropIndicator.parentElement) return;
        dropIndicator.parentElement.replaceChild(draggedItem, dropIndicator);
        if (editorRef.current) setContent(editorRef.current.innerHTML);
    };

    const handleDragEnd = () => {
        const draggedItem = draggedItemRef.current;
        const dropIndicator = dropIndicatorRef.current;
        if (draggedItem) draggedItem.classList.remove('dragging');
        if (dropIndicator?.parentElement) dropIndicator.parentElement.removeChild(dropIndicator);
        draggedItemRef.current = null;
    };


    return (
        <div className="flex flex-col h-full bg-[var(--theme-bg)]">
            <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white">
                            <ChevronLeftIcon />
                        </button>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Note Title"
                            className="text-2xl font-bold bg-transparent focus:outline-none w-full text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)] truncate"
                        />
                    </div>
                    <button onClick={() => onDelete(note.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)] flex-shrink-0 ml-2">
                        <TrashIcon />
                    </button>
                </div>
                 <div className="mt-3 flex items-center gap-2 text-sm pl-1 lg:pl-0">
                    <label htmlFor="due-date" className="flex items-center gap-2 text-[var(--theme-text-secondary)] cursor-pointer">
                        <CalendarIcon />
                        <span>Due Date</span>
                    </label>
                    <input
                        id="due-date"
                        type="date"
                        value={dueDate || ''}
                        onChange={handleDateChange}
                        className="bg-transparent border-b border-dashed border-transparent focus:border-[var(--theme-border)] focus:outline-none text-[var(--theme-text-primary)] p-1"
                    />
                    {dueDate && <button onClick={() => setDueDate(null)} className="text-xs text-[var(--theme-red)] hover:underline">Clear</button>}
                </div>
            </header>
            <div className="flex-grow overflow-y-auto p-4 md:p-6" onClick={handleChecklistClick}>
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleContentChange}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className="note-editor-content h-full leading-relaxed text-lg max-w-3xl mx-auto bg-[var(--theme-card-bg)]/50 rounded-lg p-4 sm:p-6 focus:ring-2 focus:ring-[var(--theme-green)] focus:outline-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
            <footer className="flex-shrink-0 p-2 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/30">
                <div className="flex items-center max-w-3xl mx-auto">
                    <button onClick={insertChecklist} className="p-3 hover:bg-[var(--theme-bg)] rounded-md text-[var(--theme-text-secondary)]" title="Insert Checklist">
                        <ChecklistIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
};

// --- Main Notepad Component ---
export const Notepad: React.FC<{ notes: Note[]; onSave: (note: Note) => Promise<void>; onUpdate: (note: Note) => Promise<void>; onDelete: (id: string) => Promise<void>; }> = ({ notes, onSave, onUpdate, onDelete }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const noteExists = notes.some(n => n.id === selectedNoteId);
        const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (selectedNoteId && !noteExists) {
            setSelectedNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
        } else if (!selectedNoteId && sortedNotes.length > 0) {
            setSelectedNoteId(sortedNotes[0].id);
        }
    }, [notes, selectedNoteId]);

    const filteredNotes = useMemo(() => {
        const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!searchTerm) return sorted;
        return sorted.filter(note => 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    const handleAddNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '<p>Start writing here...</p>',
            category: 'General',
            tags: [],
            date: new Date().toISOString(),
            dueDate: null,
        };
        await onSave(newNote);
        setSelectedNoteId(newNote.id);
    }, [onSave]);
    
    const handleDeleteNote = useCallback(async (id: string) => {
        if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
            await onDelete(id);
        }
    }, [onDelete]);

    const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId) || null, [notes, selectedNoteId]);
    
    return (
        <div className="flex flex-1 overflow-hidden bg-[var(--theme-bg)] backdrop-blur-2xl text-[var(--theme-text-primary)]">
            {/* Note List Pane */}
            <aside className={\`w-full lg:w-[450px] xl:w-[550px] flex-shrink-0 flex flex-col border-r border-[var(--theme-border)] \${selectedNoteId ? 'hidden lg:flex' : 'flex'}\`}>
                <header className="p-4 flex-shrink-0 flex items-center justify-between border-b border-[var(--theme-border)]">
                    <h1 className="text-3xl font-bold font-lora">Notes</h1>
                </header>
                <div className="p-4 flex-shrink-0">
                    <input 
                        type="text" 
                        placeholder="Search your notes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--theme-dark-bg)] border border-[var(--theme-border)] rounded-md pl-4 pr-4 py-2" 
                    />
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar pb-24 lg:pb-4">
                   {filteredNotes.length > 0 ? (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    isSelected={selectedNoteId === note.id} 
                                    onClick={() => setSelectedNoteId(note.id)} 
                                    onDelete={handleDeleteNote}
                                />
                            ))}
                        </div>
                   ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]">
                            <NotepadIcon />
                            <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mt-4">Your notepad is empty</h3>
                            <p className="text-sm mt-1">Click the '+' button to capture your first thought.</p>
                        </div>
                   )}
                </div>
            </aside>
            
            {/* Note Editor Pane */}
            <main className={\`flex-1 flex-col \${selectedNoteId ? 'flex' : 'hidden lg:flex'}\`}>
                {selectedNote ? (
                    <NoteEditor 
                        note={selectedNote} 
                        onUpdate={onUpdate} 
                        onDelete={handleDeleteNote} 
                        onBack={() => setSelectedNoteId(null)} 
                    />
                ) : (
                    <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 text-[var(--theme-text-secondary)]">
                        <NotepadIcon />
                        <h2 className="mt-4 text-xl font-semibold text-[var(--theme-text-primary)]">Your notes live here</h2>
                        <p className="mt-1">Select a note from the list, or create a new one to get started.</p>
                    </div>
                )}
            </main>

             <button 
                onClick={handleAddNote}
                className="absolute bottom-20 right-6 lg:bottom-8 lg:right-8 z-40 bg-[var(--theme-green)] text-black rounded-full p-4 fab-shadow hover:opacity-90 transform hover:scale-110 transition-transform"
                aria-label="Create new note"
            >
                <PlusIcon />
            </button>
        </div>
    );
};`,
"components/icons/ChecklistIcon.tsx": `import React from 'react';

export const ChecklistIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7.5" r="4.5" />
        <polyline points="17 11 19 13 23 9" />
    </svg>
);`
};