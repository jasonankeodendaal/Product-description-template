import React, { useState } from 'react';
import { UserRole } from '../App';
import { CREATOR_PIN } from '../constants';

interface AuthModalProps {
  onUnlock: (role: UserRole) => void;
  userPin?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onUnlock, userPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isCreatorLogin, setIsCreatorLogin] = useState(false);
  const [creatorPinInput, setCreatorPinInput] = useState('');

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (value.length <= 4) {
      setPin(value);
      setError('');
    }
  };
  
  const handleCreatorPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9jJ]/gi, '');
     if (value.length <= 5) {
      setCreatorPinInput(value);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPin && pin === userPin) {
        onUnlock('user');
    } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
    }
  };

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creatorPinInput.toLowerCase() === CREATOR_PIN.toLowerCase()) {
        onUnlock('creator');
    } else {
        setError('Incorrect Creator PIN.');
        setCreatorPinInput('');
    }
  };
  
  if (isCreatorLogin) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-dark-bg)] w-full max-w-sm rounded-lg shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--theme-border)] text-center">
                    <h2 className="text-lg font-bold text-[var(--theme-green)]">Creator Login</h2>
                </header>
                <div className="p-6 text-center">
                    <p className="text-[var(--theme-text-secondary)]">Please enter the Creator PIN.</p>
                    <form onSubmit={handleCreatorSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="creator-pin-input" className="sr-only">Creator PIN</label>
                            <input
                                id="creator-pin-input"
                                type="password"
                                maxLength={5}
                                value={creatorPinInput}
                                onChange={handleCreatorPinChange}
                                placeholder="*****"
                                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-center text-2xl tracking-[0.5em] font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-green)]"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
                        <button
                            type="submit"
                            style={{backgroundColor: 'var(--theme-green)'}}
                            className="w-full text-black font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 transition-colors"
                            disabled={!creatorPinInput}
                        >
                            Unlock
                        </button>
                    </form>
                </div>
                <div className="absolute bottom-2 left-4">
                    <button 
                        onClick={() => { setIsCreatorLogin(false); setError(''); }}
                        className="text-xs text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-green)] hover:underline transition-colors"
                    >
                        ← Back to User Login
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] w-full max-w-sm rounded-lg shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-[var(--theme-border)] text-center">
          <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">Authentication Required</h2>
        </header>
        <div className="p-6 text-center">
          <p className="text-[var(--theme-text-secondary)]">
            Please enter your PIN to continue.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="pin-input" className="sr-only">PIN</label>
              <input
                id="pin-input"
                type="password"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                placeholder="****"
                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-center text-2xl tracking-[0.5em] font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-green)]"
                autoFocus
              />
            </div>
            {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
            <button
              type="submit"
              style={{backgroundColor: 'var(--theme-green)'}}
              className="w-full text-black font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 transition-colors"
              disabled={!pin}
            >
              Unlock
            </button>
          </form>
        </div>
        {/* Admin Login Shortcut */}
        <div className="absolute bottom-2 right-4">
            <button 
                onClick={() => { setIsCreatorLogin(true); setError(''); setPin(''); }}
                className="text-xs text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-green)] hover:underline transition-colors"
            >
                Admin Login
            </button>
        </div>
      </div>
    </div>
  );
};