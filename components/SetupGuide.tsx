import React from 'react';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { CloudIcon } from './icons/CloudIcon';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';
import { DropboxIcon } from './icons/DropboxIcon';
// FIX: Import the 'CodeIcon' component to resolve the 'Cannot find name' error.
import { CodeIcon } from './icons/CodeIcon';

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

const Section: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-[var(--theme-card-bg)]/50 p-6 rounded-lg border border-[var(--theme-border)]/50">
        <div className="flex items-center gap-3 mb-4">
            <div className="text-[var(--theme-orange)] w-6 h-6">{icon}</div>
            <h3 className="text-xl font-bold text-[var(--theme-text-primary)]">{title}</h3>
        </div>
        <div className="space-y-4 text-sm text-[var(--theme-text-secondary)]">
            {children}
        </div>
    </div>
);

const Alert: React.FC<{ type: 'info' | 'warning' | 'tip', children: React.ReactNode }> = ({ type, children }) => {
    const colors = {
        info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        tip: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    }
    return (
        <div className={`p-4 rounded-lg border ${colors[type]}`}>
            <p className="text-sm">{children}</p>
        </div>
    )
};


export const SetupGuide: React.FC = () => (
    <div className="space-y-10 text-sm leading-relaxed animate-fade-in-down max-w-4xl">
        <section>
            <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Understanding Your Data Options</h2>
            <p className="mt-2 text-[var(--theme-text-secondary)]">
                This application gives you full control over your data. Choose the mode that best fits your workflow, from simple and private to using a custom sync server.
            </p>
        </section>

        <Section icon={<HardDriveIcon />} title="Local Browser Mode (Default)">
            <p><strong>Best for:</strong> Getting started quickly, single-device use, and maximum privacy.</p>
            <p>
                This is the default mode. All your data is stored securely within your web browser. It's fast, works completely offline, and requires zero setup.
            </p>
            <div className="text-xs mt-2 p-3 bg-[var(--theme-bg)]/50 rounded-md border border-[var(--theme-border)]/30">
                <strong>Heads up:</strong> Data is not shared between different browsers (e.g., Chrome and Firefox) or different devices. Clearing your browser's site data will permanently erase all your app data, so regular backups are recommended!
            </div>
             <p><strong>Setup:</strong> None! You're already using it.</p>
        </Section>
        
        <Section icon={<FolderSyncIcon />} title="Local Folder Sync (Desktop Alternative)">
             <p><strong>Best for:</strong> Desktop users who want a physical copy of their data files or prefer using their cloud service's desktop client for syncing.</p>
            <p>
                This mode connects the app to a folder on your computer. All your work—notes, recordings, photos, and settings—is saved as plain, readable files (like `.json` and `.webm`) right in that folder.
            </p>
             <div className="text-xs mt-2 p-3 bg-[var(--theme-bg)]/50 rounded-md border border-[var(--theme-border)]/30">
                <strong>Note:</strong> This method requires a desktop computer to select the folder and does not work on mobile browsers.
            </div>
        </Section>
        
        <Section icon={<CodeIcon />} title="Custom API Server (Advanced)">
            <p><strong>Best for:</strong> Teams needing real-time, collaborative sync across multiple users.</p>
            <p>This mode connects the app to a dedicated backend server that you host yourself. This is the most powerful option but requires technical knowledge to set up.</p>
            
            <Alert type="warning">
                <strong>Technical Requirement:</strong> This option requires deploying the included serverless functions to a hosting provider like Vercel and configuring environment variables (API keys, secrets).
            </Alert>
            
            <h4 className="font-semibold text-[var(--theme-text-primary)] mt-4">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2">
                <li>Deploy the app's source code to a hosting service that supports serverless functions (e.g., Vercel).</li>
                <li>In your hosting provider's dashboard, set the `API_KEY` (your Gemini API Key) and `API_SECRET_KEY` (a strong password you create) environment variables.</li>
                <li>In the app's Dashboard, go to <strong className="text-white">Data Management &gt; API Settings</strong>.</li>
                <li>Enter your deployment URL (e.g., `https://your-app.vercel.app`) as the "Custom API URL" and your `API_SECRET_KEY` as the "Auth Key".</li>
                <li>Click "Save" and then "Connect". You can also download the project from GitHub: <a href="https://github.com/jasonankeodendaal/Product-description-template.git" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-orange)] hover:underline">Download from GitHub</a></li>
            </ol>
        </Section>
    </div>
);