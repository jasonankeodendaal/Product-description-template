import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Note } from '../App';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { useDebounce } from '../hooks/useDebounce';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const NoteEditor = ({ note, onUpdate, onDelete, onBack }: { note: Note; onUpdate: (note: Note) => void; onDelete: (id: string) => void; onBack: () => void; }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    const debouncedTitle = useDebounce(title, 500);
    const debouncedContent = useDebounce(content, 500);

    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        if (editorRef.current && note.content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = note.content;
        }
    }, [note]);

    useEffect(() => {
        if (debouncedTitle !== note.title || debouncedContent !== note.content) {
            onUpdate({ ...note, title: debouncedTitle, content: debouncedContent });
        }
    }, [debouncedTitle, debouncedContent, note, onUpdate]);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        setContent(e.currentTarget.innerHTML);
    };

    const handleChecklistClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI' && target.parentElement?.dataset.type === 'checklist') {
            const isChecked = target.dataset.checked === 'true';
            target.dataset.checked = isChecked ? 'false' : 'true';
            setContent(editorRef.current?.innerHTML || '');
        }
    };
    
    const insertChecklist = () => {
        if (editorRef.current) {
            const checklistHtml = `
                <ul data-type="checklist">
                    <li data-checked="false">To-do item 1</li>
                    <li data-checked="false">To-do item 2</li>
                </ul><p><br></p>`;
            editorRef.current.focus();
            document.execCommand('insertHTML', false, checklistHtml);
            setContent(editorRef.current.innerHTML);
        }
    };


    return (
        <div className="flex flex-col h-full bg-[var(--theme-card-bg)]">
            <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                <div className="flex items-center gap-2 flex-grow">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white">
                        <ChevronLeftIcon />
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Note Title"
                        className="text-xl font-bold bg-transparent focus:outline-none w-full text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)]"
                    />
                </div>
                <button onClick={() => onDelete(note.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]">
                    <TrashIcon />
                </button>
            </header>
            <div className="flex-grow overflow-y-auto p-6" onClick={handleChecklistClick}>
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleContentChange}
                    className="note-editor-content h-full leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
            <footer className="flex-shrink-0 p-2 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/30">
                <div className="flex items-center">
                    <button onClick={insertChecklist} className="p-3 hover:bg-[var(--theme-bg)] rounded-md text-[var(--theme-text-secondary)]" title="Insert Checklist">
                        <ChecklistIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
};

