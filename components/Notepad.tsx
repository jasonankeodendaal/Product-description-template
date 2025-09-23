import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Note } from '../App';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ShareIcon } from './icons/ShareIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { resizeImage } from '../utils/imageUtils';
import { ImageIcon } from './icons/ImageIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon } from './icons/PlusIcon';

// --- ICONS ---
// FIX: Correctly typed icon components to accept standard SVG props, resolving potential type errors.
const BoldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>;
const ItalicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>;
const StrikethroughIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></svg>;
const HighlighterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}><path d="m16 5-4.5 4.5 4.5 4.5 5.5-5.5-5.5-3.5Z"/><path d="m5 16 4.5-4.5-4.5-4.5-3.5 5.5 3.5 3.5Z"/><path d="m14 7 3-3, 3 3-3 3-3-3Z"/><path d="m3 15 3 3-3 3-3-3 3-3Z"/><path d="m9 18 3-3, 3 3-3 3-3-3Z"/><path d="M9 6 6 3 3 6l3 3 3-3Z"/></svg>;
const ChecklistIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}><path d="m9 12 2 2 4-4" /><path d="M3 12h.01" /><path d="M3 18h.01" /><path d="M3 6h.01" /><path d="M7 12h12" /><path d="M7 18h12" /><path d="M7 6h12" /></svg>;


// --- HELPER FUNCTIONS ---
const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// --- CHILD COMPONENTS ---

const NoteCard: React.FC<{ note: Note; onClick: () => void; isSelected: boolean; onDelete: (id: string) => void; }> = React.memo(({ note, onClick, isSelected, onDelete }) => {
    const contentPreview = useMemo(() => stripHtml(note.content), [note.content]);
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the note when deleting
        if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
            onDelete(note.id);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`w-full text-left rounded-lg p-3 transition-all duration-200 border-2 ${
                    isSelected ? 'bg-slate-700/60 border-slate-600' : 'bg-transparent border-transparent hover:bg-slate-800/40'
                }`}
            >
                <h3 className="font-semibold text-slate-200 pr-8 truncate">{note.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mt-1">{contentPreview || "Start writing here..."}</p>
            </button>
            <button
                onClick={handleDelete}
                className="absolute top-3 right-2 p-1 text-slate-500 hover:text-[var(--theme-red)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={`Delete note ${note.title}`}
            >
                <TrashIcon />
            </button>
        </div>
    );
});


const EditorToolbar: React.FC<{ onCommand: (cmd: string, val?: any) => void, onImageUpload: () => void }> = React.memo(({ onCommand, onImageUpload }) => (
    <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg shadow-sm border border-slate-700/50 my-4 flex-wrap">
        <button onClick={() => onCommand('bold')} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><BoldIcon/></button>
        <button onClick={() => onCommand('italic')} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ItalicIcon/></button>
        <button onClick={() => onCommand('strikeThrough')} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><StrikethroughIcon/></button>
        <button onClick={() => onCommand('hiliteColor', 'rgba(52, 211, 153, 0.3)')} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><HighlighterIcon/></button>
        <div className="w-px h-5 bg-slate-700 mx-1"></div>
        <button onClick={() => onCommand('insertUnorderedList')} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
        <button onClick={() => onCommand('insertHTML', '<ul data-type="checklist"><li>List item</li></ul>')} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ChecklistIcon/></button>
        <button onClick={onImageUpload} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ImageIcon className="h-4 w-4" /></button>
    </div>
));

