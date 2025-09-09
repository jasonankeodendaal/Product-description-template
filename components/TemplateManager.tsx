import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { Template } from '../App';

interface TemplateManagerProps {
  templates: Template[];
  onAddTemplate: (name: string, prompt: string) => void;
  onEditTemplate: (id: string, newName: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = React.memo(({ templates, onAddTemplate, onEditTemplate }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [error, setError] = useState('');

  // State for editing template names
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templatePrompt.trim()) {
      setError('Both template name and prompt are required.');
      return;
    }
    onAddTemplate(templateName, templatePrompt);
    setTemplateName('');
    setTemplatePrompt('');
    setError('');
  };

  const handleEditClick = (template: Template) => {
    setEditingId(template.id);
    setEditingName(template.name);
  };

  const handleEditSave = (id: string) => {
    if (editingName.trim()) {
      onEditTemplate(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="bg-[var(--theme-card-bg)] rounded-lg shadow-lg border border-[var(--theme-border)] mb-8">
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isFormVisible}
      >
        <h2 className="text-lg font-semibold text-[var(--theme-blue)] flex items-center gap-2">
          <PlusIcon />
          Template Management
        </h2>
        <ChevronDownIcon
          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
            isFormVisible ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isFormVisible && (
        <div className="p-6 border-t border-[var(--theme-border)] divide-y divide-slate-700/50">
          {/* Add New Template Form */}
          <div className="pb-6">
            <h3 className="font-semibold text-slate-200 mb-4">Add New Template</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="template-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Template Name
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., My Custom Product Template"
                  className="w-full bg-slate-900/80 border border-[var(--theme-border)] rounded-md p-3 text-slate-300 focus:ring-2 focus:ring-[var(--theme-yellow)] focus:border-[var(--theme-yellow)] transition-shadow duration-200"
                />
              </div>
              <div>
                <label htmlFor="template-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                  Template Prompt
                </label>
                <textarea
                  id="template-prompt"
                  value={templatePrompt}
                  onChange={(e) => setTemplatePrompt(e.target.value)}
                  placeholder="Paste your full AI prompt template here..."
                  className="w-full bg-slate-900/80 border border-[var(--theme-border)] rounded-md p-3 text-slate-300 focus:ring-2 focus:ring-[var(--theme-yellow)] focus:border-[var(--theme-yellow)] transition-shadow duration-200 min-h-[200px] resize-y"
                  rows={8}
                />
              </div>
              {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  style={{backgroundColor: 'var(--theme-green)'}}
                  className="text-white font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-slate-600 transition-colors duration-200"
                >
                  Save New Template
                </button>
              </div>
            </form>
          </div>

          {/* Existing Templates List */}
          <div className="pt-6">
            <h3 className="font-semibold text-slate-200 mb-4">Existing Templates</h3>
            <ul className="space-y-3">
              {templates.map(template => (
                <li key={template.id} className="bg-slate-900/50 p-3 rounded-md flex items-center justify-between">
                  {editingId === template.id ? (
                    <div className="flex-grow flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-500 rounded-md py-1 px-2 text-slate-200 focus:ring-1 focus:ring-[var(--theme-yellow)] focus:border-[var(--theme-yellow)]"
                        autoFocus
                      />
                      <button onClick={() => handleEditSave(template.id)} className="text-sm bg-[var(--theme-blue)] hover:opacity-90 text-white font-semibold py-1 px-3 rounded-md">Save</button>
                      <button onClick={handleEditCancel} className="text-sm text-slate-400 hover:text-white">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-300">{template.name}</span>
                      <button onClick={() => handleEditClick(template)} className="text-sm text-[var(--theme-yellow)] hover:underline font-medium">Edit</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});