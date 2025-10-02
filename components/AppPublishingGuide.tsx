import React, { useState, useEffect } from 'react';
import { GITHUB_APK_URL, SiteSettings, CreatorDetails } from '../constants';
import { AndroidIcon } from './icons/AndroidIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { Spinner } from './icons/Spinner';

interface CheckResult {
    name: string;
    url: string;
    status: 'pending' | 'success' | 'failure';
    source: 'siteSettings' | 'creatorDetails' | 'manifest';
}

const Step: React.FC<{ num: string; title: string; children: React.ReactNode; }> = ({ num, title, children }) => (
    <div className="pt-4">
        <h4 className="text-md font-semibold text-[var(--theme-text-primary)] mb-2">Step {num}: {title}</h4>
        <div className="pl-4 border-l-2 border-[var(--theme-border)]/50 space-y-3 text-[var(--theme-text-secondary)] text-sm">
            {children}
        </div>
    </div>
);

const Alert: React.FC<{ type: 'info' | 'warning' | 'tip' | 'error', children: React.ReactNode }> = ({ type, children }) => {
    const colors = {
        info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        tip: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
        error: 'border-red-500/30 bg-red-900/50 text-red-300',
    }
    return (
        <div className={`p-4 rounded-lg border ${colors[type]}`}>
            <p className="text-sm">{children}</p>
        </div>
    )
};

const getFixInstruction = (source: CheckResult['source'], name: string): React.ReactNode => {
    const iconName = <span className="text-green-400 font-semibold">({name})</span>;
    switch (source) {
        case 'siteSettings':
            return <>In the app, go to <strong className="text-white">Dashboard &gt; Site Settings &gt; Company Details (Local)</strong> and update the corresponding image URL {iconName}.</>;
        case 'creatorDetails':
             return <>In the app, go to <strong className="text-white">Dashboard &gt; Site Settings &gt; Creator Details (Global)</strong> and update the logo URL {iconName}.</>;
        case 'manifest':
            return <>This URL for {iconName} is defined in the <strong className="text-white">`/manifest.json`</strong> file in the project's root directory. You must update the URL in the source code and redeploy the application.</>;
        default:
            return <>Check the application configuration for this URL {iconName}.</>;
    }
};


