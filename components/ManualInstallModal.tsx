import React from 'react';
import { XIcon } from './icons/XIcon';

interface ManualInstallModalProps {
    onClose: () => void;
}

const InstructionStep: React.FC<{ browser: string, children: React.ReactNode }> = ({ browser, children }) => (
    <div className="bg-[var(--theme-bg)]/50 p-4 rounded-md border border-[var(--theme-border)]">
        <h4 className="font-semibold text-[var(--theme-green)]">{browser}</h4>
        <div className="text-sm text-[var(--theme-text-secondary)] mt-1">{children}</div>
    </div>
);


export const ManualInstallModal: React.FC<ManualInstallModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-lg shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in">
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">How to Install This App</h2>
                        <p className="text-sm text-[var(--theme-text-secondary)]">This app can be installed on your device for easy access.</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
                        <XIcon />
                    </button>
                </header>
                <div className="p-6 space-y-4">
                     <p className="text-sm text-[var(--theme-text-secondary)]">If the browser prompt didn't appear, you can add this app to your home screen manually:</p>
                    <InstructionStep browser="Chrome (Desktop)">
                        Look for an install icon (a screen with a down arrow) in the address bar on the right side.
                    </InstructionStep>
                    <InstructionStep browser="Safari (iOS / iPadOS)">
                        <span>
                            Tap the "Share" button 
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 -mt-1 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> 
                            and then select "Add to Home Screen".
                        </span>
                    </InstructionStep>
                     <InstructionStep browser="Chrome (Android)">
                        <span>
                            Tap the three-dot menu icon 
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 -mt-1 mx-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg> 
                            and select "Install app" or "Add to Home screen".
                        </span>
                    </InstructionStep>
                </div>
            </div>
        </div>
    );
};