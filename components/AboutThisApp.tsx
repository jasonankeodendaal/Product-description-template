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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--theme-orange)]">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            <path d="m2 2 20 20"/>
        </svg>
    );

    const ShieldIcon: React.FC = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--theme-orange)]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    );

    const GearsIcon: React.FC = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[var(--theme-orange)]">
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

     const CheckmarkIcon: React.FC = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--theme-orange)] flex-shrink-0 mt-1">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );

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
                    Your data is yours alone. Work is saved directly to your device or a folder you control. Nothing is sent to the cloud unless you explicitly connect it.
                </PrincipleCard>
                <PrincipleCard icon={<GearsIcon />} title="Workflow Focused">
                    Tools are designed to integrate seamlessly, from voice note to final product description. We remove the friction so you can focus on creating.
                </PrincipleCard>
            </section>
            
            <section className="space-y-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--theme-text-primary)] mb-8">
                    Your All-in-One Creative Toolkit
                </h2>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-[var(--theme-orange)]">Core Features</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong className="text-white">AI Content Engine:</strong> Leverage Google's Gemini model to transform raw text into perfectly structured descriptions. The AI uses your custom templates and performs web searches to ensure accuracy, formatting everything exactly as you need it.</div></li>
                        <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong className="text-white">Recording & Transcription:</strong> Capture voice notes on the fly and get a full text transcript with one click. Spoken ideas are instantly organized and searchable, turning unstructured thoughts into actionable text.</div></li>
                        <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong className="text-white">Central Photo Library:</strong> A complete hub for your visual assets. Upload, capture from your camera, and sort images into folders. Add detailed notes and tags for powerful search.</div></li>
                        <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong className="text-white">Advanced Notepad:</strong> More than just text. Draft ideas, manage tasks with interactive checklists, attach audio memos or scanned documents, and set reminders to stay on track.</div></li>
                        <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong className="text-white">Timesheet & Activity Log:</strong> Automatically log actions like creating notes or adding photos, and manually track time on specific tasks to get a clear overview of your productivity.</div></li>
                        <li className="flex items-start gap-3"><CheckmarkIcon /><div><strong className="text-white">Data Sovereignty:</strong> You choose where your data lives. Use local browser storage for privacy, sync with a local folder on your desktop, or connect to a cloud service. You are always in control.</div></li>
                    </ul>
                </div>

                 <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="text-xl font-bold text-[var(--theme-orange)]">Technology Stack</h3>
                    <p className="text-sm text-[var(--theme-text-secondary)]">This application is built with modern web technologies to be fast, reliable, and powerful.</p>
                    <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                        <li><strong className="text-white">Frontend:</strong> React & TypeScript for a robust user interface.</li>
                        <li><strong className="text-white">Styling:</strong> Tailwind CSS for rapid, modern design.</li>
                        <li><strong className="text-white">AI Backend:</strong> Vercel Serverless Functions powered by the Google Gemini API.</li>
                        <li><strong className="text-white">Offline Storage:</strong> IndexedDB for persistent, offline data storage in your browser.</li>
                        <li><strong className="text-white">File System Sync:</strong> The File System Access API for direct folder interaction on desktop.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};