const NoteEditor: React.FC<{
    note: Note;
    onUpdate: (note: Note) => Promise<void>;
    onBack: () => void;
    onDelete: (id: string) => Promise<void>;
}> = ({ note, onUpdate, onBack, onDelete }) => {
    const [localNote, setLocalNote] = useState(note);
    const editorRef = useRef<HTMLDivElement>(null);
    const inlineImageInputRef = useRef<HTMLInputElement>(null);
    const heroImageInputRef = useRef<HTMLInputElement>(null);
    const debouncedNote = useDebounce(localNote, 1000);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const draggedItemRef = useRef<HTMLLIElement | null>(null);
    const dropIndicatorRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
        setLocalNote(note);
        setSaveStatus('saved');
        if (editorRef.current && note.content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = note.content;
        }
    }, [note]);

    useEffect(() => {
        if (saveStatus === 'unsaved' && JSON.stringify(debouncedNote) !== JSON.stringify(note)) {
            setSaveStatus('saving');
            onUpdate(debouncedNote).then(() => {
                // The parent's `note` prop will update, triggering the effect above to set status to 'saved'
            });
        }
    }, [debouncedNote, note, onUpdate, saveStatus]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) setIsMoreMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLocalChange = useCallback((updater: React.SetStateAction<Note>) => {
        setLocalNote(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;
            return { ...newState, date: new Date().toISOString() };
        });
        setSaveStatus('unsaved');
    }, []);

    const handleDelete = async () => {
        setIsMoreMenuOpen(false);
        if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
            await onDelete(note.id);
        }
    };
    
    const handleExecCommand = (command: string, value: any = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleLocalChange(prev => ({ ...prev, content: editorRef.current?.innerHTML || ''}));
    };

    const handleImageUpload = async (file: File | null, type: 'hero' | 'inline') => {
        if (!file) return;
        try {
            const resizedDataUrl = await resizeImage(file, type === 'hero' ? 1200 : 600);
            if (type === 'hero') {
                handleLocalChange(p => ({...p, heroImage: resizedDataUrl}));
            } else {
                const imgHtml = `<p><img src="${resizedDataUrl}" class="max-w-full my-2 rounded-lg" alt="User uploaded content" /></p>`;
                handleExecCommand('insertHTML', imgHtml);
            }
        } catch (error) { console.error('Image processing failed:', error); alert('Failed to process image.'); }
    };
    
    const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const li = target.closest('li');
        if (li && li.parentElement?.getAttribute('data-type') === 'checklist') {
            const rect = li.getBoundingClientRect();
            if (e.clientX < rect.left + 30) { 
                e.preventDefault();
                const isChecked = li.getAttribute('data-checked') === 'true';
                li.setAttribute('data-checked', String(!isChecked));
                handleLocalChange(p => ({...p, content: editorRef.current?.innerHTML || ''}));
            }
        }
    }, [handleLocalChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const node = range.commonAncestorContainer;
        // FIX: Cast the selection node to 'Element' to access the 'closest' method, as the base 'Node' type does not have it.
        const li = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element)?.closest('ul[data-type="checklist"] > li');

        if (e.key === 'Enter' && li) {
            e.preventDefault();
            const newLi = document.createElement('li');
            newLi.setAttribute('data-checked', 'false');
            newLi.innerHTML = '&#8203;'; // Zero-width space to make it editable

            li.parentNode?.insertBefore(newLi, li.nextSibling);

            const newRange = document.createRange();
            newRange.setStart(newLi, 1); // Place cursor after the ZWS
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            handleLocalChange(p => ({ ...p, content: editorRef.current?.innerHTML || '' }));
        } else if (e.key === 'Backspace' && li) {
            const isEffectivelyEmpty = li.textContent === '' || li.textContent === '\u200B';
            if (isEffectivelyEmpty && range.startOffset <= 1) {
                const prevLi = li.previousElementSibling as HTMLLIElement;
                if (prevLi) {
                    e.preventDefault();
                    const newRange = document.createRange();
                    newRange.selectNodeContents(prevLi);
                    newRange.collapse(false); // Move to end of previous item
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    li.remove();
                    handleLocalChange(p => ({ ...p, content: editorRef.current?.innerHTML || '' }));
                }
            }
        }
    };

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case 'unsaved': return 'Unsaved changes';
            case 'saving': return 'Saving...';
            case 'saved': return 'All changes saved';
            default: return '';
        }
    };
    
    // --- Checklist Drag and Drop Logic ---

    const getLiFromEventTarget = (target: EventTarget | null): HTMLLIElement | null => {
        let element = target as HTMLElement | null;
        while (element && element !== editorRef.current) {
            if (element.tagName === 'LI' && element.parentElement?.dataset.type === 'checklist') {
                return element as HTMLLIElement;
            }
            element = element.parentElement;
        }
        return null;
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const li = getLiFromEventTarget(e.target);
        if (!li) {
            e.preventDefault();
            return;
        }
        draggedItemRef.current = li;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', li.innerText);

        setTimeout(() => {
            li.classList.add('dragging');
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const li = getLiFromEventTarget(e.target);
        const draggedItem = draggedItemRef.current;
        if (!li || !draggedItem || li === draggedItem || li.contains(draggedItem)) return;

        const rect = li.getBoundingClientRect();
        const isAfter = e.clientY > rect.top + rect.height / 2;

        if (!dropIndicatorRef.current) {
            const indicator = document.createElement('li');
            indicator.className = 'drop-indicator-li';
            const innerDiv = document.createElement('div');
            innerDiv.className = 'drop-indicator';
            indicator.appendChild(innerDiv);
            dropIndicatorRef.current = indicator;
        }

        if (isAfter) {
            li.parentNode?.insertBefore(dropIndicatorRef.current, li.nextSibling);
        } else {
            li.parentNode?.insertBefore(dropIndicatorRef.current, li);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
         if (!e.relatedTarget || !(e.currentTarget as Node).contains(e.relatedTarget as Node)) {
            dropIndicatorRef.current?.remove();
            dropIndicatorRef.current = null;
        }
    };

    const cleanupDrag = () => {
        draggedItemRef.current?.classList.remove('dragging');
        dropIndicatorRef.current?.remove();
        draggedItemRef.current = null;
        dropIndicatorRef.current = null;
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItem = draggedItemRef.current;
        if (draggedItem && dropIndicatorRef.current) {
            dropIndicatorRef.current.parentNode?.insertBefore(draggedItem, dropIndicatorRef.current);
            handleLocalChange(p => ({...p, content: editorRef.current?.innerHTML || ''}));
        }
        cleanupDrag();
    };

    const handleDragEnd = () => {
        cleanupDrag();
    };


    return (
        <div className={`note-editor-container flex flex-col flex-1 h-full font-sans bg-transparent ${localNote.fontStyle}`}>
            <header className="flex-shrink-0 p-2 md:p-4 flex items-center justify-between border-b border-slate-700/50">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"><ChevronLeftIcon /></button>
                <div className="text-sm text-slate-400 transition-opacity duration-300">{getSaveStatusText()}</div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-white"><ShareIcon /></button>
                    <div className="relative" ref={moreMenuRef}>
                        <button onClick={() => setIsMoreMenuOpen(prev => !prev)} className="p-2 text-slate-400 hover:text-white"><MoreVerticalIcon /></button>
                        {isMoreMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 rounded-md shadow-lg border border-slate-700 z-10 animate-fade-in-down">
                                <div className="py-1">
                                    <button onClick={handleDelete} className="w-full text-left px-3 py-2 text-sm text-[var(--theme-red)] hover:bg-[var(--theme-red)]/10 flex items-center gap-2"> <TrashIcon /> Delete Note </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 no-scrollbar">
                <div className="max-w-3xl mx-auto">
                    <input type="file" ref={heroImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null, 'hero')} />
                    <input type="file" ref={inlineImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null, 'inline')} />
                    {localNote.heroImage ? (
                        <div className="mb-6 group relative"><img src={localNote.heroImage} alt="Hero" className="w-full h-48 object-cover rounded-lg" /><button onClick={() => heroImageInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Change Image</button></div>
                    ) : (
                        <button onClick={() => heroImageInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-700/80 rounded-lg py-4 text-center text-slate-400 hover:bg-slate-800/40 mb-6">Add Header Image</button>
                    )}
                    <input type="text" placeholder="New Note" value={localNote.title} onChange={(e) => handleLocalChange(p => ({...p, title: e.target.value}))} className="note-editor-title w-full text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 mb-2 text-slate-100 placeholder:text-slate-500" />
                    <div className="flex items-center gap-2 text-slate-400 mb-2"> <CalendarIcon /> <input type="text" placeholder="mm/dd/yyyy" value={localNote.dueDate || ''} onChange={(e) => handleLocalChange(p => ({ ...p, dueDate: e.target.value }))} className="text-sm bg-transparent border-none p-0 focus:ring-0 text-slate-400" /> </div>
                    <EditorToolbar onCommand={handleExecCommand} onImageUpload={() => inlineImageInputRef.current?.click()} />
                    <div 
                        ref={editorRef} 
                        className="note-editor-content w-full prose prose-lg max-w-none prose-invert prose-p:text-slate-300 prose-headings:text-slate-100" 
                        contentEditable 
                        suppressContentEditableWarning 
                        onInput={() => handleLocalChange(p => ({...p, content: editorRef.current?.innerHTML || ''}))} 
                        onClick={handleEditorClick}
                        onKeyDown={handleKeyDown}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                    ></div>
                </div>
            </div>
        </div>
    );
};


interface NotepadProps {
    notes: Note[];
    onSave: (note: Note) => Promise<void>;
    onUpdate: (note: Note) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    newNoteTrigger: number;
}

export const Notepad: React.FC<NotepadProps> = ({ notes, onSave, onUpdate, onDelete, newNoteTrigger }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastTriggerCount, setLastTriggerCount] = useState(newNoteTrigger);
    
    const filteredNotes = useMemo(() => {
        const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!searchTerm) return sorted;
        return sorted.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || stripHtml(n.content).toLowerCase().includes(searchTerm.toLowerCase()) );
    }, [notes, searchTerm]);

    const handleAddNewNote = useCallback(() => {
        const newNote: Note = {
            id: crypto.randomUUID(), title: 'New Note', content: '<p>Start writing here...</p>', category: 'General', tags: [], date: new Date().toISOString(), color: 'sky', heroImage: null, paperStyle: 'paper-dark', fontStyle: 'font-sans', dueDate: null,
        };
        onSave(newNote);
        setSelectedNoteId(newNote.id);
    }, [onSave]);

    useEffect(() => {
        if (newNoteTrigger > lastTriggerCount) {
            handleAddNewNote();
            setLastTriggerCount(newNoteTrigger);
        }
    }, [newNoteTrigger, lastTriggerCount, handleAddNewNote]);
    

    // Auto-select the first note on desktop if none is selected
    useEffect(() => {
        if (window.innerWidth >= 768 && !selectedNoteId && filteredNotes.length > 0) {
            setSelectedNoteId(filteredNotes[0].id);
        }
    }, [filteredNotes, selectedNoteId]);
    
    // When a note is deleted, select the next available one
    useEffect(() => {
        if (selectedNoteId && !notes.find(n => n.id === selectedNoteId)) {
            // The current note was deleted.
            // Select the first note in the filtered list, which is the most recent.
            setSelectedNoteId(filteredNotes[0]?.id || null);
        }
    }, [notes, selectedNoteId, filteredNotes]);
    
    const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

    return (
        <div className="flex flex-1 h-full">
            {/* --- Sidebar (Note List) --- */}
            <aside className={`
                w-full md:w-80 lg:w-96 flex-shrink-0 
                bg-transparent
                flex flex-col
                ${selectedNoteId ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-4 flex-shrink-0">
                     <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-slate-100">Notepad</h1>
                        <button onClick={handleAddNewNote} className="hidden md:flex items-center gap-2 bg-[var(--theme-green)] text-black font-bold py-2 px-3 rounded-md hover:opacity-90 transition-opacity text-sm">
                            <PlusIcon /> New Note
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                        <input type="text" placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900/50 border-slate-700/50 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-[var(--theme-green)]" />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 pt-0 no-scrollbar">
                    <div className="space-y-1">
                        {filteredNotes.map(note => ( <NoteCard key={note.id} note={note} onClick={() => setSelectedNoteId(note.id)} isSelected={selectedNoteId === note.id} onDelete={onDelete} /> ))}
                    </div>
                </div>
            </aside>
            
            {/* --- Main Content (Editor) --- */}
            <main className={`flex-1 flex-col ${selectedNoteId ? 'flex' : 'hidden md:flex'}`}>
                {selectedNote ? (
                    <NoteEditor
                        note={selectedNote}
                        onUpdate={onUpdate}
                        onBack={() => setSelectedNoteId(null)}
                        onDelete={onDelete}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <NotepadIcon className="mx-auto h-12 w-12 text-slate-600" />
                            <h2 className="mt-4 text-lg font-medium text-slate-300">Select a note</h2>
                            <p className="text-sm">Choose a note from the left to view or edit it.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};