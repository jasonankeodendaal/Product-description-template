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


interface AppPublishingGuideProps {
    onDownloadSource: () => void;
}

export const AppPublishingGuide: React.FC<AppPublishingGuideProps> = ({ onDownloadSource }) => {
    return (
        <div className="space-y-12 text-sm leading-relaxed animate-fade-in-down max-w-4xl">
            <section>
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Publishing Your App to Android</h2>
                <p className="mt-2 text-[var(--theme-text-secondary)]">
                    This guide provides a complete walkthrough for packaging your Progressive Web App (PWA) into an Android App Bundle (AAB) file. This file can be installed directly on Android devices or submitted to the Google Play Store. We will use free, industry-standard tools for this process.
                </p>
            </section>

            <Alert type="info">
                <strong>The Big Picture:</strong> A web app can't magically become an app file on its own. The process involves three main stages:
                 <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li><strong className="text-white">Hosting:</strong> First, we need to put your app's code on the public internet so it has a live URL (e.g., `https://my-awesome-app.com`).</li>
                    <li><strong className="text-white">Packaging:</strong> Then, we'll use a free online tool (PWABuilder) to wrap your live web app in a native Android "shell," creating an Android Studio project.</li>
                    <li><strong className="text-white">Building:</strong> Finally, you'll open this project in Android Studio (the official tool for Android development) to build the final, signed app file.</li>
                </ol>
            </Alert>
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Prerequisites</h3>
                <p className="mb-4 text-gray-400">Before you begin, make sure you have the following ready:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-3"><span className="text-orange-400 text-2xl">✅</span> <div><strong className="text-white">A Vercel Account:</strong> We'll use this for free, high-performance hosting. Sign up at <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">vercel.com</a>.</div></li>
                    <li className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-3"><span className="text-orange-400 text-2xl">✅</span> <div><strong className="text-white">A Google Gemini API Key:</strong> To power the AI features. Get one from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google AI Studio</a>.</div></li>
                    <li className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-3"><span className="text-orange-400 text-2xl">✅</span> <div><strong className="text-white">An `API_SECRET_KEY`:</strong> This is a strong password you create yourself to protect your app's AI functions.</div></li>
                    <li className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-3"><span className="text-orange-400 text-2xl">✅</span> <div><strong className="text-white">Android Studio:</strong> The official software for building Android apps. Download it from the <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">official website</a>.</div></li>
                </ul>
            </section>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 1: Deploying Your Web App to Vercel</h3>
                 <div className="space-y-6">
                    <Step num="1" title="Download Your App's Source Code">
                        <p>The first step is to get a complete copy of the application's code. Click the button below to download a `.zip` file containing everything you need.</p>
                        <button onClick={onDownloadSource} className="bg-[var(--theme-orange)] hover:opacity-90 text-black font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center gap-2">
                            <DownloadIcon /> Download Source Code (.zip)
                        </button>
                    </Step>
                    
                    <Step num="2" title="Deploy via Drag-and-Drop">
                        <p>1. Unzip the source code you downloaded in Step 1.</p>
                        <p>2. On your Vercel dashboard, click "Add New... &gt; Project".</p>
                        <p>3. Vercel will prompt you to connect a Git repository. Instead, find the option to <strong className="text-white">"Deploy a Project from Your Computer"</strong> (you may need to scroll down) and drag your unzipped folder into the browser window.</p>
                        <p>4. Vercel will analyze the folder. You don't need to change any build settings. Just click <strong className="text-white">"Deploy"</strong>.</p>
                    </Step>

                    <Step num="3" title="Add Environment Variables (Crucial!)">
                        <p>Your deployed app needs your secret keys to function. Without them, the AI features and Google Drive sync will fail.</p>
                        <p>1. After deploying, go to your new project's dashboard on Vercel.</p>
                        <p>2. Click the <strong className="text-white">"Settings"</strong> tab, then <strong className="text-white">"Environment Variables"</strong> on the left.</p>
                        <p>3. Create the following variables:</p>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">API_KEY</code>, <strong>Value:</strong> Paste your Google Gemini API Key here.</li>
                            <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">API_SECRET_KEY</code>, <strong>Value:</strong> Paste the strong password you created.</li>
                            <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">GOOGLE_CLIENT_ID</code>, <strong>Value:</strong> Your Client ID for Google Drive sync (if configured).</li>
                            <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">GOOGLE_CLIENT_SECRET</code>, <strong>Value:</strong> Your Client Secret for Google Drive sync (if configured).</li>
                            <li><strong>Key:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">NEXTAUTH_URL</code>, <strong>Value:</strong> Your full Vercel app URL (e.g., <code className="bg-black/30 px-1 py-0.5 rounded text-xs">https://your-project-name.vercel.app</code>).</li>
                        </ul>
                        <p>4. After adding them, you must <strong className="text-white">re-deploy</strong> the app for the changes to take effect. Go to the "Deployments" tab, click the latest one, and find the "Redeploy" option in the menu (...).</p>
                    </Step>
                     <Step num="4" title="Get Your Public URL">
                        <p>Once redeployed, Vercel will give you a public URL, like <code className="bg-black/30 px-1 py-0.5 rounded text-xs">https://your-project-name.vercel.app</code>. Visit this URL and test the AI generator to ensure your keys are working. Copy this URL for the next part.</p>
                    </Step>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 2: Packaging with PWABuilder</h3>
                <div className="space-y-6">
                    <Step num="1" title="Analyze Your App in PWABuilder">
                        <p>PWABuilder is a free tool from Microsoft that helps package PWAs for app stores. Open <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-orange)] hover:underline">www.pwABuilder.com</a> in your browser.</p>
                        <p>Paste the public URL you got from Vercel into the input box and click <strong className="text-white">"Start"</strong>.</p>
                    </Step>
                    <Step num="2" title="Configure Android App Options">
                        <p>PWABuilder will analyze your app. Once it's done, find the "Package for Stores" section and click the <strong className="text-white">"Generate"</strong> button under the Android logo.</p>
                        <p>You'll see several options. The most important is the <strong className="text-white">Package ID</strong>. This is your app's unique identifier on the Play Store. It's conventionally formatted like <code className="bg-black/30 px-1 py-0.5 rounded text-xs">com.yourcompany.appname</code>. Change this to something unique.</p>
                        <Alert type="warning"><strong>Important:</strong> Once you publish to the Google Play Store, you can <strong className="text-amber-200">never change the Package ID</strong> for that app again. Choose it carefully.</Alert>
                    </Step>
                     <Step num="3" title="Download the Android Project">
                        <p>After reviewing the options, click <strong className="text-white">"Download"</strong> to get a `.zip` file. This zip contains a complete Android Studio project that is pre-configured to wrap your live web app.</p>
                    </Step>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">Part 3: Building the App in Android Studio</h3>
                 <div className="space-y-6">
                     <Step num="1" title="Open the Project">
                        <p>1. Unzip the file you downloaded from PWABuilder.</p>
                        <p>2. Open Android Studio.</p>
                        <p>3. Go to <strong className="text-white">File &gt; Open</strong> (do not choose "New" or "Import").</p>
                        <p>4. Navigate to and select the unzipped folder. Android Studio will then load and sync the project. This is called a <strong className="text-white">"Gradle Sync"</strong> and can take several minutes the first time. Let it finish completely.</p>
                    </Step>
                    <Step num="2" title="Generate a Production Signing Key">
                         <p>To publish on the Play Store, your app must be cryptographically signed. This proves you are the legitimate developer.</p>
                         <p>1. In the Android Studio menu, go to <strong className="text-white">Build &gt; Generate Signed Bundle / APK...</strong></p>
                         <p>2. Select <strong className="text-white">Android App Bundle</strong> and click Next.</p>
                         <p>3. In the "Key store path" field, click <strong className="text-white">"Create new..."</strong></p>
                         <p>4. Choose a location to save your key file (e.g., a secure personal folder). Give it a name like <code className="bg-black/30 px-1 py-0.5 rounded text-xs">my-app-key.jks</code>. Fill in the passwords for the keystore and the key. Also, provide an "Alias" (e.g., `app_release_key`). Complete the certificate information (only "First and Last Name" is required).</p>
                        <Alert type="warning"><strong>CRITICAL:</strong> You <strong className="text-amber-200">MUST</strong> back up this `.jks` file and save your passwords securely. If you lose this key, you will <strong className="text-amber-200">NEVER</strong> be able to update your app on the Play Store again. No exceptions.</Alert>
                         <p>5. After creating the key, Android Studio will return you to the previous dialog. Click <strong className="text-white">"Cancel"</strong> for now. We have the key file, now we need to tell the project how to use it.</p>
                    </Step>
                     <Step num="3" title="Configure Gradle for Signing">
                        <p>1. In the Project pane on the left, make sure you are in "Android" view.</p>
                        <p>2. Expand the <strong className="text-white">"Gradle Scripts"</strong> section and double-click on <strong className="text-white">`build.gradle (Module :app)`</strong> to open it.</p>
                        <p>3. Scroll to the bottom of the file. Inside the <code>android {'{}'}</code> block, paste the following code, replacing the placeholder values with your own details. (It's often best to place this right before the closing <code>{'}'}</code> of the <code>android</code> block).</p>
                        <CodeBlock>
{
[
'    // Add this block to sign your app for release',
'    signingConfigs {',
'        release {',
"            storeFile file('C:/path/to/your/my-app-key.jks') // Use absolute path or relative path from app folder",
"            storePassword 'your_keystore_password'",
"            keyAlias 'your_key_alias'",
"            keyPassword 'your_key_password'",
'        }',
'    }',
'    buildTypes {',
'        release {',
'            signingConfig signingConfigs.release',
'        }',
'    }',
].join('\\n')
}
                        </CodeBlock>
                         <p>4. A yellow bar will appear at the top of the editor. Click <strong className="text-white">"Sync Now"</strong> to apply the changes.</p>
                    </Step>
                     <Step num="4" title="Build the Production App Bundle (AAB)">
                        <p>Now you're ready to build the final file for the Play Store.</p>
                        <p>1. Go back to <strong className="text-white">Build &gt; Generate Signed Bundle / APK...</strong></p>
                        <p>2. Select <strong className="text-white">Android App Bundle</strong> and click Next.</p>
                        <p>3. Android Studio should now have your keystore information pre-filled. Click Next.</p>
                        <p>4. Select <strong className="text-white">`release`</strong> as the build variant and click <strong className="text-white">"Create"</strong>.</p>
                        <p>Android Studio will build your app. When it's finished, a notification will appear.</p>
                    </Step>
                    <Step num="5" title="Locate Your AAB File">
                        <p>In the notification, click the <strong className="text-white">"locate"</strong> link. This will open your computer's file explorer to the release folder.</p>
                        <p>The file you need is <code className="bg-black/30 px-1 py-0.5 rounded text-xs">app-release.aab</code>. This is the file you will upload to the Google Play Store!</p>
                    </Step>
                </div>
            </div>
             <section>
                <h3 className="text-xl font-bold text-white mb-4">Part 4: Next Steps</h3>
                <Alert type="tip">
                    You've successfully built a release-ready Android App Bundle. The final step is to create a developer account on the <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Play Console</a> (this has a one-time fee), create a new app listing, and upload your `.aab` file.
                </Alert>
            </section>
        </div>
    );
};