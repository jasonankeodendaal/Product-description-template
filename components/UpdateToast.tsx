import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface UpdateToastProps {
  onUpdate: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({ onUpdate }) => {
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[var(--theme-orange)] text-black rounded-full shadow-2xl animate-fade-in-down flex items-center gap-4 px-5 py-3"
      role="alert"
      aria-live="assertive"
    >
      <DownloadIcon />
      <p className="text-sm font-semibold">A new version is available!</p>
      <button
        onClick={onUpdate}
        className="ml-2 font-bold text-black underline hover:opacity-80 transition-opacity text-sm"
      >
        Reload
      </button>
    </div>
  );
};