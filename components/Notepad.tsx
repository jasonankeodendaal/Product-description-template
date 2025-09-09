import React, { useState, useEffect, useMemo } from 'react';
import { Note } from '../App';
import { XIcon } from './icons/XIcon';
import { SaveIcon } from './icons/SaveIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface NotepadProps {
  onClose: () => void;
  notes: Note[];
  onSave: (note: Note) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const Notepad: React.FC<NotepadProps> = ({ onClose, notes, onSave, onDelete }) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [formState, setFormState] = useState({ title: '', content: '', category: 'General' });

    const categories = useMemo(() => {
        const catSet = new Set(notes.map(n => n.category || 'General'));
        return ['All', ...Array.from(catSet).sort()];
    }, [notes]);

    const filteredNotes = useMemo(() => {
        const sorted = [...notes].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
        if (activeCategory === 'All') return sorted;
        return sorted.filter(n => (n.category || 'General') === activeCategory);
    }, [notes, activeCategory]);

    useEffect(() => {
        if (selectedNote) {
            setFormState({
                title: selectedNote.title,
                content: selectedNote.content,
                category: selectedNote.category || 'General'
            });
        }
    }, [selectedNote]);

    const handleNewNote = () => {
        setSelectedNote(null);
        setFormState({ title: '', content: '', category: activeCategory !== 'All' ? activeCategory : 'General' });
    };

    const handleSave = async () => {
        const now = new Date().toISOString();
        const noteToSave: Note = {
            id: selectedNote?.id || crypto.randomUUID(),
            title: formState.title.trim() || 'Untitled Note',
            content: formState.content,
            category: formState.category.trim() || 'General',
            createdAt: selectedNote?.createdAt || now,
            updatedAt: now,
        };
        await onSave(noteToSave);
        setSelectedNote(noteToSave);
    };

    const handleDelete = async () => {
        if (!selectedNote) return;
        if (window.confirm(`Delete "${selectedNote.title}"?`)) {
            await onDelete(selectedNote.id);
            setSelectedNote(null);
            setFormState({ title: '', content: '', category: 'General' });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-card-bg)] w-full h-full md:max-w-5xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col">
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Notepad</h2>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Capture and categorize your ideas.</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
                </header>
                <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* Categories and Notes List */}
                    <div className="w-full md:w-2/5 border-b md:border-r md:border-b-0 border-[var(--theme-border)] flex flex-col h-1/2 md:h-full">
                        <div className="p-2 border-b border-[var(--theme-border)] flex-shrink-0">
                            <h3 className="font-semibold text-sm px-2 py-1">Categories</h3>
                             <div className="flex flex-wrap gap-1 p-1">
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-xs font-semibold px-2 py-1 rounded-full ${activeCategory === cat ? 'bg-[var(--theme-blue)] text-white' : 'bg-[var(--theme-bg)]/50 text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div className="overflow-y-auto flex-grow p-2">
                             {filteredNotes.map(note => (
                                 <button key={note.id} onClick={() => setSelectedNote(note)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedNote?.id === note.id ? 'bg-[var(--theme-blue)]/20' : 'hover:bg-[var(--theme-bg)]/50'}`}>
                                     <p className="font-medium text-[var(--theme-text-primary)] truncate">{note.title}</p>
                                     <p className="text-xs text-[var(--theme-text-secondary)] mt-1">{new Date(note.updatedAt).toLocaleString()}</p>
                                 </button>
                             ))}
                        </div>
                         <div className="p-2 border-t border-[var(--theme-border)] flex-shrink-0">
                            <button onClick={handleNewNote} className="w-full flex items-center justify-center gap-2 bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] font-semibold py-2 px-3 rounded-md text-sm"><PlusIcon/> New Note</button>
                        </div>
                    </div>
                    {/* Editor Panel */}
                    <div className="w-full md:w-3/5 p-6 flex flex-col overflow-y-auto">
                        <div className="flex-grow flex flex-col space-y-4">
                            <input type="text" placeholder="Note Title" value={formState.title} onChange={e => setFormState(s => ({...s, title: e.target.value}))} className="w-full bg-transparent text-2xl font-bold text-[var(--theme-text-primary)] focus:outline-none"/>
                            <input type="text" placeholder="Category" value={formState.category} onChange={e => setFormState(s => ({...s, category: e.target.value}))} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 text-sm text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"/>
                            <textarea placeholder="Start writing..." value={formState.content} onChange={e => setFormState(s => ({...s, content: e.target.value}))} className="w-full flex-grow bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 resize-none text-base leading-relaxed text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60"/>
                        </div>
                        <div className="mt-auto pt-4 flex justify-between items-center flex-shrink-0">
                            <div>{selectedNote && <button onClick={handleDelete} className="text-[var(--theme-red)] hover:underline flex items-center gap-2 p-2"><TrashIcon/> Delete</button>}</div>
                            <button onClick={handleSave} style={{backgroundColor: 'var(--theme-green)'}} className="text-white font-bold py-2 px-4 rounded-md hover:opacity-90 flex items-center gap-2"><SaveIcon /> Save Note</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
};