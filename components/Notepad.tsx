import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Note } from '../App';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { useDebounce } from '../hooks/useDebounce';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { CheckIcon } from './icons/CheckIcon';

// --- Helper Functions ---
const getPreview = (htmlContent: string): { type: 'text' | 'checklist', content: string } => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const checklist = tempDiv.querySelector('ul[data-type="checklist"]');
    if (checklist) {
        const items = Array.from(checklist.querySelectorAll('li')).slice(0, 3).map(li => li.textContent || '').filter(Boolean);
        if (items.length > 0) {
            return { type: 'checklist', content: items.join(', ') };
        }
    }
    
    const text = tempDiv.textContent || 'No additional content';
    return { type: 'text', content: text.substring(0, 120) + (text.length > 120 ? '...' : '') };
};

const getFirstImage = (htmlContent: string): string | null => {
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
};


// --- Child Components ---

const NoteCard: React.FC<{ note: Note; isSelected: boolean; onClick: () => void; onDelete: (id: string) => void; }> = React.memo(({ note, isSelected, onClick, onDelete }) => {
    const preview = useMemo(() => getPreview(note.content), [note.content]);
    const imageUrl = useMemo(() => getFirstImage(note.content), [note.content]);
    const noteDate = useMemo(() => new Date(note.date), [note.date]);
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when deleting
        onDelete(note.id);
    };

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`w-full text-left rounded-lg transition-all duration-200 overflow-hidden flex flex-col h-full shadow-md ${
                    isSelected 
                        ? 'bg-[var(--theme-green)]/20 ring-2 ring-[var(--theme-green)]' 
                        : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-card-bg)]/80 hover:shadow-xl hover:-translate-y-1'
                }`}
            >
                {imageUrl && (
                    <div className="h-32 w-full overflow-hidden">
                        <img src={imageUrl} alt="Note attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg font-lora text-[var(--theme-text-primary)] break-words">{note.title}</h3>
                    <p className="text-sm text-[var(--theme-text-secondary)] mt-2 flex-grow break-words">
                        {preview.type === 'checklist' && <ChecklistIcon />}
                        {preview.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]/80 mt-4">
                        <span>{noteDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        {note.category && note.category !== 'General' && <span className="font-semibold bg-white/5 px-2 py-1 rounded">{note.category}</span>}
                    </div>
                </div>
            </button>
             <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 bg-[var(--theme-bg)] rounded-full text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label={`Delete note ${note.title}`}
            >
                <TrashIcon />
            </button>
        </div>
    );
});


