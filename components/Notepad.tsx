import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Note, NoteRecording, Photo } from '../App';
import { useDebounce } from '../hooks/useDebounce';
import { useRecorder } from '../hooks/useRecorder';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';
import { ListIcon } from './icons/ListIcon';
import { MicIcon } from './icons/MicIcon';
import { WaveformPlayer } from './WaveformPlayer';
import { formatTime } from '../utils/formatters';
import { LiveWaveform } from './LiveWaveform';
import { XIcon } from './icons/XIcon';
import { CameraCapture } from './CameraCapture';
import { dataURLtoBlob } from '../utils/dataUtils';
import { PhotoThumbnail } from './PhotoThumbnail';
import { ScanIcon } from './icons/ScanIcon';

// Props definition
interface NotepadProps {
    notes: Note[];
    onSave: (note: Note) => Promise<void>;
    onUpdate: (note: Note) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    newNoteTrigger: number;
    noteRecordings: NoteRecording[];
    onSaveNoteRecording: (rec: NoteRecording) => Promise<void>;
    onDeleteNoteRecording: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
}

// Mapping note colors to Tailwind classes
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    sky: { bg: 'bg-sky-500', text: 'text-sky-500', ring: 'ring-sky-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-500', ring: 'ring-pink-500' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', ring: 'ring-cyan-500' },
};
const defaultColors = ['sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'];

const paperStyles: Record<string, string> = {
    'paper-dark': 'bg-gray-800 text-gray-200',
    'paper-white': 'bg-white text-gray-800',
    'paper-yellow-lined': 'bg-yellow-100 text-gray-800 bg-repeat-y bg-[length:100%_2rem] bg-gradient-to-b from-transparent to-transparent 50%, from-blue-200 to-blue-200 50.5%',
    'paper-grid': 'bg-white text-gray-800 bg-cover bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:1rem_1rem]',
};

const fontStyles: Record<string, string> = {
    'font-sans': 'font-sans',
    'font-serif': 'font-lora',
    'font-mono': 'font-mono',
};


