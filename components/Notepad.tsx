import React, { useState, useMemo, useEffect } from 'react';
import { Note } from '../App';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EmojiIcon } from './icons/EmojiIcon';
import { SaveIcon } from './icons/SaveIcon';

interface NotepadProps {
  onClose: () => void;
  notes: Note[];
  onSave: (note: Note) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NOTE_COLORS = [
    'bg-yellow-200 text-yellow-900',
    'bg-pink-200 text-pink-900',
    'bg-blue-200 text-blue-900',
    'bg-green-200 text-green-900',
    'bg-purple-200 text-purple-900',
];

// Helper to convert old HTML notes to plain text for display/editing
const getPlainText = (html: string) => {
    try {
        const tempDiv = document.createElement("div");
        // Replace <br> tags with newlines to preserve them in the textarea
        tempDiv.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
        return tempDiv.textContent || tempDiv.innerText || "";
    } catch {
        return html; // Return original string if it's not valid HTML
    }
};


// Sub-component for the Note Editor Modal
const NoteModal: React.FC<{
    note: Note | 'new';
    onSave: (id: string | undefined, content: string, color: string | undefined) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
}> = ({ note, onSave, onClose, onDelete }) => {
    const isNewNote = note === 'new';
    const [content, setContent] = useState(isNewNote ? '' : getPlainText(note.content));
    const noteId = isNewNote ? undefined : note.id;
    const noteColor = isNewNote ? undefined : note.color;

    const handleSave = () => {
        onSave(noteId, content, noteColor);
        onClose();
    };
    
    const handleDelete = () => {
        if (noteId && window.confirm("Are you sure you want to delete this note?")) {
            onDelete(noteId);
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-flex-modal-scale-in" 
            aria-modal="true" 
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-lg shadow-xl border border-[var(--theme-border)] flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[var(--theme-yellow)]">{isNewNote ? 'New Note' : 'Edit Note'}</h2>
                    {!isNewNote && (
                        <button onClick={handleDelete} className="text-[var(--theme-red)]/80 hover:text-[var(--theme-red)]" aria-label="Delete Note">
                            <TrashIcon />
                        </button>
                    )}
                </header>
                <div className="p-4 flex-grow">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start typing..."
                        className="w-full h-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-3 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-2 focus:ring-[var(--theme-yellow)] transition-shadow duration-200 resize-none text-base"
                        autoFocus
                    />
                </div>
                 <footer className="p-4 border-t border-[var(--theme-border)] bg-black/20 flex justify-between items-center">
                    <div className="relative group">
                        <EmojiIcon />
                        <div className="absolute bottom-full left-0 mb-2 w-max bg-black/80 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Use Win+. or Cmd+Ctrl+Space to open emoji keyboard
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <button onClick={onClose} className="text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-white px-4 py-2">
                            Cancel
                         </button>
                         <button onClick={handleSave} style={{backgroundColor: 'var(--theme-green)'}} className="text-white font-bold py-2 px-4 rounded-md hover:opacity-90 flex items-center gap-2">
                             <SaveIcon /> Save
                         </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};


export const Notepad: React.FC<NotepadProps> = ({ onClose, notes, onSave, onDelete }) => {
    const [editingNote, setEditingNote] = useState<Note | 'new' | null>(null);

    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [notes]);
    
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = editingNote ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [editingNote]);

    const handleSave = async (id: string | undefined, content: string, color: string | undefined) => {
        const noteToSave: Note = {
            id: id || crypto.randomUUID(),
            content: content,
            updatedAt: new Date().toISOString(),
            color: color || NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        };
        await onSave(noteToSave);
    };
    
    const handleDeleteFromCard = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // prevent opening the edit modal
        if (window.confirm("Are you sure you want to delete this note?")) {
            onDelete(id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-dark-bg)] w-full h-full md:max-w-6xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col overflow-hidden animate-flex-modal-scale-in">
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Sticky Notes</h2>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Click a note to edit or create a new one.</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
                        <XIcon />
                    </button>
                </header>
                <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-[var(--theme-bg)]/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Add New Note Button */}
                        <button 
                            onClick={() => setEditingNote('new')} 
                            className="h-48 border-2 border-dashed border-[var(--theme-border)] rounded-lg flex flex-col items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:border-solid hover:text-white transition-all"
                        >
                            <PlusIcon />
                            <span>Add New Note</span>
                        </button>
                        {/* Existing Notes */}
                        {sortedNotes.map(note => {
                            const noteColor = note.color || NOTE_COLORS[0];
                            const rotation = (note.id.charCodeAt(note.id.length - 1) % 5) - 2.5; // Stable random rotation
                            return (
                                <div
                                    key={note.id}
                                    onClick={() => setEditingNote(note)}
                                    className={`h-48 p-4 rounded-lg shadow-md flex flex-col cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl relative ${noteColor}`}
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                >
                                    <button 
                                        onClick={(e) => handleDeleteFromCard(e, note.id)} 
                                        className="absolute top-1 right-1 bg-black/10 hover:bg-black/30 rounded-full p-1 text-inherit opacity-40 hover:opacity-100 transition-opacity" 
                                        aria-label="Delete note"
                                    >
                                        <XIcon />
                                    </button>
                                    <p className="flex-grow overflow-hidden whitespace-pre-wrap text-sm font-medium">
                                        {getPlainText(note.content)}
                                    </p>
                                    <footer className="text-xs opacity-70 mt-2 flex-shrink-0">
                                        {new Date(note.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </footer>
                                </div>
                            );
                        })}
                    </div>
                </main>
                {editingNote && (
                    <NoteModal 
                        note={editingNote}
                        onSave={handleSave}
                        onClose={() => setEditingNote(null)}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </div>
    );
};