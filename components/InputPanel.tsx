import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { Template } from '../App';

interface InputPanelProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
  templates: Template[];
  selectedTemplateId: string;
  onTemplateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  tone: string;
  onToneChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ 
  value, 
  onChange, 
  onGenerate, 
  isLoading, 
  templates,
  selectedTemplateId,
  onTemplateChange,
  tone,
  onToneChange
}) => {

  return (
    <div className="bg-[var(--theme-card-bg)] p-6 rounded-lg shadow-lg border border-[var(--theme-border)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-[var(--theme-blue)]">1. Select Template & Add Info</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
            Choose a Template
            </label>
            <select
            id="template-select"
            value={selectedTemplateId}
            onChange={onTemplateChange}
            disabled={isLoading}
            className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] focus:ring-2 focus:ring-[var(--theme-yellow)] focus:border-[var(--theme-yellow)] transition-shadow duration-200"
            >
            {templates.map(template => (
                <option key={template.id} value={template.id}>
                {template.name}
                </option>
            ))}
            </select>
        </div>
        <div>
            <label htmlFor="tone-select" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
            Tone of Voice
            </label>
            <select
            id="tone-select"
            value={tone}
            onChange={onToneChange}
            disabled={isLoading}
            className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] focus:ring-2 focus:ring-[var(--theme-yellow)] focus:border-[var(--theme-yellow)] transition-shadow duration-200"
            >
                <option>Professional</option>
                <option>Casual</option>
                <option>Persuasive</option>
                <option>Technical</option>
            </select>
        </div>
      </div>


      <p className="text-[var(--theme-text-secondary)] mb-4 text-sm">
        Paste your product details below. The more information you provide, the better the result.
      </p>
      <textarea
        value={value}
        onChange={onChange}
        placeholder="e.g., Brand: Defy, Model: HB 7721 X, Power: 600W, a hand blender with whisk..."
        className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-yellow)] focus:border-[var(--theme-yellow)] transition-shadow duration-200 min-h-[200px] resize-y flex-grow"
        rows={10}
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !selectedTemplateId}
        style={{ backgroundColor: 'var(--theme-blue)' }}
        className="mt-6 w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:text-[var(--theme-text-secondary)]/50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon />
            Generate Description
          </>
        )}
      </button>
    </div>
  );
};