export const AppPublishingGuide: React.FC<{ siteSettings: SiteSettings, creatorDetails: CreatorDetails }> = ({ siteSettings, creatorDetails }) => {
    const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
    const [failedChecks, setFailedChecks] = useState<CheckResult[]>([]);
    const [allChecksPassed, setAllChecksPassed] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const runChecks = async () => {
            setIsChecking(true);
            setAllChecksPassed(false);
            setFailedChecks([]);

            let urlsToCheck: {name: string, url: string, source: CheckResult['source']}[] = [];

            // Add URLs from siteSettings
            if (siteSettings.logoSrc) urlsToCheck.push({ name: 'Site Logo', url: siteSettings.logoSrc, source: 'siteSettings' });
            if (siteSettings.heroImageSrc) urlsToCheck.push({ name: 'Hero Image', url: siteSettings.heroImageSrc, source: 'siteSettings' });
            if (siteSettings.backgroundImageSrc) urlsToCheck.push({ name: 'Background Image', url: siteSettings.backgroundImageSrc, source: 'siteSettings' });
            if (creatorDetails.logoSrc) urlsToCheck.push({ name: 'Creator Logo', url: creatorDetails.logoSrc, source: 'creatorDetails' });
            
            // Add URLs from manifest.json
            try {
                const response = await fetch('/manifest.json');
                const manifest = await response.json();
                
                (manifest.icons || []).forEach((icon: any) => urlsToCheck.push({ name: `Manifest Icon (${icon.sizes})`, url: icon.src, source: 'manifest' }));
                (manifest.screenshots || []).forEach((ss: any) => urlsToCheck.push({ name: `Screenshot (${ss.form_factor})`, url: ss.src, source: 'manifest' }));
                (manifest.shortcuts || []).forEach((sc: any) => {
                    if (sc.icons) {
                        sc.icons.forEach((icon: any) => urlsToCheck.push({ name: `Shortcut Icon (${sc.name})`, url: icon.src, source: 'manifest' }))
                    }
                });

            } catch (e) {
                console.error("Failed to fetch or parse manifest.json", e);
                const manifestFailure: CheckResult = { name: 'manifest.json', url: '/manifest.json', status: 'failure', source: 'manifest' };
                setCheckResults([manifestFailure]);
                setFailedChecks([manifestFailure]);
                setIsChecking(false);
                return;
            }
            
            const uniqueUrls = Array.from(new Map(urlsToCheck.map(item => [item.url, item])).values());
            const initialResults: CheckResult[] = uniqueUrls.map(item => ({...item, status: 'pending' as 'pending' }));
            setCheckResults(initialResults);

            const failures: CheckResult[] = [];
            let allPassed = true;

            const checkPromises = uniqueUrls.map(async (item): Promise<CheckResult> => {
                 try {
                    const response = await fetch(`${item.url}?t=${new Date().getTime()}`, { method: 'HEAD', mode: 'cors' });
                    if (response.ok) {
                        return { ...item, status: 'success' };
                    } else {
                        allPassed = false;
                        const failure: CheckResult = { ...item, status: 'failure' };
                        failures.push(failure);
                        return failure;
                    }
                } catch (e) {
                    allPassed = false;
                    const failure: CheckResult = { ...item, status: 'failure' };
                    failures.push(failure);
                    return failure;
                }
            });

            const results = await Promise.all(checkPromises);
            
            setCheckResults(results.sort((a,b) => a.name.localeCompare(b.name)));
            setFailedChecks(failures);
            setAllChecksPassed(allPassed);
            setIsChecking(false);
        };
        
        runChecks();
    }, [siteSettings, creatorDetails]);

    const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${window.location.origin}`;

    return (
        <div className="space-y-12 text-sm leading-relaxed animate-fade-in-down max-w-4xl">
            <section>
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Android App Publishing Guide</h2>
                <p className="mt-2 text-[var(--theme-text-secondary)]">
                    This guide provides a detailed walkthrough for packaging your Progressive Web App (PWA) into an Android App Bundle (.aab) ready for the Google Play Store.
                </p>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Part 1: Pre-flight Check</h3>
                <p className="mb-4 text-gray-400">Before packaging, this automated check verifies that all icons, screenshots, and other assets defined in your app's configuration are accessible online. A broken link here will cause the final build to fail.</p>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 max-h-60 overflow-y-auto">
                    {isChecking && checkResults.length === 0 && <div className="flex items-center justify-center p-4 gap-2 text-gray-400"><Spinner /> Preparing checks...</div>}
                    <ul className="space-y-2">{checkResults.map(result => (<li key={result.url + result.name} className="flex items-center justify-between text-xs"><span className="text-gray-300 truncate pr-4">{result.name}</span><div className="flex items-center gap-2 flex-shrink-0"><a href={result.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-400 underline truncate max-w-[150px]">{result.url}</a>{result.status === 'pending' ? <Spinner className="w-4 h-4 text-gray-500" /> : result.status === 'success' ? <CheckIcon className="w-5 h-5 text-green-500" /> : <XIcon className="w-5 h-5 text-red-500" />}</div></li>))}</ul>
                </div>
                {!isChecking && !allChecksPassed && (
                    <div className="mt-4"><Alert type="error"><strong>Check Failed:</strong> One or more resources are inaccessible. The build process will fail if these links are broken. Please fix the URLs below and reload this page to re-run the check.</Alert>
                        <div className="mt-4 bg-red-900/20 p-4 rounded-md border border-red-500/30"><h4 className="font-semibold text-red-400">Failed Resources & How to Fix:</h4><ul className="mt-2 space-y-3 text-sm list-disc list-inside text-red-300">{failedChecks.map(result => (<li key={result.url + result.name}><p><strong className="text-red-200">{result.name}:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline break-all hover:text-white">{result.url}</a></p><p className="mt-1 text-xs text-amber-300 pl-4 border-l-2 border-amber-500/50"><strong className="text-amber-200">Fix:</strong> {getFixInstruction(result.source, result.name)}</p></li>))}</ul></div>
                    </div>
                )}
            </section>

            <section><h3 className="text-xl font-bold text-white mb-4">Part 2: Generate Android Project</h3>
                 <p className="mb-4 text-gray-400">Once all checks pass, use Microsoft's PWABuilder to wrap your web app in a native Android shell. This process is fully automated.</p>
                 <Step num="1" title="Go to PWABuilder">
                    <p>Click the button below to open PWABuilder with your app's URL pre-filled. It will analyze your PWA's manifest and service worker.</p>
                     <a href={pwaBuilderUrl} target="_blank" rel="noopener noreferrer" className={`mt-2 bg-orange-600 text-black font-bold py-3 px-5 rounded-md text-sm inline-flex items-center gap-2 transition-all ${!allChecksPassed || isChecking ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-orange-500'}`}>Go to PWABuilder to Package App</a>
                 </Step>
                 <Step num="2" title="Package for Android">
                    <p>On the PWABuilder results page, click <strong className="text-white">"Package for Stores"</strong>. Then, on the next page, find the <strong className="text-white">Android</strong> platform and click <strong className="text-white">"Generate package"</strong>. You can leave all the default options as they are.</p>
                 </Step>
                 <Step num="3" title="Download the Project">
                    <p>The generation process may take a few minutes. Once complete, a <strong className="text-white">"Download package"</strong> button will appear. Click it to download a `.zip` file containing the complete Android Studio project.</p>
                 </Step>
            </section>

             <section>
                <h3 className="text-xl font-bold text-white mb-4">Part 3: Build & Sign in Android Studio</h3>
                <p className="mb-4 text-gray-400">This is the final technical step, where you compile the project and digitally sign it with your unique developer key.</p>
                 <Step num="1" title="Open the Project in Android Studio">
                    <p>1. Make sure you have <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Android Studio</a> installed.</p>
                    <p>2. Unzip the file you downloaded from PWABuilder.</p>
                    <p>3. In Android Studio, go to <strong className="text-white">File &gt; Open</strong> and select the unzipped project folder. Wait for the initial "Gradle Sync" to finish. This can take several minutes.</p>
                </Step>
                <Step num="2" title="Generate a Signed App Bundle">
                    <p>An App Bundle is the format you upload to the Play Store. It must be digitally signed to prove you are the authentic developer.</p>
                    <Alert type="warning"><strong>CRITICAL:</strong> You will now create a <strong className="text-white">signing key (keystore file)</strong>. You MUST back up this file and its passwords securely. If you lose it, you will <strong className="text-red-400">NEVER</strong> be able to update your app on the Google Play Store again.</Alert>
                    <p className="mt-3">1. In the top menu, go to <strong className="text-white">Build &gt; Generate Signed Bundle / APK...</strong></p>
                    <p>2. Select <strong className="text-white">Android App Bundle</strong> and click Next.</p>
                    <p>3. Under "Key store path", click <strong className="text-white">"Create new..."</strong>.</p>
                    <p>4. Fill out the "New Key Store" form:</p>
                    <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                        <li><strong>Key store path:</strong> Click the folder icon and save the `.jks` file somewhere safe <strong className="text-amber-300">OUTSIDE</strong> of your project folder (e.g., in your Documents).</li>
                        <li><strong>Passwords:</strong> Create and confirm strong passwords for the keystore and the key. Store these with your `.jks` file.</li>
                        <li><strong>Key alias:</strong> Give your key a name, like "upload-key".</li>
                        <li><strong>Validity (years):</strong> Set this to 25 or higher.</li>
                        <li><strong>Certificate:</strong> Fill in at least your name and organization.</li>
                    </ul>
                     <p>5. After creating the key, ensure the form is filled with your new keystore path, passwords, and alias. Click Next.</p>
                     <p>6. Select <strong className="text-white">`release`</strong> as the build variant and click <strong className="text-white">"Finish"</strong>.</p>
                </Step>
                 <Step num="3" title="Locate Your App Bundle">
                    <p>Android Studio will start building. When it's done, a notification will appear. Click <strong className="text-white">"locate"</strong> in the notification to open the folder containing your app bundle. The file will be named <strong className="text-white">`app-release.aab`</strong> and located in `[project-folder]/app/release/`.</p>
                </Step>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Part 4: Upload to Google Play Store</h3>
                 <p className="mb-4 text-gray-400">You're on the home stretch! The final step is uploading your `.aab` file to your developer account.</p>
                 <Step num="1" title="Prepare Your Store Listing">
                    <p>1. If you don't have one, create a <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Play Developer account</a> (this has a one-time $25 fee).</p>
                    <p>2. In the Play Console, create a new app. Fill out all the required store listing details: app name, descriptions, screenshots, privacy policy, etc.</p>
                 </Step>
                  <Step num="2" title="Upload and Roll Out">
                    <p>1. Navigate to a release track (e.g., "Internal testing" is a good place to start).</p>
                    <p>2. Click <strong className="text-white">"Create new release"</strong> and upload your <strong className="text-white">`app-release.aab`</strong> file.</p>
                    <p>3. Give your release a name and add release notes.</p>
                    <p>4. Click <strong className="text-white">"Save"</strong>, then <strong className="text-white">"Review release"</strong>, and finally <strong className="text-white">"Start roll-out"</strong>.</p>
                    <p>Google will review your app, which can take anywhere from a few hours to several days. Congratulations, you've submitted your app!</p>
                 </Step>
            </section>
        </div>
    );
};