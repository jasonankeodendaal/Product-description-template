import React, { useState } from 'react';

interface PinSetupModalProps {
  onSetPin: (pin: string) => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ onSetPin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    onSetPin(pin);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] w-full max-w-md rounded-lg shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-[var(--theme-green)]">Welcome!</h2>
          <p className="text-[var(--theme-text-secondary)] mt-2">
            For your security, please create a 4-digit PIN to protect access to your dashboard and settings.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="new-pin" className="sr-only">New PIN</label>
              <input
                id="new-pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-center text-lg tracking-widest font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-green)]"
                autoFocus
              />
            </div>
             <div>
              <label htmlFor="confirm-pin" className="sr-only">Confirm PIN</label>
              <input
                id="confirm-pin"
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setError('');
                }}
                placeholder="Confirm PIN"
                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-center text-lg tracking-widest font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-green)]"
              />
            </div>
            {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
            <button
              type="submit"
              style={{ backgroundColor: 'var(--theme-green)'}}
              className="w-full text-black font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 transition-colors"
              disabled={!pin || !confirmPin}
            >
              Save & Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
