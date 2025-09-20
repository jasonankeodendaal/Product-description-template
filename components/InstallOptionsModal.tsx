import React from 'react';
import { XIcon } from './icons/XIcon';
import { PwaIcon } from './icons/PwaIcon';
import { AndroidIcon } from './icons/AndroidIcon';
import { SiteSettings } from '../constants';

interface InstallOptionsModalProps {
    onClose: () => void;
    onPwaInstall: () => void;
    onApkDownload: () => void;
    siteSettings: SiteSettings;
}

const InstallOption: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 bg-[var(--theme-bg)]/50 hover:bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-border)]/50 flex items-start gap-4 transition-colors"
    >
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">{icon}</div>
        <div>
            <h4 className="font-semibold text-base text-[var(--theme-text-primary)]">{title}</h4>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">{description}</p>
        </div>
    </button>
);

export const InstallOptionsModal: React.FC<InstallOptionsModalProps> = ({ onClose, onPwaInstall, onApkDownload, siteSettings }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-lg shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in">
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">Install App</h2>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Choose your preferred installation method.</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
                        <XIcon />
                    </button>
                </header>
                <div className="p-6 space-y-4">
                    <InstallOption
                        title="Install Web App (Recommended)"
                        description="Fast, lightweight, and works on all devices (Desktop, iOS, Android). Always up-to-date."
                        icon={<PwaIcon />}
                        onClick={onPwaInstall}
                    />
                    <InstallOption
                        title="Download for Android (APK)"
                        description="For advanced users. Get the standalone Android package. You may need to enable 'Install from unknown sources'."
                        icon={
                            siteSettings.logoSrc ?
                                <img src={siteSettings.logoSrc} alt="App logo" className="w-full h-full object-contain" /> :
                                <AndroidIcon />
                        }
                        onClick={onApkDownload}
                    />
                </div>
            </div>
        </div>
    );
};