import React from 'react';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { CloudIcon } from './icons/CloudIcon';

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
            <div className="text-[var(--theme-yellow)] w-6 h-6">{icon}</div>
            <h3 className="text-xl font-bold text-[var(--theme-text-primary)]">{title}</h3>
        </div>
        <div className="space-y-4 text-sm text-[var(--theme-text-secondary)]">
            {children}
        </div>
    </div>
);


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
        
        <Section icon={<FolderSyncIcon />} title="Local Folder Sync Mode">
            <p><strong>Best for:</strong> Automatic backups and syncing your data across your personal computers.</p>
            <p>
                This mode connects the app to a folder on your computer. All your work—notes, recordings, photos, and settings—is saved as plain, readable files (like `.json` and `.webm`) right in that folder.
            </p>
            <div className="text-xs mt-2 p-3 bg-[var(--theme-bg)]/50 rounded-md border border-[var(--theme-border)]/30">
                <strong>Pro Tip:</strong> To sync between computers, simply choose your Google Drive, Dropbox, or OneDrive folder when you connect. Any changes you make on one computer will automatically sync to the others via that service.
            </div>
            <h4 className="font-semibold text-[var(--theme-text-primary)] mt-2">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2">
                <li>Go to the <strong className="text-white">Data Management</strong> tab in the Dashboard.</li>
                <li>Under "Connection Status", click the <strong className="text-white">Connect to Folder...</strong> button.</li>
                <li>Your browser will open a file dialog. Choose an empty folder or create a new one (e.g., "My Ai App Data").</li>
                <li>Grant the app permission to read and write to the folder.</li>
                <li>The app is now synced! All changes will be saved as files in your chosen folder.</li>
            </ol>
        </Section>

        <Section icon={<CloudIcon isConnected={true} />} title="Advanced: API Server Sync Mode">
             <p><strong>Best for:</strong> Teams needing real-time collaboration and instant data access on any device (including mobile).</p>
             <p>This is the most powerful option. It turns one of your computers into a private, central "brain" for your app data. All other devices connect to this central brain to get live updates. It's like running your own private cloud.</p>

            <div className="mt-6 space-y-8">
                <div className="p-4 bg-[var(--theme-yellow)]/10 rounded-lg border border-[var(--theme-yellow)]/30">
                    <h4 className="font-semibold text-[var(--theme-yellow)]">What You'll Need</h4>
                     <ul className="list-disc list-inside mt-2 text-sm text-[var(--theme-text-secondary)]">
                        <li><strong>A "Server" Computer:</strong> One computer that can be left on and connected to the internet.</li>
                        <li><strong>Command Line Familiarity:</strong> You'll need to be comfortable opening a terminal (on Mac/Linux) or Command Prompt/PowerShell (on Windows) to copy and paste commands.</li>
                        <li><strong>A Google Gemini API Key:</strong> To power the AI features.</li>
                        <li><strong>A Cloudflare Account:</strong> The free plan is all you need. We use this for a simple and secure way to connect your devices to your server.</li>
                    </ul>
                </div>
                
                <div>
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-3">Part 1: One-Time Setup on Your Server Computer</h3>
                     <div className="space-y-6">
                        <Step num="1" title="Install the Engine: Node.js">
                            <p>Node.js is the underlying technology that runs the server. If you don't have it, download the "LTS" version from <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-blue)] hover:underline">nodejs.org</a> and install it.</p>
                            <p>To check if it's installed, open your terminal and run <code className="bg-black/30 px-1 py-0.5 rounded">node -v</code>. You should see a version number like `v20.11.0`.</p>
                        </Step>
                        
                        <Step num="2" title="Install the Babysitter: PM2">
                            <p>PM2 is a process manager. Think of it as a babysitter for your server—if it crashes or the computer restarts, PM2 automatically starts it again. Install it by running this in your terminal:</p>
                            <CodeBlock>npm install -g pm2</CodeBlock>
                        </Step>

                        <Step num="3" title="Install the Secure Tunnel: Cloudflare">
                             <p>This creates a secure tunnel from the internet to your server without any complicated network setup. Follow the <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/installation/" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-blue)] hover:underline">official guide</a> to install the `cloudflared` tool. After installing, log in to your Cloudflare account by running:</p>
                             <CodeBlock>cloudflared tunnel login</CodeBlock>
                        </Step>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-3">Part 2: Prepare the Application Code</h3>
                     <div className="space-y-6">
                        <Step num="4" title="Navigate to the Project Folder">
                             <p>Open your terminal and navigate into the folder containing the application's code.</p>
                        </Step>
                        <Step num="5" title="Install Dependencies">
                             <p>This command downloads all the necessary code libraries the server needs to run. Run it once:</p>
                             <CodeBlock>npm install</CodeBlock>
                        </Step>
                         <Step num="6" title="Create Your Secret Key File">
                            <p>This is the most critical step for security. You need to create a file to hold your secret keys.</p>
                            <p>1. In the root of the project folder, create a new file named exactly <code className="bg-black/30 px-1 py-0.5 rounded">.env</code> (the dot at the beginning is important).</p>
                            <p>2. Open this file in a text editor and paste the following, replacing the placeholders with your actual keys:</p>
                            <CodeBlock>
{`# Get this from Google AI Studio. Keep it private.
API_KEY="YOUR_GEMINI_API_KEY"

# Create a strong, unique password for app authentication.
# This is what you'll enter in the app's "Auth Key" field.
API_SECRET_KEY="a-very-strong-and-secret-password-you-make-up"`}
                            </CodeBlock>
                             <p><strong>Do not share this file with anyone.</strong></p>
                        </Step>
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-3">Part 3: Launch the Server</h3>
                     <div className="space-y-6">
                         <Step num="7" title="Start the Server and Tunnel with PM2">
                             <p>Now, run these two commands in your terminal from the project folder. They will start both the server and the secure tunnel in the background.</p>
                             <p>1. Start the API server:</p>
                             <CodeBlock>pm2 start npx --name="gemini-api" -- vercel dev</CodeBlock>
                             <p>2. Start the secure tunnel that points to the server:</p>
                             <CodeBlock>pm2 start cloudflared --name="api-tunnel" -- tunnel --url http://localhost:3000</CodeBlock>
                         </Step>
                          <Step num="8" title="Get Your Public Server Address">
                             <p>The Cloudflare tunnel has created a unique, public web address for your server. To find it, check the tunnel's logs:</p>
                             <CodeBlock>pm2 logs api-tunnel</CodeBlock>
                             <p>Look for a URL ending in <code className="bg-black/30 px-1 py-0.5 rounded">.trycloudflare.com</code>. This is your public API URL. Copy it! You can press <kbd>Ctrl</kbd> + <kbd>C</kbd> to exit the logs.</p>
                         </Step>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-3">Part 4: Connect the App on Your Devices</h3>
                    <p>On any device you want to sync (your laptop, phone, etc.), do the following:</p>
                     <ol className="list-decimal list-inside space-y-2 mt-4">
                        <li>Go to the <strong className="text-white">Data Management</strong> tab in the Dashboard.</li>
                        <li>In the <strong className="text-white">Sync & API Settings</strong> section:</li>
                        <li>Paste your <code className="bg-black/30 px-1 py-0.5 rounded">.trycloudflare.com</code> URL into the "Custom API URL" field.</li>
                        <li>Enter the secret key you created in your `.env` file (`API_SECRET_KEY`) into the "Custom API Auth Key" field.</li>
                        <li>Click <strong className="text-white">Save Settings</strong>, then click <strong className="text-white">Connect & Sync</strong>.</li>
                    </ol>
                    <p className="mt-2">That's it! Your device is now connected. The status indicator in the app header should turn green. Repeat this on all your devices to keep them in perfect sync.</p>
                </div>
            </div>
        </Section>
    </div>
);