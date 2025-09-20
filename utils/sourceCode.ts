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
    "manifest.json": `{
  "short_name": "Ai tools",
  "name": "Ai tools - AI Product Description Generator",
  "description": "An AI-powered application to automatically generate structured and professional product descriptions.",
  "id": "/",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": [
    "window-controls-overlay",
    "standalone"
  ],
  "orientation": "any",
  "theme_color": "#1F2937",
  "background_color": "#000000",
  "lang": "en",
  "dir": "ltr",
  "prefer_related_applications": false,
  "launch_handler": {
    "client_mode": "navigate-existing"
  },
  "icons": [
    {
      "src": "https://i.postimg.cc/YCF8xX3R/image-removebg-preview-1.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "https://i.postimg.cc/YCF8xX3R/image-removebg-preview-1.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "categories": [
    "business",
    "productivity",
    "developer_tools"
  ],
  "screenshots": [
    {
      "src": "https://i.ibb.co/Rz7xWdY/screenshot-generator.webp",
      "sizes": "1280x720",
      "type": "image/webp",
      "form_factor": "wide",
      "label": "AI Generator Workspace"
    },
    {
      "src": "https://i.ibb.co/2vXQZtP/screenshot-recordings.webp",
      "sizes": "1280x720",
      "type": "image/webp",
      "form_factor": "wide",
      "label": "Recording and Transcription Manager"
    },
    {
      "src": "https://i.ibb.co/1K5x2L1/screenshot-photos.webp",
      "sizes": "1280x720",
      "type": "image/webp",
      "form_factor": "wide",
      "label": "Photo Library and Management"
    },
    {
      "src": "https://i.ibb.co/b3D0z0p/screenshot-generator-narrow.webp",
      "sizes": "720x1280",
      "type": "image/webp",
      "form_factor": "narrow",
      "label": "AI Generator on Mobile"
    },
    {
      "src": "https://i.ibb.co/4Z58f6d/screenshot-recordings-narrow.webp",
      "sizes": "720x1280",
      "type": "image/webp",
      "form_factor": "narrow",
      "label": "Recordings on Mobile"
    },
    {
      "src": "https://i.ibb.co/yq4503s/screenshot-photos-narrow.webp",
      "sizes": "720x1280",
      "type": "image/webp",
      "form_factor": "narrow",
      "label": "Photos on Mobile"
    }
  ],
  "shortcuts": [
    {
      "name": "New Recording",
      "short_name": "Record",
      "description": "Start a new voice recording",
      "url": "/?view=recordings",
      "icons": [
        {
          "src": "https://i.ibb.co/6y1jV1h/shortcut-mic.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "New Sticky Note",
      "short_name": "Note",
      "description": "Create a new sticky note",
      "url": "/?view=notepad",
      "icons": [
        {
          "src": "https://i.ibb.co/L6Szk5X/shortcut-note.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Open Image Squarer",
      "short_name": "Image Tool",
      "description": "Open the image processing tool",
      "url": "/?view=image-tool",
      "icons": [
        {
          "src": "https://i.ibb.co/wJ4tS0V/shortcut-image.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}`
};