const NoteEditor = ({ note, onUpdate, onDelete, onBack }: { note: Note; onUpdate: (note: Note) => void; onDelete: (id: string) => void; onBack: () => void; }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [dueDate, setDueDate] = useState<string | null>(note.dueDate || null);

    const draggedItemRef = useRef<HTMLElement | null>(null);
    const dropIndicatorRef = useRef<HTMLElement | null>(null);

    const debouncedTitle = useDebounce(title, 500);
    const debouncedContent = useDebounce(content, 500);
    const debouncedDueDate = useDebounce(dueDate, 500);

    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        setDueDate(note.dueDate || null);
        if (editorRef.current && note.content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = note.content;
        }
        if (!dropIndicatorRef.current) {
            const indicator = document.createElement('li');
            indicator.className = 'drop-indicator-li';
            indicator.innerHTML = `<div class="drop-indicator"></div>`;
            dropIndicatorRef.current = indicator;
        }
    }, [note]);

    useEffect(() => {
        if (debouncedTitle !== note.title || debouncedContent !== note.content || debouncedDueDate !== (note.dueDate || null)) {
            onUpdate({ ...note, title: debouncedTitle, content: debouncedContent, dueDate: debouncedDueDate });
        }
    }, [debouncedTitle, debouncedContent, debouncedDueDate, note, onUpdate]);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        if (draggedItemRef.current) return;
        setContent(e.currentTarget.innerHTML);
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDueDate(e.target.value || null);
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

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI' && target.parentElement?.dataset.type === 'checklist') {
            draggedItemRef.current = target;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => target.classList.add('dragging'), 0);
        } else {
            e.preventDefault();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItem = draggedItemRef.current;
        const dropIndicator = dropIndicatorRef.current;
        if (!draggedItem || !dropIndicator) return;
        const targetLi = (e.target as HTMLElement).closest('li');
        if (!targetLi || targetLi === draggedItem || targetLi.parentElement?.dataset.type !== 'checklist' || targetLi === dropIndicator) {
             if (dropIndicator.parentElement) dropIndicator.parentElement.removeChild(dropIndicator);
            return;
        }
        const parentUl = targetLi.parentElement;
        if (!parentUl) return;
        const rect = targetLi.getBoundingClientRect();
        const isAfter = e.clientY > rect.top + rect.height / 2;
        parentUl.insertBefore(dropIndicator, isAfter ? targetLi.nextSibling : targetLi);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItem = draggedItemRef.current;
        const dropIndicator = dropIndicatorRef.current;
        if (!draggedItem || !dropIndicator || !dropIndicator.parentElement) return;
        dropIndicator.parentElement.replaceChild(draggedItem, dropIndicator);
        if (editorRef.current) setContent(editorRef.current.innerHTML);
    };

    const handleDragEnd = () => {
        const draggedItem = draggedItemRef.current;
        const dropIndicator = dropIndicatorRef.current;
        if (draggedItem) draggedItem.classList.remove('dragging');
        if (dropIndicator?.parentElement) dropIndicator.parentElement.removeChild(dropIndicator);
        draggedItemRef.current = null;
    };


    return (
        <div className="flex flex-col h-full bg-[var(--theme-bg)]">
            <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white">
                            <ChevronLeftIcon />
                        </button>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Note Title"
                            className="text-2xl font-bold bg-transparent focus:outline-none w-full text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-secondary)] truncate"
                        />
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                            onClick={onBack}
                            className="hidden lg:flex items-center justify-center gap-2 bg-[var(--theme-green)] text-black font-bold py-2 px-4 rounded-md hover:opacity-90 text-sm"
                            aria-label="Finish editing"
                        >
                            <CheckIcon />
                            <span>Done</span>
                        </button>
                        <button onClick={() => onDelete(note.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
                 <div className="mt-3 flex items-center gap-2 text-sm pl-1 lg:pl-0">
                    <label htmlFor="due-date" className="flex items-center gap-2 text-[var(--theme-text-secondary)] cursor-pointer">
                        <CalendarIcon />
                        <span>Due Date</span>
                    </label>
                    <input
                        id="due-date"
                        type="date"
                        value={dueDate || ''}
                        onChange={handleDateChange}
                        className="bg-transparent border-b border-dashed border-transparent focus:border-[var(--theme-border)] focus:outline-none text-[var(--theme-text-primary)] p-1"
                    />
                    {dueDate && <button onClick={() => setDueDate(null)} className="text-xs text-[var(--theme-red)] hover:underline">Clear</button>}
                </div>
            </header>
            <div className="flex-grow overflow-y-auto p-4 md:p-6" onClick={handleChecklistClick}>
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleContentChange}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className="note-editor-content h-full leading-relaxed text-lg max-w-3xl mx-auto bg-[var(--theme-card-bg)]/50 rounded-lg p-4 sm:p-6 focus:ring-2 focus:ring-[var(--theme-green)] focus:outline-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
            <footer className="flex-shrink-0 p-2 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/30">
                <div className="flex items-center max-w-3xl mx-auto">
                    <button onClick={insertChecklist} className="p-3 hover:bg-[var(--theme-bg)] rounded-md text-[var(--theme-text-secondary)]" title="Insert Checklist">
                        <ChecklistIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
};

// --- Main Notepad Component ---
export const Notepad: React.FC<{ notes: Note[]; onSave: (note: Note) => Promise<void>; onUpdate: (note: Note) => Promise<void>; onDelete: (id: string) => Promise<void>; }> = ({ notes, onSave, onUpdate, onDelete }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isInitialLoad = useRef(true);

    useEffect(() => {
        const noteExists = notes.some(n => n.id === selectedNoteId);
        
        // On initial mount, select the newest note if none is selected
        if (isInitialLoad.current && !selectedNoteId && notes.length > 0) {
            const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setSelectedNoteId(sortedNotes[0].id);
            isInitialLoad.current = false; // Prevent this from running again
            return;
        }

        // If the currently selected note is deleted, select the new newest note
        if (selectedNoteId && !noteExists) {
            const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setSelectedNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
        }
    }, [notes, selectedNoteId]);

    const filteredNotes = useMemo(() => {
        const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!searchTerm) return sorted;
        return sorted.filter(note => 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    const handleAddNote = useCallback(async () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '<p>Start writing here...</p>',
            category: 'General',
            tags: [],
            date: new Date().toISOString(),
            dueDate: null,
        };
        await onSave(newNote);
        setSelectedNoteId(newNote.id);
    }, [onSave]);
    
    const handleDeleteNote = useCallback(async (id: string) => {
        if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
            await onDelete(id);
        }
    }, [onDelete]);

    const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId) || null, [notes, selectedNoteId]);
    
    return (
        <div className="flex flex-1 overflow-hidden bg-[var(--theme-bg)] backdrop-blur-2xl text-[var(--theme-text-primary)]">
            {/* Note List Pane */}
            <aside className={`w-full lg:w-[450px] xl:w-[550px] flex-shrink-0 flex flex-col border-r border-[var(--theme-border)] ${selectedNoteId ? 'hidden lg:flex' : 'flex'}`}>
                <header className="p-4 flex-shrink-0 flex items-center justify-between border-b border-[var(--theme-border)]">
                    <h1 className="text-3xl font-bold font-lora">Notes</h1>
                </header>
                <div className="p-4 flex-shrink-0">
                    <input 
                        type="text" 
                        placeholder="Search your notes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--theme-dark-bg)] border border-[var(--theme-border)] rounded-md pl-4 pr-4 py-2" 
                    />
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar pb-24 lg:pb-4">
                   {filteredNotes.length > 0 ? (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    isSelected={selectedNoteId === note.id} 
                                    onClick={() => setSelectedNoteId(note.id)} 
                                    onDelete={handleDeleteNote}
                                />
                            ))}
                        </div>
                   ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]">
                            <NotepadIcon />
                            <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mt-4">Your notepad is empty</h3>
                            <p className="text-sm mt-1">Click the '+' button to capture your first thought.</p>
                        </div>
                   )}
                </div>
            </aside>
            
            {/* Note Editor Pane */}
            <main className={`flex-1 flex-col ${selectedNoteId ? 'flex' : 'hidden lg:flex'}`}>
                {selectedNote ? (
                    <NoteEditor 
                        note={selectedNote} 
                        onUpdate={onUpdate} 
                        onDelete={handleDeleteNote} 
                        onBack={() => setSelectedNoteId(null)} 
                    />
                ) : (
                    <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 text-[var(--theme-text-secondary)]">
                        <NotepadIcon />
                        <h2 className="mt-4 text-xl font-semibold text-[var(--theme-text-primary)]">Your notes live here</h2>
                        <p className="mt-1">Select a note from the list, or create a new one to get started.</p>
                    </div>
                )}
            </main>

             <button 
                onClick={handleAddNote}
                className="absolute bottom-20 right-6 lg:bottom-8 lg:right-8 z-40 bg-[var(--theme-green)] text-black rounded-full p-4 fab-shadow hover:opacity-90 transform hover:scale-110 transition-transform"
                aria-label="Create new note"
            >
                <PlusIcon />
            </button>
        </div>
    );
};