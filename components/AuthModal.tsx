import React, { useState } from 'react';
import { UserRole } from '../App';
import { CREATOR_PIN, SiteSettings } from '../constants';
import { AuthBrandingPanel } from './AuthBrandingPanel';

interface AuthModalProps {
  onUnlock: (role: UserRole) => void;
  userPin?: string;
  siteSettings: SiteSettings;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onUnlock, userPin, siteSettings }) => {
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
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full max-w-4xl rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        <AuthBrandingPanel creator={siteSettings.creator} />

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center relative">
          {isCreatorLogin ? (
            <div className="animate-fade-in-down">
              <h2 className="text-3xl font-bold text-[var(--theme-orange)]">Creator Login</h2>
              <p className="text-[var(--theme-text-secondary)] mt-2">Please enter the master PIN to access creator privileges.</p>
              <form onSubmit={handleCreatorSubmit} className="mt-8 space-y-4">
                  <input
                      id="creator-pin-input"
                      type="password"
                      maxLength={5}
                      value={creatorPinInput}
                      onChange={handleCreatorPinChange}
                      placeholder="*****"
                      className="w-full bg-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] rounded-lg p-4 text-center text-3xl tracking-[0.5em] font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)]"
                      autoFocus
                  />
                  {error && <p className="text-[var(--theme-red)] text-sm text-center">{error}</p>}
                  <button type="submit" style={{backgroundColor: 'var(--theme-orange)'}} className="w-full text-black font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg" disabled={!creatorPinInput}>Unlock</button>
              </form>
              <div className="text-center mt-4">
                    <button onClick={() => { setIsCreatorLogin(false); setError(''); }} className="text-sm text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-orange)] hover:underline transition-colors">← Back to User Login</button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-down">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-[var(--theme-text-secondary)] mt-2">Enter your 4-digit PIN to access your workspace.</p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <input
                  id="pin-input"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="****"
                  className="w-full bg-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] rounded-lg p-4 text-center text-3xl tracking-[0.5em] font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)]"
                  autoFocus
                />
                {error && <p className="text-[var(--theme-red)] text-sm text-center">{error}</p>}
                <button type="submit" style={{backgroundColor: 'var(--theme-orange)'}} className="w-full text-black font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg" disabled={pin.length < 4}>Unlock</button>
              </form>
              <div className="absolute bottom-4 right-4">
                  <button onClick={() => { setIsCreatorLogin(true); setError(''); setPin(''); }} className="text-xs text-[var(--theme-text-secondary)]/70 hover:text-[var(--theme-orange)] hover:underline transition-colors">Admin Login</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};