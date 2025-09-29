import React, { useState, useEffect } from 'react';
import { CREATOR_PIN, SiteSettings } from '../constants';
import { AuthBrandingPanel } from './AuthBrandingPanel';
import { DownloadIcon } from './icons/DownloadIcon';

interface PinSetupModalProps {
  onSetPin: (pin: string, name: string) => void;
  mode: 'setup' | 'reset';
  siteSettings: SiteSettings;
  showInstallButton: boolean;
  onInstallClick: () => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ onSetPin, mode, siteSettings, showInstallButton, onInstallClick }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showCreatorPopup, setShowCreatorPopup] = useState(false);

  useEffect(() => {
    if (showCreatorPopup) {
        const timer = setTimeout(() => {
            setShowCreatorPopup(false);
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [showCreatorPopup]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'setup' && !name.trim()) {
        setError("Please enter your name.");
        return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setError("PIN must be exactly 4 digits.");
        return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    if (pin.toLowerCase() === CREATOR_PIN.substring(0, 4)) {
        setShowCreatorPopup(true);
    }
    onSetPin(pin, name);
  };

  const title = mode === 'setup' ? 'Setup Your Workspace' : 'Reset Your PIN';
  const description = mode === 'setup' 
    ? "First, let's get your workspace set up with a name and a secure PIN."
    : "Please enter a new 4-digit PIN. This will replace your old PIN immediately.";

  return (
    <>
        {showCreatorPopup && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold py-2 px-4 rounded-full shadow-lg z-[110] animate-fade-in-down">
                Creator PIN detected!
            </div>
        )}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start md:items-center justify-center p-4 auth-modal-container overflow-y-auto pt-16 md:pt-4 pb-8" aria-modal="true" role="dialog">
            <div className="bg-slate-800 w-full max-w-4xl rounded-xl shadow-2xl border border-slate-700/50 relative animate-modal-scale-in flex flex-col md:flex-row overflow-hidden md:min-h-[550px]">
                <AuthBrandingPanel creator={siteSettings.creator} />
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center relative auth-form-panel">
                    <h2 className="text-2xl sm:text-3xl font-bold text-orange-500">{title}</h2>
                    <p className="text-slate-400 mt-2 text-sm sm:text-base">{description}</p>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {mode === 'setup' && (
                             <div>
                                <label htmlFor="user-name" className="block text-sm font-medium text-slate-400 mb-2">What should we call you?</label>
                                <input
                                    id="user-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="e.g., Alex"
                                    className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-lg font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    autoFocus={mode === 'setup'}
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="new-pin" className="block text-sm font-medium text-slate-400 mb-2">{mode === 'setup' ? 'Create a PIN' : 'New PIN'}</label>
                            <input
                                id="new-pin"
                                type="password"
                                inputMode="numeric"
                                pattern="\d{4}"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value.replace(/[^0-9]/g, ''));
                                    setError('');
                                }}
                                placeholder="••••"
                                className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-center text-3xl tracking-[0.3em] sm:p-4 sm:text-4xl sm:tracking-[0.5em] font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                autoFocus={mode === 'reset'}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-pin" className="block text-sm font-medium text-slate-400 mb-2">Confirm PIN</label>
                            <input
                                id="confirm-pin"
                                type="password"
                                inputMode="numeric"
                                pattern="\d{4}"
                                maxLength={4}
                                value={confirmPin}
                                onChange={(e) => {
                                    setConfirmPin(e.target.value.replace(/[^0-9]/g, ''));
                                    setError('');
                                }}
                                placeholder="••••"
                                className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-center text-3xl tracking-[0.3em] sm:p-4 sm:text-4xl sm:tracking-[0.5em] font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            style={{ backgroundColor: '#A0522D' }} // A brownish-orange color from image
                            className="w-full text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg"
                            disabled={(mode === 'setup' && !name.trim()) || pin.length < 4 || confirmPin.length < 4}
                        >
                            Save & Continue
                        </button>
                    </form>
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                        {showInstallButton && (
                            <button 
                                onClick={onInstallClick}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-orange-500 hover:underline transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>Install App</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};