const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const NoteCard: React.FC<{ note: Note; onSelect: (note: Note) => void; isSelected: boolean }> = ({ note, onSelect, isSelected }) => {
    return (
        <button
            onClick={() => onSelect(note)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                    ? `bg-[var(--theme-card-bg)] border-[var(--theme-green)]`
                    : `bg-[var(--theme-bg)]/50 border-transparent hover:bg-[var(--theme-card-bg)]/80 hover:border-[var(--theme-border)]`
            }`}
        >
            <h3 className="font-bold truncate text-[var(--theme-text-primary)]">{note.title}</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] line-clamp-2 mt-1">{stripHtml(note.content)}</p>
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[var(--theme-text-secondary)]">{new Date(note.date).toLocaleDateString()}</span>
                <div className={`w-3 h-3 rounded-full ${colorMap[note.color]?.bg || 'bg-gray-500'}`}></div>
            </div>
        </button>
    );
};

const NoteEditor: React.FC<{
    note: Note,
    onNoteChange: React.Dispatch<React.SetStateAction<Note | null>>,
    onDelete: (id: string) => void,
    onClose: () => void,
    noteRecordings: NoteRecording[],
    onSaveNoteRecording: (rec: NoteRecording) => Promise<void>,
    onDeleteNoteRecording: (id: string) => Promise<void>,
    photos: Photo[],
    onOpenScanner: () => void,
}> = ({ note, onNoteChange, onDelete, onClose, noteRecordings, onSaveNoteRecording, onDeleteNoteRecording, photos, onOpenScanner }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const { isRecording, recordingTime, audioBlob, startRecording, stopRecording, analyserNode } = useRecorder();
    
    const linkedPhotos = useMemo(() => {
        return (note.photoIds || []).map(id => photos.find(p => p.id === id)).filter(Boolean) as Photo[];
    }, [note.photoIds, photos]);

    useEffect(() => {
        if (contentRef.current && contentRef.current.innerHTML !== note.content) {
            contentRef.current.innerHTML = note.content;
        }
    }, [note.id, note.content]); // Depend on note.id to reset content when note changes

    const handleContentChange = () => {
        if (contentRef.current) {
            onNoteChange(prev => prev ? { ...prev, content: contentRef.current!.innerHTML, date: new Date().toISOString() } : null);
        }
    };
    
    const handleCommand = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        handleContentChange();
        contentRef.current?.focus();
    };

    const handleChecklist = () => {
        document.execCommand('insertUnorderedList');
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            let list = selection.focusNode?.parentElement;
            while(list && list.nodeName !== 'UL') {
                list = list.parentElement;
            }
            if (list && list.nodeName === 'UL') {
                list.setAttribute('data-type', 'checklist');
                 // Ensure all new li elements have data-checked="false"
                list.querySelectorAll('li:not([data-checked])').forEach(li => {
                    li.setAttribute('data-checked', 'false');
                    li.addEventListener('click', toggleChecklistItem, { once: true });
                });
            }
        }
        handleContentChange();
    }
    
    const toggleChecklistItem = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.nodeName === 'LI') {
            const isChecked = target.getAttribute('data-checked') === 'true';
            target.setAttribute('data-checked', isChecked ? 'false' : 'true');
            handleContentChange();
        }
    }
    
    const handleSaveRecording = useCallback(async () => {
        if (!audioBlob) return;
        const newRec: NoteRecording = {
            id: crypto.randomUUID(),
            noteId: note.id,
            name: `Audio Note ${new Date().toLocaleString()}`,
            date: new Date().toISOString(),
            audioBlob,
        };
        await onSaveNoteRecording(newRec);
    }, [audioBlob, note.id, onSaveNoteRecording]);


    return (
        <div className="h-full flex flex-col bg-[var(--theme-card-bg)]">
            <header className="p-2 border-b border-[var(--theme-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="md:hidden p-2 text-[var(--theme-text-secondary)]"><ChevronLeftIcon /></button>
                     <div className="flex items-center gap-2">
                        {Object.keys(colorMap).map(color => (
                            <button key={color} onClick={() => onNoteChange(p => p ? {...p, color} : null)} className={`w-5 h-5 rounded-full ${colorMap[color].bg} ${note.color === color ? `ring-2 ring-offset-2 ring-offset-[var(--theme-card-bg)] ${colorMap[color].ring}` : ''}`}></button>
                        ))}
                    </div>
                </div>
                <button onClick={() => onDelete(note.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
            </header>
            
            <div className="flex-grow overflow-y-auto">
                <div className="p-4">
                    <input
                        type="text"
                        value={note.title}
                        onChange={e => onNoteChange(p => p ? { ...p, title: e.target.value, date: new Date().toISOString() } : null)}
                        placeholder="Note Title..."
                        className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-green)] focus:outline-none w-full"
                    />
                </div>
                 <div className="px-4 pb-2 flex flex-wrap gap-2 text-sm text-[var(--theme-text-secondary)]">
                    <input 
                        type="text"
                        value={note.tags.join(', ')}
                        onChange={e => onNoteChange(p => p ? {...p, tags: e.target.value.split(',').map(t => t.trim()), date: new Date().toISOString() } : null)}
                        placeholder="Tags..."
                        className="bg-transparent text-xs"
                    />
                </div>
                 <div 
                    ref={contentRef}
                    onInput={handleContentChange}
                    contentEditable
                    suppressContentEditableWarning
                    className={`note-editor-content p-4 outline-none ${paperStyles[note.paperStyle] || paperStyles['paper-dark']} ${fontStyles[note.fontStyle] || fontStyles['font-sans']}`}
                />
            </div>
            
             <div className="p-2 border-t border-[var(--theme-border)] space-y-2">
                <h4 className="text-xs font-bold uppercase text-[var(--theme-text-secondary)]">Attachments</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                    {noteRecordings.filter(r => r.noteId === note.id).map(rec => (
                        <div key={rec.id} className="bg-[var(--theme-bg)]/50 p-1 rounded flex items-center">
                            <WaveformPlayer audioBlob={rec.audioBlob} />
                            <button onClick={() => onDeleteNoteRecording(rec.id)} className="p-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><XIcon /></button>
                        </div>
                    ))}
                </div>
                 {linkedPhotos.length > 0 && (
                     <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                        {linkedPhotos.map(photo => (
                            <div key={photo.id} className="relative group aspect-square">
                                <PhotoThumbnail photo={photo} onSelect={() => {}} onDelete={() => {}} />
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2 bg-[var(--theme-bg)]/50 p-1 rounded">
                    <div className="flex-1 h-10 rounded-md overflow-hidden bg-black/20">
                        {isRecording && <LiveWaveform analyserNode={analyserNode} />}
                    </div>
                    <button onClick={isRecording ? stopRecording : startRecording} className="p-2 bg-[var(--theme-green)] text-black rounded-full">
                        <MicIcon className="text-black" />
                    </button>
                    <span>{formatTime(recordingTime)}</span>
                    <button onClick={handleSaveRecording} disabled={!audioBlob} className="text-sm bg-[var(--theme-green)] text-black font-semibold px-3 py-1 rounded disabled:opacity-50">Save</button>
                </div>
            </div>

            <footer className="p-2 border-t border-[var(--theme-border)] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1">
                    <button onClick={() => handleCommand('bold')} className="p-2 hover:bg-[var(--theme-bg)] rounded"><BoldIcon /></button>
                    <button onClick={() => handleCommand('italic')} className="p-2 hover:bg-[var(--theme-bg)] rounded"><ItalicIcon /></button>
                    <button onClick={() => handleCommand('underline')} className="p-2 hover:bg-[var(--theme-bg)] rounded"><UnderlineIcon /></button>
                    <button onClick={() => handleChecklist()} className="p-2 hover:bg-[var(--theme-bg)] rounded"><ListIcon /></button>
                    <button onClick={onOpenScanner} className="p-2 hover:bg-[var(--theme-bg)] rounded"><ScanIcon /></button>
                </div>
            </footer>
        </div>
    );
};

export const Notepad: React.FC<NotepadProps> = ({ notes, onSave, onUpdate, onDelete, newNoteTrigger, noteRecordings, onSaveNoteRecording, onDeleteNoteRecording, photos, onSavePhoto }) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [isScanning, setIsScanning] = useState(false);

    const handleAddNewNote = useCallback(() => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'New Note',
            content: '<p></p>',
            category: 'General',
            tags: [],
            date: new Date().toISOString(),
            color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
            paperStyle: 'paper-dark',
            fontStyle: 'font-sans',
            heroImage: null,
            dueDate: null,
            recordingIds: [],
            photoIds: [],
        };
        onSave(newNote);
        setSelectedNote(newNote);
    }, [onSave]);
    
    const handleSaveScan = async (dataUrl: string) => {
        if (!selectedNote) return;
        const imageBlob = dataURLtoBlob(dataUrl);
        const newPhoto: Photo = {
            id: crypto.randomUUID(),
            name: `Scan for ${selectedNote.title}`,
            notes: `Attached to note: ${selectedNote.id}`,
            date: new Date().toISOString(),
            folder: `notes/scans/${selectedNote.id}`,
            imageBlob,
            imageMimeType: 'image/jpeg',
            tags: ['scan', selectedNote.title]
        };
        await onSavePhoto(newPhoto);

        const updatedNote: Note = {
            ...selectedNote,
            photoIds: [...(selectedNote.photoIds || []), newPhoto.id]
        };
        await onUpdate(updatedNote);
        setSelectedNote(updatedNote); // Update local state immediately
    };


    useEffect(() => {
        if (newNoteTrigger > 0) {
            handleAddNewNote();
        }
    }, [newNoteTrigger, handleAddNewNote]);
    
     const debouncedSelectedNote = useDebounce(selectedNote, 1000);
     useEffect(() => {
        if (debouncedSelectedNote) {
            const originalNote = notes.find(n => n.id === debouncedSelectedNote.id);
            if (originalNote && originalNote.date < debouncedSelectedNote.date) {
                onUpdate(debouncedSelectedNote);
            }
        }
    }, [debouncedSelectedNote, onUpdate, notes]);
    
     useEffect(() => {
        if (selectedNote) {
            // This ensures that if the note list updates from props (e.g., after a sync),
            // the local `selectedNote` state also gets the latest version.
            const updatedNoteFromList = notes.find(n => n.id === selectedNote.id);
            if (updatedNoteFromList) {
                // Only update if the content is different to avoid cursor jumps
                if (JSON.stringify(updatedNoteFromList) !== JSON.stringify(selectedNote)) {
                    setSelectedNote(updatedNoteFromList);
                }
            } else {
                // If the note was deleted, deselect it.
                setSelectedNote(null);
            }
        }
    }, [notes]); // Only depend on the notes prop


    const filteredNotes = useMemo(() => {
        const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!debouncedSearchTerm) return sorted;
        return sorted.filter(note =>
            note.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            stripHtml(note.content).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        );
    }, [notes, debouncedSearchTerm]);
    
     const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            await onDelete(id);
            setSelectedNote(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-transparent backdrop-blur-2xl">
            {isScanning && (
                <CameraCapture 
                    mode="document"
                    onClose={() => setIsScanning(false)}
                    onCapture={handleSaveScan}
                />
            )}
            <div className="flex-grow flex overflow-hidden">
                <aside className={`w-full md:w-1/3 md:max-w-sm flex flex-col border-r border-transparent md:border-[var(--theme-border)] ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
                    <header className="p-4 flex-shrink-0 border-b border-[var(--theme-border)] flex items-center justify-between">
                         <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg pl-10 pr-4 py-2"
                            />
                        </div>
                        <button onClick={handleAddNewNote} className="ml-2 p-2 bg-[var(--theme-green)] text-black rounded-full flex-shrink-0"><PlusIcon /></button>
                    </header>
                     <div className="flex-grow overflow-y-auto no-scrollbar p-2 space-y-2">
                        {filteredNotes.length > 0 ? (
                            filteredNotes.map(note => (
                                <NoteCard key={note.id} note={note} onSelect={setSelectedNote} isSelected={selectedNote?.id === note.id} />
                            ))
                        ) : (
                            <div className="text-center p-8 text-[var(--theme-text-secondary)]">
                                <NotepadIcon className="mx-auto h-12 w-12" />
                                <h3 className="mt-2 font-semibold">No notes found</h3>
                                <p className="text-sm">Create a new note to get started.</p>
                            </div>
                        )}
                    </div>
                </aside>

                <main className={`flex-1 flex-col ${selectedNote ? 'flex' : 'hidden md:flex'}`}>
                     {selectedNote ? (
                        <NoteEditor
                            note={selectedNote}
                            onNoteChange={setSelectedNote}
                            onDelete={handleDelete}
                            onClose={() => setSelectedNote(null)}
                            noteRecordings={noteRecordings}
                            onSaveNoteRecording={onSaveNoteRecording}
                            onDeleteNoteRecording={onDeleteNoteRecording}
                            photos={photos}
                            onOpenScanner={() => setIsScanning(true)}
                        />
                    ) : (
                        <div className="hidden md:flex w-full h-full items-center justify-center text-center text-[var(--theme-text-secondary)] p-8">
                            <div>
                                <NotepadIcon className="mx-auto h-16 w-16" />
                                <h2 className="mt-4 text-xl font-semibold text-[var(--theme-text-primary)]">Your Digital Notepad</h2>
                                <p className="mt-1 max-w-sm">Select a note from the list to view or edit it, or create a new one to capture your thoughts.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};