import React from 'react';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { CloudIcon } from './icons/CloudIcon';

interface AboutThisAppProps {
    onNavigateToSetup: () => void;
}

export const AboutThisApp: React.FC<AboutThisAppProps> = ({ onNavigateToSetup }) => {
    // Helper components scoped to AboutThisApp
    const CloudOfflineIcon: React.FC = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--theme-yellow)]">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            <path d="m2 2 20 20"/>
        </svg>
    );

    const ShieldIcon: React.FC = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--theme-yellow)]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    );

    const GearsIcon: React.FC = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--theme-yellow)]">
            <style>{`
                @keyframes rotate-gear-fast { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes rotate-gear-slow { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
                .gear-fast { animation: rotate-gear-fast 8s linear infinite; transform-origin: center; }
                .gear-slow { animation: rotate-gear-slow 12s linear infinite; transform-origin: center; }
            `}</style>
            <g className="gear-slow"><circle cx="14.5" cy="14.5" r="3.5" /><path d="M14.5 11v-1 M14.5 21v-1 M18 14.5h1 M11 14.5h-1 M16.9 12.1l.7-.7 M12.1 16.9l-.7.7 M12.1 12.1l-.7-.7 M16.9 16.9l.7.7"/></g>
            <g className="gear-fast"><circle cx="8" cy="8" r="4" /><path d="M8 4V3 M8 13v-1 M12 8h1 M4 8H3 M10.8 5.2l.7-.7 M5.2 10.8l-.7.7 M5.2 5.2l-.7-.7 M10.8 10.8l.7.7"/></g>
        </svg>
    );
    
    const PrincipleCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
        <div className="bg-[var(--theme-card-bg)]/20 p-4 rounded-lg border border-[var(--theme-border)]/30 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center">{icon}</div>
            <h4 className="mt-2 font-semibold text-[var(--theme-text-primary)]">{title}</h4>
            <p className="mt-1 text-sm text-[var(--theme-text-secondary)]">{children}</p>
        </div>
    );
    
    // FIX: Defined InfoCard component to resolve reference errors.
    const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
        <div className="bg-[var(--theme-card-bg)]/50 p-6 rounded-lg border border-[var(--theme-border)]/50">
           <div className="flex items-center gap-3 mb-3">
               <div className="text-[var(--theme-yellow)] w-6 h-6">{icon}</div>
               <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">{title}</h3>
           </div>
           <div className="space-y-2 text-sm text-[var(--theme-text-secondary)]">
               {children}
           </div>
       </div>
   );

     const CheckmarkIcon: React.FC = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--theme-green)] flex-shrink-0">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );

    const animatedIcons = {
        engine: (<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <style>{`
                @keyframes rotate { to { transform: rotate(360deg); } }
                @keyframes rotate-rev { to { transform: rotate(-360deg); } }
                @keyframes hologram-pulse { 
                    0%, 100% { opacity: 0.6; transform: scale(1); } 
                    50% { opacity: 1; transform: scale(1.03); } 
                }
                @keyframes data-stream { 
                    to { stroke-dashoffset: -100; } 
                }
        
                .gear-1 { animation: rotate 15s linear infinite; transform-origin: center; }
                .gear-2 { animation: rotate-rev 10s linear infinite; transform-origin: center; }
                .hologram { animation: hologram-pulse 4s ease-in-out infinite; transform-origin: center; }
                .stream { 
                    stroke-dasharray: 5 5; 
                    animation: data-stream 2s linear infinite;
                }
            `}</style>
            <defs>
                <radialGradient id="holo-grad-engine" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--theme-yellow)" stopOpacity="1" />
                    <stop offset="80%" stopColor="var(--theme-yellow)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--theme-blue)" stopOpacity="0.1" />
                </radialGradient>
                <filter id="holo-glow-engine" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <path id="brain-path-engine" d="M100,50 C75,50 60,65 60,85 C60,105 70,120 85,130 C90,135 90,145 100,145 C110,145 110,135 115,130 C130,120 140,105 140,85 C140,65 125,50 100,50 Z M80,80 C75,85 75,95 80,100 M120,80 C125,85 125,95 120,100 M90,70 Q100,80,110,70 M90,115 Q100,105,110,115 M100,75 V 125" />
                <clipPath id="brain-clip-engine">
                    <use href="#brain-path-engine" />
                </clipPath>
            </defs>
            <g opacity="0.15" stroke="var(--theme-border)" strokeWidth="1.5">
                <g className="gear-1" transform="translate(70 130)">
                    <circle r="25" fill="none"/>
                    <path d="M0,25 L0,28 M0,-25 L0,-28 M25,0 L28,0 M-25,0 L-28,0 M17.7,17.7 L19.8,19.8 M-17.7,-17.7 L-19.8,-19.8 M17.7,-17.7 L19.8,-19.8 M-17.7,17.7 L-19.8,19.8" strokeLinecap="round"/>
                </g>
                <g className="gear-2" transform="translate(130 70)">
                    <circle r="18" fill="none"/>
                    <path d="M0,18 L0,20 M0,-18 L0,-20 M18,0 L20,0 M-18,0 L-20,0 M12.7,12.7 L14.1,14.1 M-12.7,-12.7 L-14.1,-14.1 M12.7,-12.7 L14.1,-14.1 M-12.7,12.7 L-14.1,14.1" strokeLinecap="round"/>
                </g>
            </g>
            <g fill="none" stroke="var(--theme-yellow)" strokeWidth="1.5" opacity="0.5">
                <path className="stream" d="M30,150 C 50,100 80,80 95,90" />
                <path className="stream" style={{ animationDelay: '-0.5s' } as React.CSSProperties} d="M170,150 C 150,100 120,80 105,90" />
                <path className="stream" style={{ animationDelay: '-1s' } as React.CSSProperties} d="M30,50 C 50,80 80,90 95,100" />
                <path className="stream" style={{ animationDelay: '-1.5s' } as React.CSSProperties} d="M170,50 C 150,80 120,90 105,100" />
            </g>
            <g className="hologram" filter="url(#holo-glow-engine)">
                <use href="#brain-path-engine" fill="url(#holo-grad-engine)" />
                <use href="#brain-path-engine" fill="none" stroke="var(--theme-yellow)" strokeWidth="2" strokeOpacity="0.8" />
                <g stroke="var(--theme-blue)" strokeWidth="1" strokeOpacity="0.3" clipPath="url(#brain-clip-engine)">
                    <path d="M60 80 H 140" />
                    <path d="M60 90 H 140" />
                    <path d="M60 100 H 140" />
                    <path d="M60 110 H 140" />
                    <path d="M60 120 H 140" />
                </g>
            </g>
        </svg>),
        recorder: (<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><style>{`@keyframes wave{0%,100%{d:path("M50 100 C 70 100, 80 100, 100 100 S 130 100, 150 100")}50%{d:path("M50 100 C 70 80, 80 120, 100 100 S 130 80, 150 100")}}}.wave{animation:wave 2s ease-in-out infinite}`}</style><defs><linearGradient id="mic-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9E2D5"/><stop offset="100%" stopColor="#78746F"/></linearGradient><filter id="mic-glow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.4"/></filter></defs><g filter="url(#mic-glow)"><rect x="80" y="140" width="40" height="10" rx="5" fill="#3F3C3A"/><rect x="95" y="150" width="10" height="20" fill="#2B2826"/><path d="M70 40 a30 30 0 0160 0 v80 a10 10 0 01-10 10 h-40 a10 10 0 01-10-10 z" fill="url(#mic-grad)"/><path d="M70 110 h60 v10 a10 10 0 01-10 10 h-40 a10 10 0 01-10-10 z" fill="#3F3C3A"/><path className="wave" fill="none" stroke="var(--theme-yellow)" strokeWidth="3" strokeLinecap="round" d="M50 100 C 70 100, 80 100, 100 100 S 130 100, 150 100"/></g></svg>),
        photos: (<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><style>{`@keyframes flash{0%,100%{opacity:0}50%{opacity:0.8}}@keyframes lens-flare{0%,100%{transform:translateX(-120%)}50%{transform:translateX(120%)}}.flash{animation:flash 3s ease-in-out infinite}.flare{animation:lens-flare 3s ease-in-out infinite}`}</style><defs><linearGradient id="cam-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#555"/><stop offset="100%" stopColor="#333"/></linearGradient><radialGradient id="lens-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3A6187" stopOpacity="0.8"/><stop offset="100%" stopColor="#2B2826"/></radialGradient><clipPath id="lens-clip"><circle cx="100" cy="105" r="30"/></clipPath><filter id="cam-shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.4"/></filter></defs><g filter="url(#cam-shadow)"><rect x="30" y="55" width="140" height="90" rx="10" fill="url(#cam-grad)"/><rect x="80" y="45" width="40" height="10" rx="3" fill="#2B2826"/><circle cx="100" cy="105" r="35" fill="#222"/><circle cx="100" cy="105" r="30" fill="url(#lens-grad)"/><g clipPath="url(#lens-clip)"><rect className="flare" x="50" y="75" width="20" height="60" fill="#FFF" opacity="0.4" transform="skewX(-20)"/></g><circle className="flash" cx="100" cy="105" r="30" fill="#FFF" opacity="0"/></g></svg>),
        data: (<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><style>{`@keyframes float{50%{transform:translateY(-10px)}}@keyframes open-flap{50%{transform:rotateX(20deg)}}.folder-body{animation:float 4s ease-in-out infinite}.folder-flap{transform-origin:top;animation:open-flap 4s ease-in-out infinite}`}</style><defs><linearGradient id="folder-main-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D49E3C"/><stop offset="100%" stopColor="#AF8C3C"/></linearGradient><linearGradient id="folder-flap-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E0B464"/><stop offset="100%" stopColor="#D49E3C"/></linearGradient><filter id="data-shadow"><feDropShadow dx="0" dy="10" stdDeviation="5" floodColor="#000" floodOpacity="0.4"/></filter></defs><g className="folder-body" filter="url(#data-shadow)"><path d="M30 150 V70 a5 5 0 015-5 H165 a5 5 0 015 5 v80 a5 5 0 01-5 5 H35 a5 5 0 01-5-5z" fill="url(#folder-main-grad)"/><path className="folder-flap" d="M30 80 V65 a5 5 0 015-5 H80 l15 20 H165 a5 5 0 005-5 V65 H30z" fill="url(#folder-flap-grad)"/></g></svg>),
    };

    return (
        <div className="space-y-12 text-[var(--theme-text-primary)] leading-relaxed animate-fade-in-down max-w-4xl mx-auto">
            <section className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--theme-text-primary)]">
                    A Tool Built for Flow, Not Friction
                </h2>
                <p className="mt-4 text-lg text-[var(--theme-text-secondary)]">
                    In today's creative landscape, your workflow is fragmented across a dozen apps—a notepad here, a recorder there, an image tool somewhere else. This app was built to change that. It's a cohesive, offline-first suite of powerful tools designed to keep you in a state of creative flow, with absolute privacy and ownership over your data.
                </p>
            </section>
            
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <PrincipleCard icon={<CloudOfflineIcon />} title="Works Anywhere">
                    No internet? No problem. All core features are designed to function perfectly offline, ensuring you're never blocked from getting work done.
                </PrincipleCard>
                <PrincipleCard icon={<ShieldIcon />} title="Privacy by Design">
                    Your data is yours alone. Work is saved directly to your device or a folder you control. Nothing is sent to the cloud unless you set up your own sync server.
                </PrincipleCard>
                <PrincipleCard icon={<GearsIcon />} title="Workflow Focused">
                    Tools are designed to integrate seamlessly, from voice note to final product description. We remove the friction so you can focus on creating.
                </PrincipleCard>
            </section>
            
            <section className="space-y-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--theme-text-primary)] mb-8">
                    Your All-in-One Creative Toolkit
                </h2>

                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="h-40 w-40 mx-auto md:col-span-1">{animatedIcons.engine}</div>
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold text-[var(--theme-yellow)]">AI Content Engine</h3>
                        <p className="mt-2 text-md text-[var(--theme-text-secondary)] leading-relaxed">Leverage Google's Gemini model to transform raw text into perfectly structured descriptions. The AI uses your custom templates and performs web searches to ensure accuracy, formatting everything exactly as you need it.</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Template-Driven:</strong> Define your own output structure. The AI strictly adheres to your format for consistent results every time.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Web-Powered Accuracy:</strong> The AI automatically searches the web to fill in missing details like dimensions, materials, or warranty info, ensuring your descriptions are complete.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Tone & Style Control:</strong> Choose from multiple tones of voice (Professional, Casual, etc.) to match your brand's style perfectly.</div></li>
                        </ul>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="h-40 w-40 mx-auto md:col-span-1 md:order-2">{animatedIcons.recorder}</div>
                    <div className="md:col-span-2 md:order-1">
                        <h3 className="text-xl font-bold text-[var(--theme-yellow)]">Recording Manager</h3>
                        <p className="mt-2 text-md text-[var(--theme-text-secondary)] leading-relaxed">Capture voice notes on the fly and get a full text transcript with one click. Spoken ideas are instantly organized and searchable, turning unstructured thoughts into actionable text.</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Instant Transcription:</strong> Powered by the same Gemini model, get fast and accurate transcripts of your audio notes.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Rich Media Notes:</strong> Attach reference images from your camera or library directly to your recordings for complete context.</div></li>
                             <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Tagging & Search:</strong> Organize your recordings with custom tags and use the powerful search to find any idea, note, or transcript instantly.</div></li>
                        </ul>
                    </div>
                </div>

                 <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="h-40 w-40 mx-auto md:col-span-1">{animatedIcons.photos}</div>
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold text-[var(--theme-yellow)]">Central Photo Library</h3>
                        <p className="mt-2 text-md text-[var(--theme-text-secondary)] leading-relaxed">A complete hub for your visual assets. Upload, capture from your camera, and sort images into folders. Add detailed notes and tags for powerful search, keeping your entire library at your fingertips.</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Centralized Hub:</strong> Manage all your project photos in one place, accessible from anywhere within the app.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Powerful Organization:</strong> Use folders and tags to categorize your images for easy retrieval.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Integrated Image Squarer:</strong> The built-in tool lets you batch-process photos, making them perfectly square for any platform's requirements.</div></li>
                        </ul>
                    </div>
                </div>

                 <div className="grid md:grid-cols-3 gap-8 items-center">
                     <div className="h-40 w-40 mx-auto md:col-span-1 md:order-2">{animatedIcons.data}</div>
                    <div className="md:col-span-2 md:order-1">
                        <h3 className="text-xl font-bold text-[var(--theme-yellow)]">You Own Your Data</h3>
                        <p className="mt-2 text-md text-[var(--theme-text-secondary)] leading-relaxed">This app is built on the principle of data sovereignty. You choose where your data lives and how it's synchronized. There are no mandatory cloud accounts or data harvesting—just pure, unadulterated control.</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Multiple Storage Modes:</strong> Choose from local browser storage, a synchronized local folder, or a self-hosted API for team collaboration.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>Transparent & Portable:</strong> When using Folder Sync, your data is saved as plain, human-readable files (.json, .webm), making it easy to back up, move, or use with other systems.</div></li>
                            <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong>No Lock-In:</strong> Your data is never trapped. You can export a full backup at any time, regardless of your chosen sync mode.</div></li>
                        </ul>
                    </div>
                </div>
            </section>

             <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--theme-text-primary)]">You Control Your Data: The Three Sync Modes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                     <InfoCard icon={<HardDriveIcon />} title="Local Browser">
                        <p><strong>For:</strong> Single-device use and maximum privacy.</p>
                        <p>Data is stored in your web browser. It's fast, private, and works offline with zero setup.</p>
                    </InfoCard>
                    <InfoCard icon={<FolderSyncIcon />} title="Local Folder Sync">
                         <p><strong>For:</strong> Automatic backups and personal multi-computer sync.</p>
                        <p>Data is saved as plain files in a folder on your computer. Use with Dropbox/Google Drive to sync between devices.</p>
                    </InfoCard>
                    <InfoCard icon={<CloudIcon isConnected={false} />} title="API Server Sync">
                         <p><strong>For:</strong> Teams and real-time collaboration.</p>
                        <p>Connect to a self-hosted server for live data synchronization across all users and devices. (Advanced setup required).</p>
                    </InfoCard>
                </div>
            </section>
            
             <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--theme-text-primary)]">Designed for Modern Creators & Businesses</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="bg-[var(--theme-card-bg)]/20 p-6 rounded-lg border border-[var(--theme-border)]/30">
                        <h4 className="font-semibold text-[var(--theme-text-primary)]">For the E-commerce Manager</h4>
                        <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">Standardize all your product listings with the Template-Driven AI. Ensure every description is complete, accurate, and perfectly formatted for your platform, saving hours of manual work.</p>
                    </div>
                     <div className="bg-[var(--theme-card-bg)]/20 p-6 rounded-lg border border-[var(--theme-border)]/30">
                        <h4 className="font-semibold text-[var(--theme-text-primary)]">For the Content Creator</h4>
                        <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">Capture ideas on the go with the Recording Manager, organize visual assets in the Photo Library, and draft scripts in the Notepad. It's a unified workspace for your entire creative process.</p>
                    </div>
                </div>
            </section>

            <section className="text-center bg-[var(--theme-card-bg)]/50 p-8 rounded-lg border border-[var(--theme-border)]/50">
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">Ready to Get Started?</h2>
                <p className="mt-2 text-[var(--theme-text-secondary)] max-w-xl mx-auto">
                    Dive into the different modes and tools. For detailed instructions on setting up folder or API sync, head over to the setup guide.
                </p>
                <button 
                    onClick={onNavigateToSetup}
                    className="mt-4 bg-[var(--theme-blue)] hover:opacity-90 text-white font-bold py-2 px-5 rounded-md transition-colors"
                >
                    View Setup Guide
                </button>
            </section>
        </div>
    );
};