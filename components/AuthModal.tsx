import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { UserRole } from '../App';
import { CREATOR_PIN } from '../constants';

interface AuthModalProps {
  onClose: () => void;
  onUnlock: (role: UserRole) => void;
  userPin?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onUnlock, userPin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === userPin) {
      onUnlock('user');
    } else if (code === CREATOR_PIN) {
      onUnlock('creator');
    } else {
      setError('Incorrect code. Please try again.');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-dark-bg)] w-full max-w-md rounded-lg shadow-xl border border-[var(--theme-border)] relative">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[var(--theme-green)]">Dashboard Access</h2>
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
                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-center text-lg tracking-widest font-mono text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-green)] focus:border-[var(--theme-green)] transition-shadow duration-200"
                autoFocus
              />
            </div>
            {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
            <button
              type="submit"
              style={{ backgroundColor: 'var(--theme-green)'}}
              className="w-full text-black font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] transition-colors duration-200"
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