import React, { useState } from 'react';
import { Template, Recording } from '../App';
import { XIcon } from './icons/XIcon';
import { DataManagement } from './DataManagement';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { createBackup } from '../utils/dataUtils';
import { SiteSettings } from '../constants';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { InfoIcon } from './icons/InfoIcon';

interface DashboardProps {
  onClose: () => void;
  onLock: () => void;
  templates: Template[];
  recordings: Recording[];
  siteSettings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onRestore: (data: any) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSyncDirectory: () => void;
  onDisconnectDirectory: () => void;
  onClearLocalData: () => void;
}

type Section = 'data' | 'settings' | 'about';

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 relative ${
            active 
                ? 'bg-[var(--theme-blue)]/10 text-[var(--theme-blue)]' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
        }`}
        role="tab"
        aria-selected={active}
    >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[var(--theme-blue)] rounded-r-full"></div>}
        <div className="w-5 h-5">{icon}</div>
        <span>{children}</span>
    </button>
);

const AboutThisApp: React.FC = () => (
    <div className="space-y-6 text-slate-300 leading-relaxed animate-fade-in-down max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-100">About This Application</h2>
        
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">The Goal</h3>
                <p>
                    Welcome to the AI Product Description Generator. This application is designed to streamline your content creation process by taking raw, unstructured product information and meticulously reformatting it into a professional, consistent layout based on your selected template.
                </p>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">How It Works: Reformatting, Not Rewriting</h3>
                <p>
                    The AI's primary role is to act as an expert copy-editor focusing on structure. It will <strong className="text-slate-100">preserve the original wording and details you provide</strong>, ensuring your brand voice and technical accuracy are maintained. The content is simply reorganized to fit the template's defined sections (e.g., Brand, SKU, Key Features).
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">Smart Data Enrichment</h3>
                <p>
                    To ensure descriptions are as comprehensive as possible, the AI is instructed to perform a targeted web search for specific fields if they are missing from your input. This primarily applies to:
                </p>
                <ul className="list-disc list-inside mt-2 pl-4 text-slate-400 space-y-1">
                    <li>Terms & Conditions</li>
                    <li>What’s in the Box</li>
                    <li>Material Used</li>
                    <li>Product Dimensions & Weight</li>
                </ul>
                <p className="mt-2">
                    The AI will search for official manufacturer information for the specific product model provided. If verifiable information cannot be found after an exhaustive search, the field will be marked with "No info." This prevents inaccurate "hallucinations" and ensures the data you present to customers is trustworthy.
                </p>
            </div>

             <div>
                <h3 className="text-lg font-semibold text-[var(--theme-yellow)] mb-2">Your Data, Your Control</h3>
                <p>
                    This application runs entirely in your browser. For advanced persistence, backups, and collaboration, you can connect a local folder on your computer. All data processing and storage are under your control.
                </p>
            </div>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ 
  onClose, 
  onLock,
  templates,
  recordings,
  siteSettings,
  onUpdateSettings,
  onRestore,
  directoryHandle,
  onSyncDirectory,
  onDisconnectDirectory,
  onClearLocalData
}) => {
  const [activeSection, setActiveSection] = useState<Section>('data');

  const handleBackup = async () => {
    try {
        await createBackup(siteSettings, templates, recordings);
    } catch (err)
        {
        alert(`Error creating backup: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)]/80 border border-[var(--theme-border)] w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
        <header className="p-5 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Dashboard</h2>
            <p className="text-slate-400 mt-1 text-sm">Manage your application's data, settings, and local folder connection.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLock} className="text-sm font-semibold text-[var(--theme-red)] hover:opacity-80 transition-opacity">Lock Dashboard</button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close"><XIcon /></button>
          </div>
        </header>
        
        <div className="flex-grow flex overflow-hidden">
            <aside className="w-64 p-4 border-r border-[var(--theme-border)] flex-shrink-0">
                <nav className="space-y-2">
                    <NavButton active={activeSection === 'data'} onClick={() => setActiveSection('data')} icon={<DatabaseIcon />}>Data Management</NavButton>
                    <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} icon={<SettingsIcon />}>Site & Creator Settings</NavButton>
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                </nav>
            </aside>

            <main className="flex-grow overflow-y-auto p-6 bg-[var(--theme-bg)]/30">
                {activeSection === 'data' && (
                    <DataManagement 
                        templates={templates}
                        recordings={recordings}
                        onBackup={handleBackup}
                        onRestore={onRestore}
                        directoryHandle={directoryHandle}
                        onSyncDirectory={onSyncDirectory}
                        onDisconnectDirectory={onDisconnectDirectory}
                        onClearLocalData={onClearLocalData}
                    />
                )}
                {activeSection === 'settings' && (
                    <SiteSettingsEditor 
                        settings={siteSettings}
                        onSave={onUpdateSettings}
                    />
                )}
                {activeSection === 'about' && (
                    <AboutThisApp />
                )}
            </main>
        </div>
      </div>
    </div>
  );
};