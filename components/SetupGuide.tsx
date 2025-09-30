import React from 'react';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { CloudIcon } from './icons/CloudIcon';
// FIX: Import the 'CodeIcon' component to resolve the 'Cannot find name' error.
import { CodeIcon } from './icons/CodeIcon';
import { ServerIcon } from './icons/ServerIcon';

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

        <Section icon={<ServerIcon />} title="FTP / SFTP Server Sync (Advanced)">
            <p><strong>Best for:</strong> Users who have their own server and want to manage their backups via FTP/SFTP.</p>
            <p>
                This mode allows the application to save data to your personal or company FTP server. It provides a robust way to centralize backups.
            </p>
            <Alert type="warning">
                <strong>Technical Limitation:</strong> Web browsers cannot connect directly to FTP/SFTP servers. This feature requires a backend service (a "proxy") to act as a bridge. The app sends data to your secure backend, which then connects to the FTP server to save the files.
            </Alert>
            <h4 className="font-semibold text-[var(--theme-text-primary)] mt-4">Setup Overview:</h4>
            <ol className="list-decimal list-inside space-y-2">
                <li>Build and deploy a simple backend proxy server using the manual instructions below. This server will securely connect to your FTP server.</li>
                <li>In this app's Dashboard, go to <strong className="text-white">Data Management &gt; API Settings</strong>, set the "Custom API URL" to your new proxy server's URL, and provide your secret "Auth Key".</li>
                <li>Finally, go to the <strong className="text-white">FTP / SFTP</strong> tab and click "Set as Active Sync". This tells the app to use the proxy for saving data.</li>
            </ol>

            <div className="mt-6 pt-6 border-t border-[var(--theme-border)]/50">
                <h4 className="text-lg font-bold text-orange-400 mb-2">Manual Guide: Build the FTP/SFTP Backend Proxy</h4>
                <p>This guide walks you through creating a secure, serverless backend on Vercel. SFTP (Secure FTP) is used in this example as it is highly recommended over standard FTP.</p>

                <Step num="1" title="Prerequisites">
                    <p>1. A code editor (like VS Code).</p>
                    <p>2. <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-orange)] hover:underline">Node.js</a> installed on your computer.</p>
                    <p>3. A Vercel account for free hosting.</p>
                    <p>4. Your SFTP server credentials (host, port, username, password).</p>
                </Step>

                <Step num="2" title="Set Up Your Project Folder">
                    <p>1. Create a new folder for your project (e.g., `my-ftp-proxy`).</p>
                    <p>2. Inside that folder, create another folder named `api`.</p>
                    <p>3. Inside `api`, create a new file named `sync.ts`.</p>
                    <p>This structure is automatically recognized by Vercel for serverless functions.</p>
                    <CodeBlock>
{`my-ftp-proxy/
└── api/
    └── sync.ts`}
                    </CodeBlock>
                </Step>
                
                <Step num="3" title="Initialize the Project & Install Libraries">
                    <p>1. Open a terminal or command prompt in your main project folder (`my-ftp-proxy`).</p>
                    <p>2. Run the command <code className="bg-black/30 px-1 rounded text-xs">npm init -y</code> to create a `package.json` file.</p>
                    <p>3. Install the necessary SFTP library by running:</p>
                    <CodeBlock>npm install ssh2-sftp-client</CodeBlock>
                </Step>

                <Step num="4" title="Create the API Endpoint Code">
                    <p>Open `api/sync.ts` and paste the following code. This function receives data from the app and securely uploads it to your SFTP server.</p>
                    <CodeBlock>
{`import type { VercelRequest, VercelResponse } from '@vercel/node';
import SftpClient from 'ssh2-sftp-client';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Authentication
  if (req.headers.authorization !== \`Bearer \${process.env.API_SECRET_KEY}\`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { filePath, fileContent } = req.body;
  if (!filePath || !fileContent) {
    return res.status(400).json({ error: 'Missing filePath or fileContent' });
  }

  // 2. SFTP Configuration from Environment Variables
  const config = {
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT || '22', 10),
    username: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
  };

  const sftp = new SftpClient();
  try {
    await sftp.connect(config);

    const remoteDir = path.dirname(filePath);
    await sftp.mkdir(remoteDir, true); // Ensure directory exists

    await sftp.put(Buffer.from(fileContent), filePath);
    
    await sftp.end();
    return res.status(200).json({ success: true, message: \`File saved to \${filePath}\` });
  } catch (err) {
    console.error('SFTP Error:', err);
    await sftp.end();
    return res.status(500).json({ error: 'SFTP operation failed.', details: (err as Error).message });
  }
}`}
                    </CodeBlock>
                </Step>

                <Step num="5" title="Configure Server Environment Variables">
                    <p>Your credentials must be stored securely on the server, not in the app code. You will set these in your Vercel project settings after deployment.</p>
                    <p>The required variables are:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><code className="bg-black/30 px-1 rounded text-xs">API_SECRET_KEY</code>: A strong, unique password you create to protect this endpoint.</li>
                        <li><code className="bg-black/30 px-1 rounded text-xs">FTP_HOST</code>: Your SFTP server address.</li>
                        <li><code className="bg-black/30 px-1 rounded text-xs">FTP_PORT</code>: Your SFTP port (usually 22 for SFTP, 21 for FTP).</li>
                        <li><code className="bg-black/30 px-1 rounded text-xs">FTP_USER</code>: Your SFTP username.</li>
                        <li><code className="bg-black/30 px-1 rounded text-xs">FTP_PASSWORD</code>: Your SFTP password.</li>
                    </ul>
                </Step>

                <Step num="6" title="Deploy to Vercel">
                    <p>1. On your Vercel dashboard, choose "Add New... &gt; Project".</p>
                    <p>2. Find the option to deploy from your computer and drag your `my-ftp-proxy` folder into the browser.</p>
                    <p>3. Once deployed, go to the project's <strong className="text-white">Settings &gt; Environment Variables</strong> page and add all the secret keys from Step 5.</p>
                    <p>4. Go to the "Deployments" tab and re-deploy the project to apply the variables. Your API will be live at a URL like `https://my-ftp-proxy-xxxx.vercel.app/api/sync`.</p>
                </Step>

                <Step num="7" title="Connect the App to Your Proxy">
                    <p>1. In this app, go to <strong className="text-white">Dashboard &gt; Data Management &gt; API Settings</strong>.</p>
                    <p>2. In "Custom API URL", enter your proxy's full URL (e.g., `https://my-ftp-proxy-xxxx.vercel.app`).</p>
                    <p>3. In "Auth Key", enter the same secret key you used for `API_SECRET_KEY`.</p>
                    <p>4. Click "Save Settings".</p>
                    <p>5. Go to the <strong className="text-white">FTP / SFTP</strong> tab and click "Set as Active Sync". The app will now be configured to use your proxy for data operations.</p>
                    <Alert type="tip">The FTP form in the app is for your reference. For maximum security, the backend proxy we just built uses its own server-side environment variables for the actual connection.</Alert>
                </Step>
            </div>
        </Section>
    </div>
);
