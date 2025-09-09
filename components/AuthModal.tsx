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
      <div className="bg-slate-800 w-full max-w-md rounded-lg shadow-xl border border-slate-700 relative">
        <div className="p-6">
          <h2 className="text-xl font-bold text-sky-300">Dashboard Access</h2>
          <p className="text-slate-400 mt-2">Please enter the access code to manage site settings.</p>
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
                className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-3 text-center text-lg tracking-widest font-mono text-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-200"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-500 disabled:bg-slate-600 transition-colors duration-200"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300" aria-label="Close">
            <XIcon />
        </button>
      </div>
    </div>
  );
};