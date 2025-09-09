import React from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-black/50 p-3 rounded-md text-sm text-[var(--theme-text-primary)] font-mono overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const Step: React.FC<{ num: string; title: string; children: React.ReactNode; }> = ({ num, title, children }) => (
    <div>
        <h4 className="text-md font-semibold text-[var(--theme-text-primary)] mb-2">Step {num}: {title}</h4>
        <div className="pl-4 border-l-2 border-[var(--theme-border)]/50 space-y-3 text-[var(--theme-text-secondary)]">
            {children}
        </div>
    </div>
);


export const SetupGuide: React.FC = () => (
    <div className="space-y-8 text-sm leading-relaxed animate-fade-in-down max-w-3xl">
        <div>
            <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Custom API Server Setup Guide</h2>
            <p className="mt-2 text-[var(--theme-text-secondary)]">
                Use this for the most powerful setup. Manage a main admin PC and multiple display kiosks across different locations, all synced together over the internet. This setup uses PM2, a process manager, to ensure your server and the secure connection run 24/7 and restart automatically.
            </p>
        </div>
        
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--theme-yellow)]">Part 1: Configure Your Central Server (On Your Main PC)</h3>
            <div className="space-y-6">
                <Step num="1.1" title="One-Time System Installations">
                    <p><strong>Install Node.js:</strong> If you don't have it, go to <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-blue)] hover:underline">nodejs.org</a>, download and install the LTS version. Verify by opening a terminal and running <code className="bg-black/30 px-1 py-0.5 rounded">node -v</code> and <code className="bg-black/30 px-1 py-0.5 rounded">npm -v</code>.</p>
                    <p><strong>Install PM2:</strong> In your terminal, run this command to install PM2 globally:</p>
                    <CodeBlock>npm install -g pm2</CodeBlock>
                    <p><strong>Install Cloudflare Tunnel:</strong> Follow the official guide to install the <code className="bg-black/30 px-1 py-0.5 rounded">cloudflared</code> tool from <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/installation/" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-blue)] hover:underline">this link</a>.</p>
                </Step>

                <Step num="1.2" title="Configure the Server Project">
                    <p><strong>Open a Terminal in the `server` Folder:</strong> In your project, navigate into the <code className="bg-black/30 px-1 py-0.5 rounded">server</code> directory.</p>
                    <p><strong>Install Server Dependencies:</strong> Run this command once:</p>
                    <CodeBlock>npm install</CodeBlock>
                    <p><strong>CRITICAL - Set Your Secret API Key:</strong> In the <code className="bg-black/30 px-1 py-0.5 rounded">server</code> folder, rename the file <code className="bg-black/30 px-1 py-0.5 rounded">.env.example</code> to exactly <code className="bg-black/30 px-1 py-0.5 rounded">.env</code>. Open this new file and replace the placeholder key with your own private password.</p>
                </Step>
                 <Step num="1.3" title="Run and Persist the Server with PM2">
                    <p><strong>Start Both Services:</strong> In your terminal (still inside the server folder), run this command. It uses the project's configuration file to start both your API server and the Cloudflare tunnel in the background.</p>
                    <CodeBlock>pm2 start</CodeBlock>
                    <p>Tip: You can run <code className="bg-black/30 px-1 py-0.5 rounded">pm2 delete all</code> first for a clean start. Check that both `kiosk-api` and `kiosk-tunnel` are <span className="text-green-400">online</span> with <code className="bg-black/30 px-1 py-0.5 rounded">pm2 list</code>.</p>
                    <p><strong>Get Your Public URL:</strong> To see the tunnel's output and get your permanent public URL, run:</p>
                    <CodeBlock>pm2 logs kiosk-tunnel</CodeBlock>
                    <p>Look for a URL like <code className="bg-black/30 px-1 py-0.5 rounded">https://...trycloudflare.com</code>. Copy this URL. You can press <kbd>Ctrl</kbd> + <kbd>C</kbd> to exit the logs view.</p>
                    <p><strong>Make it Permanent (Crucial):</strong> To make PM2 restart everything automatically after a computer reboot, run this command:</p>
                     <CodeBlock>pm2 startup</CodeBlock>
                    <p>The command will output another command. You must copy that entire new command, paste it back into the same terminal, and press Enter. Finally, save your current process list so it knows what to restart:</p>
                    <CodeBlock>pm2 save</CodeBlock>
                    <p>Your server is now fully configured. You can close the terminal.</p>
                </Step>
            </div>
        </div>

         <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--theme-yellow)]">Part 2: Connect Your App to Your Server</h3>
            <p>You must do this on every single device you want to sync, including your main PC's browser.</p>
            <ol className="list-decimal list-inside space-y-3 text-[var(--theme-text-secondary)]">
                <li>Go to the <strong className="text-white">Site & Creator Settings</strong> tab in the Dashboard.</li>
                <li>In the <strong className="text-white">Sync & API Settings</strong> section, enter your details.</li>
                <li>In "Custom API URL", paste your public Cloudflare URL from Part 1.</li>
                <li>In "Custom API Auth Key", enter the secret key from your server's <code className="bg-black/30 px-1 py-0.5 rounded">.env</code> file.</li>
                <li>Save your changes.</li>
                <li>Go to the <strong className="text-white">Data Management</strong> tab.</li>
                <li>On your main admin PC: Click "Connect to Folder...", select a folder, and choose to save your current data to it. This uploads your local data to the server for the first time.</li>
                <li>On all other devices: Do the same, but when prompted, choose to load data from the folder. This downloads the master data from your server.</li>
            </ol>
            <p>Your multi-device system is now fully configured and running!</p>
        </div>
    </div>
);
