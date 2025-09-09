import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';

interface AuthModalProps {
  onClose: () => void;
  onUnlock: () => void;
}

const UNLOCK_CODE = '1723';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === UNLOCK_CODE) {
      onUnlock();
    } else {
      setError('Incorrect code. Please try again.');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] w-full max-w-md rounded-lg shadow-xl border border-[var(--theme-border)] relative">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[var(--theme-blue)]">Dashboard Access</h2>
          <p className="text-[var(--theme-text-secondary)] mt-2">Please enter the access code to manage site settings.</p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="access-code" className="sr-only">Access Code</label>
              <input
                id="access-code"
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="****"
                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-center text-lg tracking-widest font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-blue)] focus:border-[var(--theme-blue)] transition-shadow duration-200"
                autoFocus
              />
            </div>
            {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
            <button
              type="submit"
              style={{ backgroundColor: 'var(--theme-blue)'}}
              className="w-full text-white font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] transition-colors duration-200"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
            <XIcon />
        </button>
      </div>
    </div>
  );
};