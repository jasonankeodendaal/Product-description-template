import React, { useState } from 'react';
import { Template, Recording, Photo, Note } from '../App';
import { XIcon } from './icons/XIcon';
import { DataManagement } from './DataManagement';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { createBackup } from '../utils/dataUtils';
import { SiteSettings } from '../constants';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { InfoIcon } from './icons/InfoIcon';
import { SetupGuide } from './SetupGuide';
import { CodeIcon } from './icons/CodeIcon';

interface DashboardProps {
  onClose: () => void;
  onLock: () => void;
  templates: Template[];
  recordings: Recording[];
  photos: Photo[];
  notes: Note[];
  siteSettings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onRestore: (data: any) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSyncDirectory: () => void;
  onDisconnectDirectory: () => void;
  onClearLocalData: () => void;
  onApiConnect: (apiUrl: string, apiKey: string) => Promise<void>;
  onApiDisconnect: () => void;
  isApiConnecting: boolean;
  isApiConnected: boolean;
}

type Section = 'data' | 'settings' | 'setup' | 'about';

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 relative ${
            active 
                ? 'bg-[var(--theme-blue)]/10 text-[var(--theme-blue)]' 
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:text-[var(--theme-text-primary)]'
        }`}
        role="tab"
        aria-selected={active}
    >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[var(--theme-blue)] rounded-r-full"></div>}
        <div className="w-5 h-5">{icon}</div>
        <span>{children}</span>
    </button>
);

const InfoCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[var(--theme-card-bg)]/50 p-3 sm:p-4 rounded-lg border border-[var(--theme-border)]/50 flex flex-col ${className}`}>
        {children}
    </div>
);


