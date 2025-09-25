import React from 'react';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { CloudIcon } from './icons/CloudIcon';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';

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
                This application gives you full control over your data. Choose the mode that best fits your workflow, from simple and private to powerful and collaborative.
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
        
        <Section icon={<FolderSyncIcon />} title="Local Folder Sync Mode (with Cloud Backup)">
            <p><strong>Best for:</strong> Automatic backups and syncing your data across your personal computers via services like Google Drive.</p>
            <p>
                This mode connects the app to a folder on your computer. All your work—notes, recordings, photos, and settings—is saved as plain, readable files (like `.json` and `.webm`) right in that folder.
            </p>
            <div className="text-sm mt-2 p-3 bg-orange-500/10 rounded-md border border-orange-500/30">
                <strong className="text-orange-300">Pro Tip: Sync with Google Drive or Dropbox!</strong>
                <p className="text-orange-300/80 mt-1">To sync between computers, simply install the Google Drive (or Dropbox/OneDrive) desktop app, and then choose your local cloud drive folder when you connect. Any changes you make on one computer will automatically upload and sync to your other devices. This is the easiest way to get cloud-powered sync and backup.</p>
            </div>
            <h4 className="font-semibold text-[var(--theme-text-primary)] mt-4">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2">
                <li>Go to the <strong className="text-white">Data Management</strong> tab in the Dashboard.</li>
                <li>Under "Connection Status", click the <strong className="text-white">Connect to Folder...</strong> button.</li>
                <li>Your browser will open a file dialog. Navigate to your Google Drive folder and choose an empty sub-folder or create a new one (e.g., "My Ai App Data").</li>
                <li>Grant the app permission to read and write to the folder.</li>
                <li>The app is now synced! All changes will be saved as files in your chosen folder and automatically backed up to the cloud. You can also download the project from GitHub: <a href="https://github.com/jasonankeodendaal/Product-description-template.git" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-orange)] hover:underline">Download from GitHub</a></li>
            </ol>
        </Section>
        
        <Section icon={<GoogleDriveIcon />} title="Google Drive Sync Setup">
            <p><strong>Best for:</strong> Easy, automated cloud backups of your data to your personal Google Drive. This is separate from the "Local Folder Sync" method.</p>
            <p>This mode connects the app directly to your Google Account, allowing it to save and manage a backup file in a private app data folder in your Google Drive. This is a simple way to keep your data safe in the cloud.</p>

            <Alert type="warning">
                <strong>Access blocked / Error 403: access_denied?</strong> This is the most common setup issue. It means your Google Account hasn't been added as a "Test User" in your Google Cloud project while the app is in "Testing" mode. Follow Step 2 carefully to fix it.
            </Alert>

            <h4 className="font-semibold text-[var(--theme-text-primary)] mt-4">Setup Instructions:</h4>

            <div className="space-y-6">
                <Step num="1" title="Create a Google Cloud Project">
                    <p>1. Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-orange)] hover:underline">Google Cloud Console</a> and create a new project (or select an existing one).</p>
                    <p>2. In the sidebar, go to <strong className="text-white">APIs & Services &gt; Library</strong>.</p>
                    <p>3. Search for "Google Drive API" and click <strong className="text-white">Enable</strong>.</p>
                </Step>

                <Step num="2" title="Configure the OAuth Consent Screen">
                    <p>1. In the sidebar, go to <strong className="text-white">APIs & Services &gt; OAuth consent screen</strong>.</p>
                    <p>2. Choose <strong className="text-white">"External"</strong> user type and click Create.</p>
                    <p>3. Fill in the required app details: App name, User support email, and Developer contact information.</p>
                    <p>4. On the "Scopes" page, just click "Save and Continue". You don't need to add scopes here.</p>
                    <p>5. On the "Test users" page, click <strong className="text-white">"+ ADD USERS"</strong> and add your own Google email address. This is required while your app is in "Testing" mode.</p>
                    <p>6. Click "Save and Continue" and then "Back to Dashboard".</p>
                </Step>

                <Step num="3" title="Create Web Client Credentials">
                    <p>1. In the sidebar, go to <strong className="text-white">APIs & Services &gt; Credentials</strong>.</p>
                    <p>2. Click <strong className="text-white">"+ CREATE CREDENTIALS"</strong> and select <strong className="text-white">"OAuth client ID"</strong>.</p>
                    <p>3. Set the "Application type" to <strong className="text-white">Web application</strong>.</p>
                    <p>4. Under <strong className="text-white">"Authorized redirect URIs"</strong>, you must add the exact callback URL for your deployed app. Click <strong className="text-white">"+ ADD URI"</strong> and enter:</p>
                    <CodeBlock>https://your-project-name.vercel.app/api/auth/google/callback</CodeBlock>
                    <p>Replace <code className="bg-black/30 px-1 py-0.5 rounded text-xs">your-project-name.vercel.app</code> with your actual Vercel deployment URL.</p>
                    <p>5. Click <strong className="text-white">Create</strong>. A popup will show your <strong className="text-white">Client ID</strong> and <strong className="text-white">Client Secret</strong>. Copy both of these.</p>
                </Step>

                <Step num="4" title="Set Environment Variables on Vercel">
                    <p>1. Go to your Vercel project's dashboard, click the <strong className="text-white">"Settings"</strong> tab, then <strong className="text-white">"Environment Variables"</strong>.</p>
                    <p>2. Add the following three variables:</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">GOOGLE_CLIENT_ID</code>, <strong>Value:</strong> Paste your Client ID.</li>
                        <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">GOOGLE_CLIENT_SECRET</code>, <strong>Value:</strong> Paste your Client Secret.</li>
                        <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">NEXTAUTH_URL</code>, <strong>Value:</strong> Your full Vercel app URL (e.g., <code className="bg-black/30 px-1 py-0.5 rounded text-xs">https://your-project-name.vercel.app</code>). Do not add a slash at the end.</li>
                    </ul>
                    <p className="mt-2">3. After adding the variables, <strong className="text-white">redeploy</strong> your project from the "Deployments" tab for the changes to apply.</p>
                    <p className="mt-2">Once redeployed, go to the app's Dashboard &gt; Data Management, and the "Connect to Google Drive" button should now work correctly!</p>
                </Step>
            </div>
        </Section>
    </div>
);