import React, { useState } from 'react';
import { UserRole } from '../App';
import { CREATOR_PIN, SiteSettings } from '../constants';
import { AuthBrandingPanel } from './AuthBrandingPanel';
import { DownloadIcon } from './icons/DownloadIcon';
import { UserIcon } from './icons/UserIcon';
import { ShieldIcon } from './icons/ShieldIcon';

interface AuthModalProps {
  onUnlock: (role: UserRole) => void;
  userPin?: string;
  siteSettings: SiteSettings;
  showInstallButton: boolean;
  onInstallClick: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onUnlock, userPin, siteSettings, showInstallButton, onInstallClick }) => {
  const [view, setView] = useState<'selection' | 'userLogin' | 'creatorLogin'>('selection');
  const [pin, setPin] = useState('');
  const [creatorPinInput, setCreatorPinInput] = useState('');
  const [error, setError] = useState('');

  const handleUserPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
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

  const handleUserSubmit = (e: React.FormEvent) => {
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

  const resetState = () => {
    setPin('');
    setCreatorPinInput('');
    setError('');
  };

  const handleBack = () => {
    resetState();
    setView('selection');
  };

  const renderSelectionView = () => (
    <div className="animate-fade-in-down">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome</h2>
      <p className="text-slate-400 mt-2 text-sm sm:text-base">Please select an option to continue.</p>
      <div className="mt-8 space-y-4">
        <button 
          onClick={() => setView('userLogin')}
          style={{ backgroundColor: '#A0522D' }} 
          className="w-full text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 transition-colors text-lg flex items-center justify-center gap-3"
        >
          <UserIcon className="h-6 w-6" />
          <span>User Login</span>
        </button>
        <button 
          onClick={() => setView('creatorLogin')}
          className="w-full text-slate-300 bg-slate-700/50 hover:bg-slate-700 font-bold py-4 px-4 rounded-lg transition-colors text-lg flex items-center justify-center gap-3"
        >
          <ShieldIcon />
          <span>Creator Login</span>
        </button>
        {showInstallButton && (
          <button 
            onClick={onInstallClick}
            style={{ backgroundColor: 'var(--theme-orange)' }}
            className="w-full text-black font-bold py-4 px-4 rounded-lg transition-colors text-lg flex items-center justify-center gap-3 hover:opacity-90"
          >
            <DownloadIcon className="h-6 w-6" />
            <span>Install App</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderUserLoginView = () => (
    <div className="animate-fade-in-down">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">User Login</h2>
      <p className="text-slate-400 mt-2 text-sm sm:text-base">Enter your 4-digit PIN to access your workspace.</p>
      <form onSubmit={handleUserSubmit} className="mt-8 space-y-6">
        <input
          id="pin-input"
          type="password"
          maxLength={4}
          value={pin}
          onChange={handleUserPinChange}
          placeholder="••••"
          className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-center text-3xl tracking-[0.3em] sm:p-4 sm:text-4xl sm:tracking-[0.5em] font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button 
          type="submit" 
          style={{ backgroundColor: '#A0522D' }} 
          className="w-full text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg" 
          disabled={pin.length < 4}
        >
          Unlock
        </button>
      </form>
      <div className="text-center mt-6">
        <button onClick={handleBack} className="text-sm text-slate-400 hover:text-orange-500 hover:underline transition-colors">← Back to options</button>
      </div>
    </div>
  );

  const renderCreatorLoginView = () => (
    <div className="animate-fade-in-down">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500">Creator Login</h2>
      <p className="text-slate-400 mt-2 text-sm sm:text-base">Please enter the master PIN to access creator privileges.</p>
      <form onSubmit={handleCreatorSubmit} className="mt-8 space-y-6">
        <input
          id="creator-pin-input"
          type="password"
          maxLength={5}
          value={creatorPinInput}
          onChange={handleCreatorPinChange}
          placeholder="•••••"
          className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-center text-3xl tracking-[0.3em] sm:p-4 sm:text-4xl sm:tracking-[0.5em] font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button 
          type="submit" 
          style={{ backgroundColor: '#A0522D' }} 
          className="w-full text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg" 
          disabled={!creatorPinInput}
        >
          Unlock
        </button>
      </form>
      <div className="text-center mt-6">
        <button onClick={handleBack} className="text-sm text-slate-400 hover:text-orange-500 hover:underline transition-colors">← Back to options</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'userLogin':
        return renderUserLoginView();
      case 'creatorLogin':
        return renderCreatorLoginView();
      case 'selection':
      default:
        return renderSelectionView();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start md:items-center justify-center p-4 auth-modal-container overflow-y-auto pt-16 md:pt-4 pb-8" aria-modal="true" role="dialog">
      <div className="bg-slate-800 w-full max-w-4xl rounded-xl shadow-2xl border border-slate-700/50 relative animate-modal-scale-in flex flex-col md:flex-row overflow-hidden md:min-h-[550px]">
        <AuthBrandingPanel creator={siteSettings.creator} />
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center relative auth-form-panel">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};