const AboutThisApp: React.FC = () => (
    <div className="space-y-10 text-[var(--theme-text-primary)] leading-relaxed animate-fade-in-down max-w-5xl mx-auto text-sm p-4 md:p-0">
        <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--theme-text-primary)]">About This Application</h2>
            <p className="mt-3 text-[var(--theme-text-secondary)] text-center max-w-3xl mx-auto">
                Welcome to your new creative sidekick. This application is a powerful, local-first suite of tools designed to accelerate your content creation workflow. From generating polished product descriptions with AI to managing voice memos and visual assets, every feature is built with privacy, offline capability, and data ownership at its core.
            </p>
        </section>

        <section>
             <h3 className="text-xl sm:text-2xl font-bold text-center text-[var(--theme-yellow)] mb-6">Our Philosophy</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard className="text-center items-center">
                    <svg className="h-10 w-10 mb-2 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <h4 className="font-bold text-base">Privacy-Focused</h4>
                    <p className="text-xs text-[var(--theme-text-secondary)] mt-1">By keeping data local, you maintain your privacy. There's no tracking, no analytics, and no cloud account needed.</p>
                </InfoCard>
                 <InfoCard className="text-center items-center">
                    <svg className="h-10 w-10 mb-2 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.8 3.8l16.4 16.4M20.2 3.8L3.8 20.2M12 22v-2M12 4V2M4.9 19.1L3.5 20.5M19.1 4.9l1.4-1.4M2 12H4M20 12h2M4.9 4.9l1.4 1.4M19.1 19.1l1.4 1.4"/></svg>
                    <h4 className="font-bold text-base">Offline by Default</h4>
                    <p className="text-xs text-[var(--theme-text-secondary)] mt-1">As a Progressive Web App (PWA), all core features work without an internet connection (AI generation excluded).</p>
                </InfoCard>
                <InfoCard className="text-center items-center">
                    <svg className="h-10 w-10 mb-2 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v- теоретична 6m0 0V3m0 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <h4 className="font-bold text-base">Data Ownership</h4>
                    <p className="text-xs text-[var(--theme-text-secondary)] mt-1">You should own your data. This app doesn't store your content on our servers. It lives on your device or a folder you control.</p>
                </InfoCard>
                 <InfoCard className="text-center items-center">
                    <svg className="h-10 w-10 mb-2 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                    <h4 className="font-bold text-base">Extensible for Power Users</h4>
                    <p className="text-xs text-[var(--theme-text-secondary)] mt-1">For those needing true, real-time sync, the app can connect to a self-hosted API. See the 'Setup Guide' for details.</p>
                </InfoCard>
             </div>
        </section>
        
        <section>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-[var(--theme-yellow)] mb-6">Your Data, Your Choice: Two Powerful Modes</h3>
            <p className="mb-6 text-[var(--theme-text-secondary)] text-center max-w-3xl mx-auto">The application operates in two distinct modes, giving you complete control over where your data lives.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">Mode 1: Local Browser (Default)</h4>
                    <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="shadow-realistic-1" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter>
                                <linearGradient id="browserGrad-realistic-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4A4745"/><stop offset="100%" stopColor="#3F3C3A"/></linearGradient>
                                <linearGradient id="dbGrad-realistic-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4A6E91" /><stop offset="100%" stopColor="#3A6187" /></linearGradient>
                            </defs>
                            <g filter="url(#shadow-realistic-1)">
                                <rect x="10" y="10" width="180" height="100" rx="8" fill="url(#browserGrad-realistic-1)" stroke="#555250" strokeWidth="1"/>
                                <path d="M10 30 H 190" stroke="#2B2826" strokeWidth="2" />
                                <circle cx="25" cy="20" r="4" fill="#AF412C"/><circle cx="40" cy="20" r="4" fill="#D49E3C"/><circle cx="55" cy="20" r="4" fill="#60814A"/>
                            </g>
                            <g transform="translate(100, 70)" filter="url(#shadow-realistic-1)">
                                <ellipse cx="0" cy="0" rx="40" ry="12" fill="url(#dbGrad-realistic-1)" stroke="#E9E2D5" strokeWidth="0.75"/>
                                <path d="M-40,0 V25 A40,12 0,0,0 40,25 V0" stroke="#E9E2D5" fill="#3A6187" strokeWidth="0.75" />
                                <path d="M-40,8 A40,12 0,0,0 40,8" stroke="#E9E2D5" fill="none" strokeWidth="0.75" />
                                <path d="M-40,16 A40,12 0,0,0 40,16" stroke="#E9E2D5" fill="none" strokeWidth="0.75" />
                            </g>
                            <text x="100" y="75" textAnchor="middle" fontSize="8" fill="var(--theme-text-primary)" className="font-sans font-bold">IndexedDB</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">
                        All data is stored privately within your web browser's database. It's fast, works offline, and never leaves your device.
                    </p>
                </InfoCard>
                 <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">Mode 2: Local Folder Sync</h4>
                    <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                           <style>{`@keyframes dash-realistic-2 { to { stroke-dashoffset: -24; } } .sync-arrow-realistic-2 { stroke-dasharray: 4 3; animation: dash-realistic-2 1s linear infinite; }`}</style>
                           <defs>
                                <filter id="shadow-realistic-2" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter>
                                <linearGradient id="folderGrad-realistic-2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#E0B464"/><stop offset="100%" stopColor="#D49E3C"/></linearGradient>
                           </defs>
                           <g transform="translate(15, 30)" filter="url(#shadow-realistic-2)">
                               <rect x="0" y="0" width="60" height="60" rx="5" fill="#3F3C3A" stroke="#555250"/>
                               <path d="M5 10 h50 v45 h-50 z" fill="#2B2826" />
                               <text x="30" y="40" textAnchor="middle" fontSize="10" fill="var(--theme-text-primary)" className="font-sans font-bold">App</text>
                           </g>
                           <g stroke="var(--theme-blue)" strokeWidth="1.5" fill="none">
                               <path d="M 85 50 L 115 50" className="sync-arrow-realistic-2" /><path d="M 110 46 L 115 50 L 110 54" strokeWidth="1.5" fill="var(--theme-blue)" />
                               <path d="M 115 70 L 85 70" className="sync-arrow-realistic-2" style={{animationDirection: 'reverse'}} /><path d="M 90 66 L 85 70 L 90 74" strokeWidth="1.5" fill="var(--theme-blue)" />
                           </g>
                           <text x="100" y="42" textAnchor="middle" fontSize="7" fill="var(--theme-blue)" className="font-sans font-semibold">WRITE</text>
                           <text x="100" y="80" textAnchor="middle" fontSize="7" fill="var(--theme-blue)" className="font-sans font-semibold">READ</text>
                           <g transform="translate(125, 30)" filter="url(#shadow-realistic-2)">
                               <path d="M0 18 V6 a2 2 0 0 1 2 -2 h10 l4 4 h22 a2 2 0 0 1 2 2 v25 a2 2 0 0 1 -2 2 H2 a2 2 0 0 1 -2 -2 Z" fill="url(#folderGrad-realistic-2)" stroke="#F0D080" strokeWidth="0.75" />
                               <path d="M42 25 l-6 6 M42 31 l-6 -6" stroke="#2B2826" strokeWidth="1" strokeLinecap="round"/>
                               <text x="20" y="30" textAnchor="middle" fontSize="8" fill="#2B2826" className="font-sans font-bold">.json</text>
                           </g>
                           <text x="150" y="90" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)" className="font-sans">Your Local Folder</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">
                       Connect to a folder on your computer. The app reads and writes data directly to files (.json, .webm), creating a persistent backup that you own.
                    </p>
                </InfoCard>
            </div>
        </section>
        
        <section>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-[var(--theme-yellow)] mb-6">A Tour of Your Toolkit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">AI Content Engine</h4>
                    <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="shadow-realistic-3" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter>
                                <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4A4745"/><stop offset="100%" stopColor="#3F3C3A"/></linearGradient>
                            </defs>
                            <g transform="translate(10, 30)" filter="url(#shadow-realistic-3)">
                                <rect x="0" y="0" width="40" height="50" rx="3" fill="url(#docGrad)" stroke="#78746F"/>
                                <path d="M5 8 h20 M10 14 h25 M5 20 h15 M10 26 h25 M5 32 h20 M10 38 h25 M5 44 h15" stroke="#78746F" strokeWidth="1" strokeLinecap="round"/>
                                <g transform="translate(30, 40) scale(0.5)">
                                <circle cx="0" cy="0" r="8" fill="none" stroke="var(--theme-blue)" strokeWidth="1.5"/>
                                <path d="M0 -8v16 M-8 0h16 M-5.6 -5.6a8 8 0 0 1 11.2 0 M-5.6 5.6a8 8 0 0 0 11.2 0" fill="none" stroke="var(--theme-blue)" strokeWidth="1"/>
                                </g>
                            </g>
                            <path d="M60 55 l 25 0" stroke="var(--theme-blue)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                            <path d="M82 51 l 5 4 l -5 4" fill="var(--theme-blue)"/>
                            <g transform="translate(100 55)" filter="url(#shadow-realistic-3)">
                                <circle cx="0" cy="0" r="20" fill="#33302E" stroke="var(--theme-blue)" strokeWidth="1"/>
                                <path d="M-9 -9 l 18 18 M-9 9 l 18 -18" stroke="var(--theme-yellow)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(45) scale(0.6)"/>
                                <path d="M-9 -9 l 18 18 M-9 9 l 18 -18" stroke="var(--theme-yellow)" strokeWidth="1.5" strokeLinecap="round" transform="scale(0.6)" opacity="0.7"/>
                            </g>
                            <path d="M130 55 l 15 0" stroke="var(--theme-green)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                            <path d="M142 51 l 5 4 l -5 4" fill="var(--theme-green)"/>
                            <g transform="translate(150, 30)" filter="url(#shadow-realistic-3)">
                                <rect x="0" y="0" width="45" height="55" rx="3" fill="url(#docGrad)" stroke="var(--theme-green)"/>
                                <text x="4" y="10" fontFamily="monospace" fontSize="4" fill="var(--theme-text-secondary)">Brand:</text>
                                <path d="M18 9 h18" stroke="#E9E2D5" strokeWidth="1"/>
                                <text x="4" y="18" fontFamily="monospace" fontSize="4" fill="var(--theme-text-secondary)">SKU:</text>
                                <path d="M14 17 h22" stroke="#E9E2D5" strokeWidth="1"/>
                                <text x="4" y="26" fontFamily="monospace" fontSize="4" fill="var(--theme-text-secondary)">Name:</text>
                                <path d="M16 25 h20 M4 29 h37" stroke="#E9E2D5" strokeWidth="1"/>
                                <text x="4" y="38" fontFamily="monospace" fontSize="4" fill="var(--theme-text-secondary)">Desc:</text>
                                <path d="M15 37 h25 M4 41 h37 M4 45 h37 M4 49 h20" stroke="#E9E2D5" strokeWidth="1"/>
                            </g>
                            <text x="30" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Raw Data + Web</text>
                            <text x="100" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">AI Processing</text>
                            <text x="172" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Structured Output</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">Drop in raw text, and the AI uses your templates and web search to generate perfectly structured, complete descriptions.</p>
                </InfoCard>

                <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">Recording Manager</h4>
                    <div className="w-full h-auto">
                       <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                           <defs><filter id="shadow-realistic-4" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter></defs>
                           <g transform="translate(45 55)" filter="url(#shadow-realistic-4)">
                               <path d="M-10 0 a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-10a5 5 0 0 1-5-5Z" fill="#33302E" stroke="#78746F"/>
                               <rect x="-7" y="-10" width="14" height="5" rx="2" fill="#AF412C"/>
                               <path d="M-15 10 h30" stroke="#78746F" strokeWidth="2" strokeLinecap="round"/>
                           </g>
                           <path d="M75 55 L 115 55" stroke="var(--theme-yellow)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                           <path d="M111 51 L 115 55 L 111 59" fill="var(--theme-yellow)"/>
                           <text x="95" y="48" textAnchor="middle" fontSize="7" fill="var(--theme-yellow)">Transcribe</text>
                           <g transform="translate(130, 30)" filter="url(#shadow-realistic-4)">
                               <rect x="0" y="0" width="40" height="50" rx="3" fill="#3F3C3A" stroke="#E9E2D5"/>
                               <path d="M5 8 h30 M5 14 h30 M5 20 h20 M5 26 h30 M5 32 h15 M5 38 h30 M5 44 h25" stroke="#78746F" strokeWidth="1.5" strokeLinecap="round"/>
                           </g>
                           <text x="45" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Voice Memo</text>
                           <text x="150" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Editable Text</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">Record audio notes, attach images and tags, and get a full, searchable text transcript with one click.</p>
                </InfoCard>

                <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">Photo Manager</h4>
                    <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <defs><filter id="shadow-realistic-5" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter></defs>
                             <g transform="translate(20 30)">
                               <rect x="5" y="5" width="40" height="30" fill="#33302E" stroke="#78746F" rx="3" filter="url(#shadow-realistic-5)" transform="rotate(-10 25 20)"/>
                               <rect x="0" y="0" width="40" height="30" fill="#3F3C3A" stroke="#E9E2D5" rx="3" filter="url(#shadow-realistic-5)" transform="rotate(5 20 15)"/>
                            </g>
                            <path d="M75 55 L 105 55" stroke="var(--theme-blue)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                            <path d="M101 51 L 105 55 L 101 59" fill="var(--theme-blue)"/>
                            <g filter="url(#shadow-realistic-5)">
                               <g transform="translate(120, 35)">
                                  <path d="M0 18 V6 a2 2 0 0 1 2 -2 h5 l2 2 h10 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 H2 a2 2 0 0 1 -2 -2 Z" fill="url(#folderGrad-realistic-2)" stroke="#F0D080" strokeWidth="0.5" />
                               </g>
                               <g transform="translate(140, 45)">
                                  <path d="M0 18 V6 a2 2 0 0 1 2 -2 h5 l2 2 h10 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 H2 a2 2 0 0 1 -2 -2 Z" fill="url(#folderGrad-realistic-2)" stroke="#F0D080" strokeWidth="0.5" />
                               </g>
                           </g>
                           <text x="35" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Images</text>
                           <text x="145" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Organized Folders</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">A central library for your visual assets. Upload, capture from camera, sort into folders, and add detailed notes to every image.</p>
                </InfoCard>
                
                <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">Image Squarer</h4>
                    <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="shadow-realistic-6" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter>
                                <linearGradient id="photoGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#87CEEB"/><stop offset="100%" stopColor="#4682B4"/></linearGradient>
                                <linearGradient id="photoGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#FFA500"/></linearGradient>
                            </defs>
                            <g transform="translate(15, 30)" filter="url(#shadow-realistic-6)">
                                <rect x="0" y="5" width="40" height="25" fill="url(#photoGrad1)" stroke="#fff" strokeWidth="1" rx="2" transform="rotate(-5 20 17.5)"/>
                                <path d="M 5 22 l 10 -10 l 8 8 l 12 -15" stroke="white" strokeWidth="1.5" fill="none"/>
                                <circle cx="30" cy="10" r="3" fill="url(#photoGrad2)"/>
                                <rect x="15" y="30" width="20" height="30" fill="url(#photoGrad1)" stroke="#fff" strokeWidth="1" rx="2" transform="rotate(3 25 45)"/>
                                <path d="M 20 55 l 5 -10 l 5 10" stroke="white" strokeWidth="1.5" fill="none"/>
                            </g>
                            <path d="M65 60 l 20 0" stroke="var(--theme-blue)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                            <path d="M82 56 l 5 4 l -5 4" fill="var(--theme-blue)"/>
                            <g transform="translate(100, 45)" filter="url(#shadow-realistic-6)">
                                <rect x="0" y="0" width="30" height="30" rx="3" fill="#33302E" stroke="var(--theme-blue)" strokeWidth="1"/>
                                <path d="M 5 5 v -3 h -3 M 25 5 v -3 h 3 M 5 25 v 3 h -3 M 25 25 v 3 h 3" stroke="var(--theme-yellow)" strokeWidth="1.5" fill="none"/>
                            </g>
                            <path d="M140 60 l 20 0" stroke="var(--theme-green)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                            <path d="M157 56 l 5 4 l -5 4" fill="var(--theme-green)"/>
                            <g transform="translate(165, 35)" filter="url(#shadow-realistic-6)">
                                <rect x="5" y="5" width="25" height="25" fill="#33302E" stroke="var(--theme-border)" rx="2" transform="rotate(-3 17.5 17.5)"/>
                                <g>
                                    <rect x="0" y="0" width="25" height="25" fill="#FFFFFF" stroke="var(--theme-green)" strokeWidth="1" rx="2"/>
                                    <rect x="2.5" y="6.5" width="20" height="12" fill="url(#photoGrad1)" rx="1"/>
                                    <path d="M 5 16 l 5 -5 l 4 4 l 6 -7" stroke="white" strokeWidth="1.2" fill="none"/>
                                    <circle cx="18" cy="10" r="1.5" fill="url(#photoGrad2)"/>
                                </g>
                            </g>
                            <text x="35" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Mixed Sizes</text>
                            <text x="115" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Process & Center</text>
                            <text x="177" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Square JPGs</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">A powerful batch utility. Upload photos of any dimension and convert them to square images, perfectly centered with a white background.</p>
                </InfoCard>

                <InfoCard>
                     <h4 className="font-bold text-center mb-3 text-base">Download Manager</h4>
                     <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <defs><filter id="shadow-realistic-7" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter></defs>
                             <g filter="url(#shadow-realistic-7)">
                               <rect x="15" y="25" width="25" height="35" fill="#3F3C3A" stroke="#E9E2D5" rx="2" transform="rotate(-8 27.5 42.5)"/>
                               <rect x="45" y="25" width="25" height="35" fill="#3F3C3A" stroke="#E9E2D5" rx="2" transform="rotate(2 57.5 42.5)"/>
                               <rect x="75" y="25" width="25" height="35" fill="#3F3C3A" stroke="#E9E2D5" rx="2" transform="rotate(10 87.5 42.5)"/>
                            </g>
                            <path d="M30 65 L 130 60 M60 65 L 133 62 M90 65 L 135 65" stroke="var(--theme-blue)" strokeWidth="1" fill="none" strokeDasharray="3 2"/>
                            <g transform="translate(140, 35)" filter="url(#shadow-realistic-7)">
                               <path d="M0 25 V5 a2 2 0 0 1 2 -2 h10 l4 4 h22 a2 2 0 0 1 2 2 v25 a2 2 0 0 1 -2 2 H2 a2 2 0 0 1 -2 -2 Z" fill="#3A6187" stroke="#E9E2D5" strokeWidth="0.75"/>
                               <path d="M18 0 h4 v8 h-4z M18 8 h-18 v2 h18 M18 10 v2 h-18 v-2 M18 12 v2 h-18 v-2 M18 14 v2 h-18 v-2" fill="#E9E2D5"/>
                            </g>
                            <text x="60" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Generated Items</text>
                            <text x="160" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Single .zip file</text>
                        </svg>
                    </div>
                     <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">As you generate descriptions, add them to the queue. When you're ready, download everything as a single, neatly organized .zip archive.</p>
                </InfoCard>
                
                <InfoCard>
                    <h4 className="font-bold text-center mb-3 text-base">Branding & Info</h4>
                    <div className="w-full h-auto">
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <defs><filter id="shadow-realistic-8" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/></filter></defs>
                             <g transform="translate(45 55)" filter="url(#shadow-realistic-8)">
                               <circle cx="0" cy="0" r="22" fill="#33302E" stroke="#E9E2D5" strokeWidth="1.5"/>
                               <circle cx="0" cy="0" r="8" fill="#E9E2D5"/>
                               <path d="M0 -22 V -15 M0 22 V 15 M-22 0 H -15 M22 0 H 15 M-15.5 -15.5 L -10.6 -10.6 M15.5 15.5 L 10.6 10.6 M-15.5 15.5 L -10.6 10.6 M15.5 -15.5 L 10.6 -10.6" stroke="#E9E2D5" strokeWidth="2.5" strokeLinecap="round"/>
                            </g>
                            <path d="M80 55 L 110 55" stroke="var(--theme-green)" strokeWidth="1.5" fill="none" className="sync-arrow-realistic-2"/>
                            <path d="M106 51 L 110 55 L 106 59" fill="var(--theme-green)"/>
                            <g transform="translate(115, 25)" filter="url(#shadow-realistic-8)">
                               <rect x="0" y="0" width="70" height="60" rx="5" fill="#3F3C3A" stroke="#78746F"/>
                               <rect x="8" y="8" width="15" height="15" rx="3" fill="var(--theme-yellow)"/>
                               <path d="M30 15 h30 M30 25 h20" stroke="#E9E2D5" strokeWidth="2.5" strokeLinecap="round"/>
                               <rect x="8" y="35" width="54" height="15" rx="2" fill="#33302E"/>
                            </g>
                            <text x="45" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Settings</text>
                            <text x="150" y="95" textAnchor="middle" fontSize="8" fill="var(--theme-text-secondary)">Branded App</text>
                        </svg>
                    </div>
                    <p className="mt-2 text-xs text-center text-[var(--theme-text-secondary)]">Customize the app with your own company logo, colors, and contact details for a professional, white-labeled experience.</p>
                </InfoCard>
            </div>
        </section>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ 
  onClose, 
  onLock,
  templates,
  recordings,
  photos,
  notes,
  siteSettings,
  onUpdateSettings,
  onRestore,
  directoryHandle,
  onSyncDirectory,
  onDisconnectDirectory,
  onClearLocalData,
  onApiConnect,
  onApiDisconnect,
  isApiConnecting,
  isApiConnected,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('data');

  const handleBackup = async () => {
    try {
        await createBackup(siteSettings, templates, recordings, photos, notes);
    } catch (err) {
        alert(`Error creating backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
        <header className="p-5 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text-primary)]">Dashboard</h2>
            <p className="text-[var(--theme-text-secondary)] mt-1 text-sm">Manage your application's data, settings, and local folder connection.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLock} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 transition-opacity">Lock Dashboard</button>
            <button onClick={onClose} className="text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            <aside className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-[var(--theme-border)] flex-shrink-0">
                <nav className="space-y-2">
                    <NavButton active={activeSection === 'data'} onClick={() => setActiveSection('data')} icon={<DatabaseIcon />}>Data Management</NavButton>
                    <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} icon={<SettingsIcon />}>Site & Creator Settings</NavButton>
                    <NavButton active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} icon={<CodeIcon />}>Setup Guide</NavButton>
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                </nav>
            </aside>

            <main className="flex-grow md:overflow-y-auto p-4 md:p-6 bg-[var(--theme-bg)]/30">
                {activeSection === 'data' && (
                    <DataManagement 
                        templates={templates}
                        recordings={recordings}
                        photos={photos}
                        notes={notes}
                        onBackup={handleBackup}
                        onRestore={onRestore}
                        directoryHandle={directoryHandle}
                        onSyncDirectory={onSyncDirectory}
                        onDisconnectDirectory={onDisconnectDirectory}
                        onClearLocalData={onClearLocalData}
                        siteSettings={siteSettings}
                        onUpdateSettings={onUpdateSettings}
                        onApiConnect={onApiConnect}
                        onApiDisconnect={onApiDisconnect}
                        isApiConnecting={isApiConnecting}
                        isApiConnected={isApiConnected}
                    />
                )}
                {activeSection === 'settings' && (
                    <SiteSettingsEditor 
                        settings={siteSettings}
                        onSave={onUpdateSettings}
                    />
                )}
                {activeSection === 'setup' && <SetupGuide />}
                {activeSection === 'about' && <AboutThisApp />}
            </main>
        </div>
      </div>
    </div>
  );
};