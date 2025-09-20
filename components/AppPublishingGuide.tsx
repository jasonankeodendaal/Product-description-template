import React from 'react';
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
                    <li><strong className="text-white">Hosting:</strong> First, we need to put your app's code on the public internet so it has a live URL (e.g., `https://my-awesome-app.com`).</li>
                    <li><strong className="text-white">Packaging:</strong> Then, we'll use a free online tool called PWABuilder to wrap your live web app in a native Android "shell," creating an Android Studio project.</li>
                    <li><strong className="text-white">Building:</strong> Finally, you'll open this project in Android Studio (the official tool for Android development) to build the final APK file.</li>
                </ol>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 1: Deploying Your Web App</h3>
                 <div className="space-y-6">
                    <Step num="1" title="Download Your App's Source Code">
                        <p>The first step is to get a complete copy of the application's code. Click the button below to download a `.zip` file containing everything you need.</p>
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
                        <p>5. You'll need to add your API keys as Environment Variables in Vercel. Go to your new project's settings, find "Environment Variables", and add your `API_KEY` and `API_SECRET_KEY` just like you did in your local `.env` file.</p>
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
                         <p>You can customize app details like the package ID if you wish, but the defaults are fine to start. Click <strong className="text-white">"Download"</strong> to get a `.zip` file of your Android Studio project.</p>
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
};