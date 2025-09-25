import React, { useState, useEffect } from 'react';
import { CREATOR_PIN, SiteSettings } from '../constants';
import { AuthBrandingPanel } from './AuthBrandingPanel';

interface PinSetupModalProps {
  onSetPin: (pin: string) => void;
  mode: 'setup' | 'reset';
  siteSettings: SiteSettings;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ onSetPin, mode, siteSettings }) => {
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
    onSetPin(pin);
  };

  const title = mode === 'setup' ? 'Create Your PIN' : 'Reset Your PIN';
  const description = mode === 'setup' 
    ? "For security, please create a 4-digit PIN to protect access to your application."
    : "Please enter a new 4-digit PIN. This will replace your old PIN immediately.";

  return (
    <>
        {showCreatorPopup && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold py-2 px-4 rounded-full shadow-lg z-[110] animate-fade-in-down">
                Creator PIN detected!
            </div>
        )}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-card-bg)] w-full max-w-4xl rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col md:flex-row overflow-hidden min-h-[500px]">
                <AuthBrandingPanel creator={siteSettings.creator} />
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-[var(--theme-orange)]">{title}</h2>
                    <p className="text-[var(--theme-text-secondary)] mt-2">{description}</p>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <div>
                            <label htmlFor="new-pin" className="sr-only">New PIN</label>
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
                                placeholder="Enter 4-digit PIN"
                                className="w-full bg-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] rounded-lg p-4 text-center text-3xl tracking-[0.5em] font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)]"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-pin" className="sr-only">Confirm PIN</label>
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
                                placeholder="Confirm PIN"
                                className="w-full bg-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] rounded-lg p-4 text-center text-3xl tracking-[0.5em] font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)]"
                            />
                        </div>
                        {error && <p className="text-[var(--theme-red)] text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            style={{ backgroundColor: 'var(--theme-orange)'}}
                            className="w-full text-black font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg"
                            disabled={pin.length < 4 || confirmPin.length < 4}
                        >
                            Save & Continue
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </>
  );
};
