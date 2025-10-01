import React from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { CodeIcon } from './icons/CodeIcon';
import { ServerIcon } from './icons/ServerIcon';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-black/50 p-3 rounded-md text-sm text-gray-200 font-mono overflow-x-auto whitespace-pre-wrap selection:bg-orange-500/50">
        <code>{children}</code>
    </pre>
);

const Step: React.FC<{ num: string; title: string; children: React.ReactNode; }> = ({ num, title, children }) => (
    <div className="pt-4">
        <h4 className="text-md font-semibold text-white mb-2">Step {num}: {title}</h4>
        <div className="pl-4 border-l-2 border-gray-700 space-y-3 text-gray-400 text-sm">
            {children}
        </div>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50">
        <div className="flex items-center gap-4 mb-4">
            <div className="text-orange-400 w-8 h-8 flex-shrink-0">{icon}</div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <div className="space-y-4 text-sm text-gray-300">
            {children}
        </div>
    </div>
);

const Alert: React.FC<{ type: 'info' | 'warning' | 'tip' | 'error', children: React.ReactNode }> = ({ type, children }) => {
    const colors = {
        info: 'border-sky-500/30 bg-sky-900/50 text-sky-300',
        warning: 'border-amber-500/30 bg-amber-900/50 text-amber-300',
        tip: 'border-orange-500/30 bg-orange-900/50 text-orange-300',
        error: 'border-red-500/30 bg-red-900/50 text-red-300',
    }
    return (
        <div className={`p-4 rounded-lg border ${colors[type]}`}>
            <div className="text-sm">{children}</div>
        </div>
    )
};


