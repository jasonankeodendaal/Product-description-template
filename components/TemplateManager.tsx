import React, { useState, useMemo } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { Template } from '../App';
import { FolderIcon } from './icons/FolderIcon';

interface TemplateManagerProps {
  templates: Template[];
  onAddTemplate: (name: string, prompt: string, category: string) => void;
  onEditTemplate: (id: string, newName: string, newPrompt: string, newCategory: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = React.memo(({ templates, onAddTemplate, onEditTemplate }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [error, setError] = useState('');

  // State for editing template names
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrompt, setEditingPrompt] = useState('');
  const [editingCategory, setEditingCategory] = useState('');

  // State for collapsible categories
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templatePrompt.trim() || !templateCategory.trim()) {
      setError('All fields (Name, Category, Prompt) are required.');
      return;
    }
    onAddTemplate(templateName, templatePrompt, templateCategory);
    setTemplateName('');
    setTemplatePrompt('');
    setTemplateCategory('');
    setError('');
  };

  const handleEditClick = (template: Template) => {
    setEditingId(template.id);
    setEditingName(template.name);
    setEditingPrompt(template.prompt);
    setEditingCategory(template.category || '');
  };

  const handleEditSave = (id: string) => {
    if (editingName.trim() && editingPrompt.trim() && editingCategory.trim()) {
      onEditTemplate(id, editingName.trim(), editingPrompt.trim(), editingCategory.trim());
      setEditingId(null);
      setEditingName('');
      setEditingPrompt('');
      setEditingCategory('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingPrompt('');
    setEditingCategory('');
  };
  
  const groupedTemplates = useMemo(() => {
    return templates.reduce((acc, template) => {
        const category = template.category?.trim() || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(template);
        return acc;
    }, {} as Record<string, Template[]>);
  }, [templates]);
  
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        return newSet;
    });
  };

  return (
    <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl rounded-lg shadow-lg border border-[var(--theme-border)] mb-8">
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isFormVisible}
      >
        <h2 className="text-lg font-semibold text-[var(--theme-orange)] flex items-center gap-2">
          <PlusIcon />
          Template Management
        </h2>
        <ChevronDownIcon
          className={`h-5 w-5 text-[var(--theme-text-secondary)] transition-transform duration-200 ${
            isFormVisible ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isFormVisible && (
        <div className="p-6 border-t border-[var(--theme-border)] divide-y divide-[var(--theme-border)]/50">
          {/* Add New Template Form */}
          <div className="pb-6">
            <h3 className="font-semibold text-[var(--theme-text-primary)] mb-4">Add New Template</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-2">
                    Template Name
                    </label>
                    <input
                    id="template-name"
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., My Custom Product Template"
                    className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)] transition-shadow duration-200"
                    />
                </div>
                <div>
                    <label htmlFor="template-category" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-2">
                    Category
                    </label>
                    <input
                    id="template-category"
                    type="text"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    placeholder="e.g., Electronics, Fashion"
                    className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)] transition-shadow duration-200"
                    />
                </div>
              </div>
              <div>
                <label htmlFor="template-prompt" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-2">
                  Template Prompt
                </label>
                <textarea
                  id="template-prompt"
                  value={templatePrompt}
                  onChange={(e) => setTemplatePrompt(e.target.value)}
                  placeholder="Paste your full AI prompt template here..."
                  className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)] transition-shadow duration-200 min-h-[200px] resize-y"
                  rows={8}
                />
              </div>
              {error && <p className="text-[var(--theme-red)] text-sm">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  style={{backgroundColor: 'var(--theme-orange)'}}
                  className="text-black font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] transition-colors duration-200"
                >
                  Save New Template
                </button>
              </div>
            </form>
          </div>

          {/* Existing Templates List */}
          <div className="pt-6">
            <h3 className="font-semibold text-[var(--theme-text-primary)] mb-4">Existing Templates</h3>
            <div className="space-y-3">
              {/* FIX: Refactored to use Object.keys().sort().map() for more reliable type inference and to prevent 'map does not exist on type unknown' error. */}
              {Object.keys(groupedTemplates).sort().map(category => {
                const templatesInCategory = groupedTemplates[category];
                const isCollapsed = collapsedCategories.has(category);
                return (
                    <div key={category} className="bg-[var(--theme-bg)]/50 rounded-md overflow-hidden">
                        <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-3 text-left font-semibold text-[var(--theme-text-secondary)] hover:bg-white/5">
                            <span className="flex items-center gap-2"><FolderIcon className="w-5 h-5" /> {category}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                        {!isCollapsed && (
                             <ul className="p-3 pt-0 space-y-2">
                                {templatesInCategory.map(template => (
                                    <li key={template.id} className="bg-[var(--theme-bg)]/80 p-3 rounded-md flex flex-col items-start">
                                    {editingId === template.id ? (
                                        <div className="w-full space-y-3">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md py-1 px-2 text-[var(--theme-dark-bg)] focus:ring-1 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)]"
                                                autoFocus
                                            />
                                            <input
                                                type="text"
                                                value={editingCategory}
                                                onChange={(e) => setEditingCategory(e.target.value)}
                                                placeholder="Category"
                                                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md py-1 px-2 text-[var(--theme-dark-bg)] focus:ring-1 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)]"
                                            />
                                            <textarea
                                                value={editingPrompt}
                                                onChange={(e) => setEditingPrompt(e.target.value)}
                                                className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-orange)] focus:border-[var(--theme-orange)] transition-shadow duration-200 min-h-[200px] resize-y"
                                                rows={8}
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={handleEditCancel} className="text-sm text-[var(--theme-text-secondary)] hover:text-white px-3 py-1">Cancel</button>
                                                <button onClick={() => handleEditSave(template.id)} className="text-sm bg-[var(--theme-orange)] hover:opacity-90 text-black font-semibold py-1 px-3 rounded-md">Save Changes</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full flex justify-between items-center">
                                        <span className="text-[var(--theme-text-primary)]">{template.name}</span>
                                        <button onClick={() => handleEditClick(template)} className="text-sm text-[var(--theme-orange)] hover:underline font-medium">Edit</button>
                                        </div>
                                    )}
                                    </li>
                                ))}
                             </ul>
                        )}
                    </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});