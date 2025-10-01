
import React from 'react';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { CloudIcon } from './icons/CloudIcon';
// FIX: Import the 'CodeIcon' component to resolve the 'Cannot find name' error.
import { CodeIcon } from './icons/CodeIcon';
import { ServerIcon } from './icons/ServerIcon';
import { GithubIcon } from './icons/GithubIcon';

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

        <Section icon={<GithubIcon />} title="Live Global Settings (Recommended for Creator)">
            <p><strong>Best for:</strong> Creators who need to update branding and contact information globally without redeploying the app.</p>
            <p>
                This advanced method uses a secret GitHub Gist as a live, remote configuration file. When you save changes in the dashboard, the app securely updates this file, and all users will see the new information on their next visit.
            </p>
            
            <h4 className="font-semibold text-[var(--theme-text-primary)] mt-4">One-Time Setup Instructions:</h4>
            <Step num="1" title="Create a Secret GitHub Gist">
                <p>1. Go to <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-orange)] hover:underline">gist.github.com</a>.</p>
                <p>2. Create a new file named <strong className="text-white">`creator_details.json`</strong>.</p>
                <p>3. Paste the content of the `CREATOR_DETAILS` object from `src/constants.ts` into this file.</p>
                <p>4. IMPORTANT: Before saving, click the dropdown and select <strong className="text-white">"Create secret gist"</strong>.</p>
                <p>5. After saving, copy the <strong className="text-white">32-character ID</strong> from the URL. This is your `GIST_ID`.</p>
            </Step>
            <Step num="2" title="Create a GitHub Personal Access Token (PAT)">
                <p>1. Go to your GitHub Settings &gt; Developer settings &gt; Personal access tokens &gt; Tokens (classic).</p>
                <p>2. Click "Generate new token" and select "Generate new token (classic)".</p>
                <p>3. Give it a descriptive name (e.g., "AI Tools Gist Updater").</p>
                <p>4. Set the expiration to "No expiration" for long-term use.</p>
                <p>5. Under "Select scopes," check the box for <strong className="text-white">`gist`</strong>. No other permissions are needed.</p>
                <p>6. Click "Generate token" and <strong className="text-red-400">immediately copy the token</strong>. This is your `GIST_PAT`. You will not see it again.</p>
            </Step>
            <Step num="3" title="Set Environment Variables on Vercel">
                 <p>1. In your Vercel project dashboard, go to <strong className="text-white">Settings &gt; Environment Variables</strong>.</p>
                 <p>2. Add the following three secrets:</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>`GIST_ID`: The 32-character ID from your Gist's URL.</li>
                    <li>`GIST_PAT`: The Personal Access Token you just generated.</li>
                    <li>`CREATOR_PIN`: The PIN used for creator login (e.g., "1723j").</li>
                 </ul>
                 <p>3. Re-deploy your project one last time to apply these variables. Now, you can edit and save creator details live from the dashboard!</p>
            </Step>
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
      