export const SetupGuide: React.FC = () => (
    <div className="space-y-12 text-sm leading-relaxed animate-fade-in-down max-w-4xl">
        <section>
            <h2 className="text-3xl font-bold text-white">Application Setup Guide</h2>
            <p className="mt-2 text-gray-400">
                Welcome! This guide will walk you through configuring all the powerful features of this application, from basic AI functionality to advanced, creator-level settings.
            </p>
        </section>

        <Section icon={<CodeIcon />} title="Core Setup: Enabling AI Features">
            <p><strong>Who is this for?</strong> Everyone who deploys this application.</p>
            <p>To use the AI-powered features like content generation and audio transcription, the application needs a Google Gemini API key. This is a simple but essential step.</p>
            
            <Step num="1" title="Get Your Google Gemini API Key">
                <p>1. Go to Google AI Studio: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">aistudio.google.com/app/apikey</a>.</p>
                <p>2. Sign in with your Google account.</p>
                <p>3. Click "<strong className="text-white">Create API key in new project</strong>".</p>
                <p>4. Copy the generated API key immediately. This is your `API_KEY`. Store it securely.</p>
            </Step>

            <Step num="2" title="Provide the API Key to the Application">
                <p>Your deployed application needs access to this key. The secure way to do this is with an <strong className="text-white">Environment Variable</strong> in your hosting provider (like Vercel).</p>
                <p>1. In your Vercel project dashboard, navigate to <strong className="text-white">Settings → Environment Variables</strong>.</p>
                <p>2. Create a new variable with the name <CodeBlock>API_KEY</CodeBlock></p>
                <p>3. Paste the Gemini API key you copied into the "Value" field.</p>
                <p>4. Ensure the variable is available in all environments (Production, Preview, and Development).</p>
                <p>5. Click "Save". You may need to redeploy your application for the change to take effect.</p>
            </Step>
        </Section>

        <Section icon={<GithubIcon />} title="Live Creator Settings (For Creators)">
            <p><strong>Who is this for?</strong> Creators who need to update their public-facing branding (name, logo, contact info) across all instances of the app without needing to change code or redeploy.</p>
            <p>This method uses a secret GitHub Gist as a live, remote configuration file. When you save changes in the dashboard, the app securely updates this Gist, and all users will see the new information on their next app reload.</p>
            
            <h4 className="font-semibold text-white mt-6 text-base">One-Time Setup Instructions:</h4>
            <Step num="1" title="Create a Secret GitHub Gist">
                <p>1. Go to <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">gist.github.com</a>.</p>
                <p>2. Create a new file named exactly <strong className="text-white">`creator_details.json`</strong>.</p>
                <p>3. Paste the following JSON structure into the file. You can customize the values later from the app's dashboard.</p>
                <CodeBlock>{`{
  "name": "Your Creator Name",
  "slogan": "Your awesome slogan here",
  "logoSrc": "https://your-logo-url.com/logo.png",
  "tel": "your-phone-number",
  "email": "your-email@example.com",
  "whatsapp": "https://wa.link/your-link",
  "whatsapp2": "https://wa.link/your-second-link"
}`}</CodeBlock>
                <p>4. <strong className="text-amber-300">CRITICAL:</strong> Before saving, click the "Create public gist" dropdown and change it to <strong className="text-white">"Create secret gist"</strong>. This ensures it's not publicly searchable.</p>
                <p>5. After saving, copy the <strong className="text-white">32-character ID</strong> from your browser's URL bar. This is your `GIST_ID`.</p>
                <Alert type="warning">
                    <strong>Use ONLY the ID, not the full URL.</strong> For example:
                    <br/>
                    If your URL is `https://gist.github.com/YourUsername/`<strong>`1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d`</strong>
                    <br/>
                    Your GIST_ID is just `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d`.
                </Alert>
            </Step>
            <Step num="2" title="Create a GitHub Personal Access Token (PAT)">
                <p>1. Go to GitHub Settings → Developer settings → Personal access tokens → <strong className="text-white">Tokens (classic)</strong>.</p>
                <p>2. Click "<strong className="text-white">Generate new token</strong>" and select "<strong className="text-white">Generate new token (classic)</strong>". Using a "Fine-grained" token will not work for this feature.</p>
                <p>3. Give it a descriptive name (e.g., "AI Tools Gist Updater").</p>
                <p>4. Set the expiration to "<strong className="text-white">No expiration</strong>" for long-term use.</p>
                <p>5. Under "Select scopes," check the single box next to the word <strong className="text-white">`gist`</strong>. This grants full control over Gists. No other scopes are needed.</p>
                <p>6. Click "<strong className="text-white">Generate token</strong>" and <strong className="text-red-400">immediately copy the token</strong>. This is your `GIST_PAT`.</p>
                <Alert type='warning'><strong className='text-amber-300'>Store this token securely!</strong> You will not be able to see it again after you leave the page.</Alert>
            </Step>
            <Step num="3" title="Set Environment Variables on Vercel">
                 <p>1. In your Vercel project dashboard, go to <strong className="text-white">Settings → Environment Variables</strong>.</p>
                 <p>2. Add the following three secrets. Make sure they are available in all environments.</p>
                 <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><CodeBlock>GIST_ID</CodeBlock> The 32-character ID from your Gist's URL.</li>
                    <li><CodeBlock>GIST_PAT</CodeBlock> The Personal Access Token you just generated (starts with `ghp_...`).</li>
                    <li><CodeBlock>CREATOR_PIN</CodeBlock> The PIN used for creator login (e.g., "1723j"). This is a safeguard.</li>
                 </ul>
                 <p>3. <strong className="text-white">Redeploy your project</strong> one last time to apply these variables. Now you can edit and save creator details live from the dashboard!</p>
            </Step>
            <div className="mt-6 space-y-4">
                <h4 className="text-xl font-bold text-red-400">Troubleshooting: Still Getting a "404 Not Found" Error?</h4>
                <Alert type="error">
                    <p>This error is frustrating, but it's almost always one of these simple issues. Please double-check each one carefully.</p>
                    <ul className="list-decimal list-inside space-y-3 pl-4 mt-3">
                        <li>
                            <strong className="text-white">Your `GIST_ID` is Incorrect.</strong> This is the most common cause.
                            <ul className="list-disc list-inside pl-4 mt-1 text-red-200/80">
                                <li>Verify the ID in Vercel <strong className="text-white">exactly</strong> matches your Gist URL.</li>
                                <li>Ensure you are using <strong className="text-white">only the 32-character ID</strong>, not the full `https://...` address.</li>
                            </ul>
                        </li>
                        <li>
                            <strong className="text-white">Your Personal Access Token (PAT) is wrong.</strong>
                             <ul className="list-disc list-inside pl-4 mt-1 text-red-200/80">
                                <li>Did you create a <strong className="text-white">"Classic"</strong> token? A "Fine-grained" token will not work.</li>
                                <li>Did you check the single <strong className="text-white">`gist`</strong> scope box? This is required to allow the app to modify the Gist. If you aren't sure, it's best to delete the old token and generate a new one.</li>
                            </ul>
                        </li>
                        <li>
                            <strong className="text-white">You Forgot to Redeploy on Vercel.</strong>
                             <ul className="list-disc list-inside pl-4 mt-1 text-red-200/80">
                                <li>Vercel <strong className="text-white">only</strong> applies new environment variables to new deployments. Go to your project's "Deployments" tab and trigger a new "Redeploy".</li>
                            </ul>
                        </li>
                    </ul>
                </Alert>
            </div>
        </Section>
        
        <Section icon={<ServerIcon />} title="Custom Sync Server (Advanced)">
            <p><strong>Who is this for?</strong> Advanced users or teams who want a centralized backend to sync data (notes, photos, recordings) between multiple users in real-time.</p>
            <p>This mode connects the app to a dedicated backend server that you host yourself. This is the most powerful option but requires technical knowledge to set up.</p>
            
            <Alert type="warning">
                <strong>Technical Requirement:</strong> This option requires deploying the app's source code to a hosting provider like Vercel and configuring several environment variables. You will need accounts for GitHub, Vercel, and Google AI Studio.
            </Alert>
            
            <h4 className="font-semibold text-white mt-6 text-base">Setup Instructions:</h4>
            <Step num="1" title="Fork the Repository & Deploy to Vercel">
                <p>1. Get the project source code by forking the official repository: <a href="https://github.com/jasonankeodendaal/Product-description-template" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Fork on GitHub</a>.</p>
                <p>2. Sign up or log in to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Vercel</a>.</p>
                <p>3. Create a new project and import your forked repository from GitHub.</p>
            </Step>
            <Step num="2" title="Configure All Environment Variables on Vercel">
                 <p>This is the most critical step. In your new Vercel project's dashboard (<strong className="text-white">Settings → Environment Variables</strong>), you must add ALL of the following variables:</p>
                  <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                    <li><CodeBlock>API_KEY</CodeBlock> Your Google Gemini API Key. (From Core Setup)</li>
                    <li><CodeBlock>API_SECRET_KEY</CodeBlock> A strong, random password you create. This secures your sync server from unauthorized access. Use a password generator.</li>
                    <li><CodeBlock>GIST_ID</CodeBlock> Your 32-character Gist ID. (From Live Creator Settings)</li>
                    <li><CodeBlock>GIST_PAT</CodeBlock> Your GitHub Personal Access Token. (From Live Creator Settings)</li>
                    <li><CodeBlock>CREATOR_PIN</CodeBlock> The creator login PIN. (From Live Creator Settings)</li>
                 </ul>
                 <p>Ensure all variables are available in Production, Preview, and Development environments.</p>
            </Step>
            <Step num="3" title="Deploy and Connect">
                <p>1. After saving the variables, trigger a new deployment from your Vercel project's "Deployments" tab.</p>
                <p>2. Once the deployment is complete, copy the main domain URL provided by Vercel (e.g., `https://your-project.vercel.app`).</p>
                <p>3. Open the deployed application, navigate to the <strong className="text-white">Dashboard → Data Management → API Settings</strong> tab.</p>
                <p>4. Paste your Vercel URL into the "<strong className="text-white">Custom API URL</strong>" field.</p>
                <p>5. Paste the `API_SECRET_KEY` you created into the "<strong className="text-white">Auth Key</strong>" field.</p>
                <p>6. Click "<strong className="text-white">Save Settings</strong>", then "<strong className="text-white">Connect</strong>". If successful, your app is now fully configured with a custom backend!</p>
            </Step>
        </Section>
    </div>
);
