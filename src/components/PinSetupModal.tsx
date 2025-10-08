

import React, { useState } from 'react';
import type { UserRole } from '../types';
import { CreatorDetails, SiteSettings } from '../constants';
import { AuthBrandingPanel } from './AuthBrandingPanel';

interface PinSetupModalProps {
  onSetPin: (pin: string, name: string) => void;
  mode: 'setup' | 'reset';
  siteSettings: SiteSettings;
  creatorDetails: CreatorDetails;
  showInstallButton: boolean;
  onInstallClick: () => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ onSetPin, mode, siteSettings, creatorDetails }) => {
  const [step, setStep] = useState<'name' | 'setPin'>(mode === 'setup' ? 'name' : 'setPin');
  const [name, setName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep('setPin');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPin.length !== 4) {
        setError('PIN must be 4 digits.');
        return;
    }
    if (newPin !== confirmPin) {
        setError('PINs do not match. Please try again.');
        setNewPin('');
        setConfirmPin('');
        return;
    }
    onSetPin(newPin, name);
  };

  const getTitle = () => {
      if (mode === 'reset') return 'Reset Your PIN';
      switch(step) {
          case 'name': return 'Setup Your Workspace';
          case 'setPin': return 'Create a Secure PIN';
      }
  }
  
  const getDescription = () => {
      if (mode === 'reset') return 'Please enter and confirm a new 4-digit PIN.';
      switch(step) {
          case 'name': return "First, let's get you set up with a name.";
          case 'setPin': return `Great, ${name}! Now create and confirm a 4-digit PIN.`;
      }
  }

  const renderContent = () => {
    if (step === 'name') {
        return (
             <form onSubmit={handleNameSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="user-name" className="block text-sm font-medium text-slate-400 mb-2">What should we call you?</label>
                    <input
                        id="user-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Alex"
                        className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-lg font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        autoFocus
                        required
                    />
                </div>
                 <button 
                    type="submit" 
                    style={{ backgroundColor: '#A0522D' }} 
                    className="w-full text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg" 
                    disabled={!name.trim()}
                >
                    Continue
                </button>
             </form>
        );
    }
    
    return (
        <form onSubmit={handlePinSubmit} className="mt-8 space-y-6">
            <input
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-center text-3xl tracking-[0.3em] font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500"
                autoFocus
            />
             <input
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-full bg-white border-2 border-slate-300 rounded-lg p-3 text-center text-3xl tracking-[0.3em] font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <button 
                type="submit" 
                style={{ backgroundColor: '#A0522D' }} 
                className="w-full text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-lg" 
                disabled={newPin.length !== 4 || confirmPin.length !== 4}
            >
                {mode === 'reset' ? 'Reset PIN' : 'Set PIN'}
            </button>
        </form>
    );
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start md:items-center justify-center p-4 auth-modal-container overflow-y-auto pt-16 md:pt-4 pb-8" aria-modal="true" role="dialog">
        <div className="bg-[var(--theme-bg)] w-full max-w-4xl rounded-xl shadow-2xl border border-slate-700/50 relative animate-modal-scale-in flex flex-col md:flex-row overflow-hidden md:min-h-[550px]">
            <AuthBrandingPanel creatorDetails={creatorDetails} />
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center relative auth-form-panel">
                <div className="animate-fade-in-down">
                    <h2 className="text-2xl sm:text-3xl font-bold text-orange-500">{getTitle()}</h2>
                    <p className="text-slate-400 mt-2 text-sm sm:text-base">{getDescription()}</p>
                </div>
                {renderContent()}
            </div>
        </div>
         <style>{`
            @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
            .animate-shake { animation: shake 0.5s ease-in-out; }
        `}</style>
    </div>
  );
};
