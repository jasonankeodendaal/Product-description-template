
import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CodeIcon } from './icons/CodeIcon';
import { SetupGuide } from './SetupGuide';
import { AboutThisApp } from './AboutThisApp';
import { NavButton } from './NavButton';

interface InfoModalProps {
  onClose: () => void;
}

type Section = 'about' | 'setup';

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<Section>('about');

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] border-t md:border border-[var(--theme-border)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-flex-modal-scale-in">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text-primary)]">App Information</h2>
            <p className="text-[var(--theme-text-secondary)] mt-1 text-sm">Learn more about the app and how to set it up.</p>
          </div>
          <button onClick={onClose} className="text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            <aside className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-[var(--theme-border)] flex-shrink-0">
                <nav className="space-y-2">
                    <NavButton active={activeSection === 'about'} onClick={() => setActiveSection('about')} icon={<InfoIcon />}>About This App</NavButton>
                    <NavButton active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} icon={<CodeIcon />}>Setup Guide</NavButton>
                </nav>
            </aside>

            <main className="flex-grow md:overflow-y-auto p-4 bg-[var(--theme-bg)]/30">
                {activeSection === 'about' && <AboutThisApp onNavigateToSetup={() => setActiveSection('setup')} />}
                {activeSection === 'setup' && <SetupGuide />}
            </main>
        </div>
      </div>
    </div>
  );
};
