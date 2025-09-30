import React, { useState, useEffect } from 'react';
import { GITHUB_APK_URL, SiteSettings } from '../constants';
import { AndroidIcon } from './icons/AndroidIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { Spinner } from './icons/Spinner';

interface CheckResult {
    name: string;
    url: string;
    status: 'pending' | 'success' | 'failure';
}

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


export const AppPublishingGuide: React.FC<{ siteSettings: SiteSettings }> = ({ siteSettings }) => {
    const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
    const [allChecksPassed, setAllChecksPassed] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const runChecks = async () => {
            setIsChecking(true);
            setAllChecksPassed(false);

            let urlsToCheck: {name: string, url: string}[] = [];

            // Add URLs from siteSettings
            if (siteSettings.logoSrc) urlsToCheck.push({ name: 'Site Logo', url: siteSettings.logoSrc });
            if (siteSettings.heroImageSrc) urlsToCheck.push({ name: 'Hero Image', url: siteSettings.heroImageSrc });
            if (siteSettings.backgroundImageSrc) urlsToCheck.push({ name: 'Background Image', url: siteSettings.backgroundImageSrc });
            if (siteSettings.creator.logoSrc) urlsToCheck.push({ name: 'Creator Logo', url: siteSettings.creator.logoSrc });
            
            // Add URLs from manifest.json
            try {
                const response = await fetch('/manifest.json');
                const manifest = await response.json();
                
                (manifest.icons || []).forEach((icon: any) => urlsToCheck.push({ name: `Manifest Icon (${icon.sizes})`, url: icon.src }));
                (manifest.screenshots || []).forEach((ss: any) => urlsToCheck.push({ name: `Screenshot (${ss.form_factor})`, url: ss.src }));
                (manifest.shortcuts || []).forEach((sc: any) => {
                    if (sc.icons) {
                        sc.icons.forEach((icon: any) => urlsToCheck.push({ name: `Shortcut Icon (${sc.name})`, url: icon.src }))
                    }
                });

            } catch (e) {
                console.error("Failed to fetch or parse manifest.json", e);
                setCheckResults([{ name: 'manifest.json', url: '/manifest.json', status: 'failure' }]);
                setIsChecking(false);
                return;
            }
            
            // Deduplicate URLs
            const uniqueUrls = Array.from(new Map(urlsToCheck.map(item => [item.url, item])).values());
            const initialResults = uniqueUrls.map(item => ({...item, status: 'pending' as 'pending' }));
            setCheckResults(initialResults);

            let allPassed = true;
            for (let i = 0; i < uniqueUrls.length; i++) {
                const item = uniqueUrls[i];
                let status: 'success' | 'failure' = 'failure';
                try {
                    const response = await fetch(item.url, { method: 'HEAD', mode: 'cors' });
                    if (response.ok) {
                        status = 'success';
                    } else {
                        allPassed = false;
                    }
                } catch (e) {
                    allPassed = false;
                }
                setCheckResults(prev => prev.map((res, index) => index === i ? { ...res, status } : res));
            }
            
            setAllChecksPassed(allPassed);
            setIsChecking(false);
        };
        
        runChecks();
    }, [siteSettings]);

    const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${window.location.origin}`;

    return (
        <div className="space-y-12 text-sm leading-relaxed animate-fade-in-down max-w-4xl">
            <section>
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Android App Publishing Tool</h2>
                <p className="mt-2 text-[var(--theme-text-secondary)]">
                    This tool guides you through packaging your Progressive Web App (PWA) into an Android App Bundle (.aab) suitable for the Google Play Store.
                </p>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Part 1: Pre-flight Check</h3>
                <p className="mb-4 text-gray-400">Before packaging, we need to ensure all required images and icons are accessible online. This check prevents common build failures. A broken link for a shortcut icon, for example, will cause the build to fail.</p>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 max-h-60 overflow-y-auto">
                    {isChecking && checkResults.length === 0 && (
                        <div className="flex items-center justify-center p-4 gap-2 text-gray-400"><Spinner /> Preparing checks...</div>
                    )}
                    <ul className="space-y-2">
                        {checkResults.map(result => (
                             <li key={result.url} className="flex items-center justify-between text-xs">
                                <span className="text-gray-300 truncate pr-4">{result.name}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-400 underline truncate max-w-[150px]">{result.url}</a>
                                    {result.status === 'pending' ? <Spinner className="w-4 h-4 text-gray-500" />
                                     : result.status === 'success' ? <CheckIcon className="w-5 h-5 text-green-500" />
                                     : <XIcon className="w-5 h-5 text-red-500" />
                                    }
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {!isChecking && !allChecksPassed && (
                    <div className="mt-4">
                        <Alert type="warning">
                            <strong>Check Failed:</strong> One or more resources could not be reached. Please fix the broken URLs and reload this page to try again. PWABuilder will fail if these links are broken.
                        </Alert>
                        <div className="mt-4 bg-red-900/20 p-4 rounded-md border border-red-500/30">
                            <h4 className="font-semibold text-red-400">Failed Resources:</h4>
                            <ul className="mt-2 space-y-1 text-xs list-disc list-inside text-red-300">
                                {checkResults.filter(r => r.status === 'failure').map(result => (
                                    <li key={result.url}>
                                        <strong className="text-red-200">{result.name}:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline break-all hover:text-white">{result.url}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </section>

            <section>
                 <h3 className="text-xl font-bold text-white mb-4">Part 2: Package Your App</h3>
                 <p className="mb-4 text-gray-400">Once all checks pass, you can proceed to PWABuilder to generate your Android project files.</p>
                 <a 
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-orange-600 text-black font-bold py-3 px-5 rounded-md text-sm inline-flex items-center gap-2 transition-all
                        ${!allChecksPassed || isChecking ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-orange-500'}`}
                 >
                    Go to PWABuilder to Package App
                </a>
            </section>

             <section>
                <h3 className="text-xl font-bold text-white mb-4">Part 3: Build & Sign in Android Studio</h3>
                <p className="mb-4 text-gray-400">After downloading the project from PWABuilder, follow these final steps:</p>
                <Step num="1" title="Open the Project">
                    <p>Unzip the downloaded file and open the folder in Android Studio using <strong className="text-white">File &gt; Open</strong>. Wait for the initial "Gradle Sync" to complete.</p>
                </Step>
                <Step num="2" title="Generate Signed Bundle">
                    <p>Go to <strong className="text-white">Build &gt; Generate Signed Bundle / APK...</strong>, select "Android App Bundle", and follow the wizard to create a new keystore. <strong className="text-red-400">Back up this keystore file and its passwords securely!</strong></p>
                </Step>
                 <Step num="3" title="Build">
                    <p>Select the <strong className="text-white">`release`</strong> build variant. Android Studio will then build the final `.aab` file, which you can upload to the Google Play Store.</p>
                </Step>
            </section>
        </div>
    );
};