const groupNotesByDate = (notes: Note[]) => {
    const groups: { [key: string]: Note[] } = {};
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    notes.forEach(note => {
        const noteDate = new Date(note.date);
        const diffDays = Math.round((todayStart.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
        let groupKey: string;

        if (diffDays === 0) {
            groupKey = "Today";
        } else if (diffDays === 1) {
            groupKey = "Yesterday";
        } else {
            groupKey = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(noteDate);
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(note);
    });
    return groups;
};


export const Notepad: React.FC<{ notes: Note[]; onSave: (note: Note) => Promise<void>; onUpdate: (note: Note) => Promise<void>; onDelete: (id: string) => Promise<void>; }> = ({ notes, onSave, onUpdate, onDelete }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isEditorVisible, setIsEditorVisible] = useState(false);

    useEffect(() => {
        const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!selectedNoteId && sortedNotes.length > 0) {
            setSelectedNoteId(sortedNotes[0].id);
        } else if (selectedNoteId && !notes.find(n => n.id === selectedNoteId)) {
            setSelectedNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
        }
    }, [notes, selectedNoteId]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(notes.map(n => n.category)))], [notes]);
    
    const filteredNotes = useMemo(() => {
        const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (activeCategory === 'All') return sorted;
        return sorted.filter(note => note.category === activeCategory);
    }, [notes, activeCategory]);

    const groupedNotes = useMemo(() => groupNotesByDate(filteredNotes), [filteredNotes]);
    
    const handleAddNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '<p>Start writing here...</p>',
            category: activeCategory !== 'All' ? activeCategory : 'General',
            tags: [],
            date: new Date().toISOString(),
        };
        await onSave(newNote);
        setSelectedNoteId(newNote.id);
        setIsEditorVisible(true);
    }, [onSave, activeCategory]);
    
    const handleDeleteNote = useCallback(async (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            await onDelete(id);
        }
    }, [onDelete]);

    const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId) || null, [notes, selectedNoteId]);
    
    const renderNotePreview = (content: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        // Try to find checklist items first
        const checklistItems = Array.from(tempDiv.querySelectorAll('ul[data-type="checklist"] li'));
        if (checklistItems.length > 0) {
            return checklistItems.slice(0, 2).map(li => li.textContent).join(', ') + '...';
        }
        return tempDiv.textContent?.substring(0, 100) || 'No content';
    };

    return (
        <div className="relative flex h-full overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text-primary)]">
            {/* Note List Pane */}
            <aside className={`w-full flex-shrink-0 md:w-1/3 md:max-w-sm flex flex-col border-r border-[var(--theme-border)] transition-transform duration-300 ease-in-out ${isEditorVisible ? '-translate-x-full md:translate-x-0' : 'translate-x-0'} absolute md:relative inset-0 md:inset-auto`}>
                <header className="p-4 flex-shrink-0 flex items-center justify-between border-b border-[var(--theme-border)]">
                    <h1 className="text-3xl font-patrick-hand">NOTEE</h1>
                    <button className="p-2 -mr-2"><PlusIcon /></button> {/* Placeholder, FAB is main add button */}
                </header>
                 <div className="p-4 flex-shrink-0">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                             <button 
                                key={cat} 
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${activeCategory === cat ? 'bg-[var(--theme-dark-bg)] text-white shadow-md' : 'bg-[var(--theme-card-bg)] text-[var(--theme-text-secondary)]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar pb-24">
                    {Object.entries(groupedNotes).map(([group, notesInGroup]) => (
                        notesInGroup.length > 0 && (
                        <div key={group} className="px-4 py-2">
                            <h2 className="text-sm font-bold uppercase text-[var(--theme-text-secondary)] tracking-wider mb-2">{group}</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {notesInGroup.map(note => (
                                    <button 
                                        key={note.id}
                                        onClick={() => { setSelectedNoteId(note.id); setIsEditorVisible(true); }}
                                        className={`w-full text-left p-4 rounded-lg transition-colors ${selectedNoteId === note.id ? 'bg-[var(--theme-green)]/20' : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-card-bg)]/50'}`}
                                    >
                                        <h3 className="font-bold truncate">{note.title}</h3>
                                        <p className="text-sm text-[var(--theme-text-secondary)] mt-1 h-10 overflow-hidden">{renderNotePreview(note.content)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        )
                    ))}
                </div>
            </aside>
            
            {/* Note Editor Pane */}
            <main className={`w-full flex-grow flex flex-col transition-transform duration-300 ease-in-out ${isEditorVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} absolute md:relative inset-0 md:inset-auto`}>
                {selectedNote ? (
                    <NoteEditor note={selectedNote} onUpdate={onUpdate} onDelete={handleDeleteNote} onBack={() => setIsEditorVisible(false)} />
                ) : (
                    <div className="hidden md:flex items-center justify-center h-full text-[var(--theme-text-secondary)]">
                        <p>Select a note to view or create a new one.</p>
                    </div>
                )}
            </main>

             <button 
                onClick={handleAddNote}
                className="absolute bottom-20 right-6 md:bottom-6 z-40 bg-[var(--theme-green)] text-black rounded-full p-4 fab-shadow hover:opacity-90 transform hover:scale-110 transition-transform"
                aria-label="Create new note"
            >
                <PlusIcon />
            </button>
        </div>
    );
};