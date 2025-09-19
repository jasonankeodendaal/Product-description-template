import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: SiteSettings is exported from constants.ts, not App.tsx.
import { Note } from '../App';
import { SiteSettings } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MagicIcon } from './icons/MagicIcon';

interface NotepadProps {
    notes: Note[];
    onSave: (note: Note) => Promise<void>;
    onUpdate: (note: Note) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    siteSettings: SiteSettings;
}

export const Notepad: React.FC<NotepadProps> = ({ notes, onSave, onUpdate, onDelete, siteSettings }) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [aiAction, setAiAction] = useState('summarize');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (notes.length > 0 && !selectedNote) {
            setSelectedNote(notes[0]);
        } else if (selectedNote) {
            // Keep selected note in sync with parent state
            const updatedSelected = notes.find(n => n.id === selectedNote.id);
            setSelectedNote(updatedSelected || null);
        }
        if (notes.length === 0) {
            setSelectedNote(null);
        }
    }, [notes, selectedNote]);
    
    const handleAddNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '',
            category: 'General',
            tags: [],
            date: new Date().toISOString(),
        };
        await onSave(newNote);
        setSelectedNote(newNote);
    }, [onSave]);
    
    const handleDeleteNote = useCallback(async (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            await onDelete(id);
            if (selectedNote?.id === id) {
                setSelectedNote(notes.length > 1 ? notes[0] : null);
            }
        }
    }, [notes, selectedNote, onDelete]);

    const handleAiAction = useCallback(async () => {
        if (!selectedNote || !selectedNote.content) return;
        setIsAiLoading(true);
        let prompt = '';
        switch (aiAction) {
            case 'summarize': prompt = 'Summarize the following text:'; break;
            case 'improve': prompt = 'Improve the writing and fix any grammar errors in the following text:'; break;
            case 'keywords': prompt = 'Extract the most relevant keywords (as a comma-separated list) from the following text:'; break;
            default: return;
        }

        try {
            const response = await fetch(`${siteSettings.customApiEndpoint || ''}/api/ai-action`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${siteSettings.customApiAuthKey || ''}`
                },
                body: JSON.stringify({ prompt, context: selectedNote.content }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            await onUpdate({ ...selectedNote, content: selectedNote.content + `\n\n---\n\n**AI ${aiAction}:**\n${data.text}` });

        } catch (err) {
            alert(`AI Action Failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsAiLoading(false);
            setIsAiPanelOpen(false);
        }
    }, [selectedNote, aiAction, siteSettings, onUpdate]);


    return (
        <div className="flex h-full bg-[var(--theme-bg)]">
            <aside className="w-1/3 max-w-xs h-full flex flex-col border-r border-[var(--theme-border)]">
                <div className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <h2 className="text-xl font-bold">Notepad</h2>
                    <button onClick={handleAddNote} className="p-2 hover:bg-[var(--theme-card-bg)] rounded-full"><PlusIcon /></button>
                </div>
                <ul className="overflow-y-auto flex-grow">
                    {notes.map(note => (
                        <li key={note.id}>
                            <button 
                                onClick={() => setSelectedNote(note)}
                                className={`w-full text-left p-4 border-b border-[var(--theme-border)] hover:bg-[var(--theme-card-bg)] ${selectedNote?.id === note.id ? 'bg-[var(--theme-green)]/10' : ''}`}
                            >
                                <h3 className="font-semibold truncate">{note.title}</h3>
                                <p className="text-sm text-[var(--theme-text-secondary)] truncate">{note.content.substring(0, 50) || 'No content'}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="flex-1 h-full flex flex-col pb-24 lg:pb-0">
                {selectedNote ? (
                    <>
                    <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                        <input
                            type="text"
                            value={selectedNote.title}
                            onChange={e => onUpdate({ ...selectedNote, title: e.target.value })}
                            className="text-xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-green)] focus:outline-none w-full"
                        />
                         <div className="flex items-center gap-2">
                             <div className="relative">
                                <button onClick={() => setIsAiPanelOpen(p => !p)} className="flex items-center gap-2 bg-[var(--theme-card-bg)] hover:bg-[var(--theme-bg)] p-2 rounded-md">
                                    <MagicIcon />
                                    <span className="text-sm font-semibold">AI Actions</span>
                                </button>
                                {isAiPanelOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--theme-dark-bg)] border border-[var(--theme-border)] rounded-lg shadow-lg p-2 z-10">
                                        <select value={aiAction} onChange={e => setAiAction(e.target.value)} className="w-full bg-black/20 p-2 rounded-md mb-2">
                                            <option value="summarize">Summarize</option>
                                            <option value="improve">Improve Writing</option>
                                            <option value="keywords">Extract Keywords</option>
                                        </select>
                                        <button onClick={handleAiAction} disabled={isAiLoading} className="w-full bg-[var(--theme-green)] text-black font-bold py-2 px-3 rounded-md text-sm disabled:bg-gray-500">
                                            {isAiLoading ? 'Working...' : 'Run Action'}
                                        </button>
                                    </div>
                                )}
                             </div>
                            <button onClick={() => handleDeleteNote(selectedNote.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
                         </div>
                    </header>
                    <textarea
                        value={selectedNote.content}
                        onChange={e => onUpdate({ ...selectedNote, content: e.target.value })}
                        className="flex-grow w-full p-6 bg-transparent text-lg leading-relaxed focus:outline-none resize-none"
                        placeholder="Start writing..."
                    />
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-[var(--theme-text-secondary)]">
                        <p>Create a new note to get started.</p>
                    </div>
                )}
            </main>
        </div>
    );
};