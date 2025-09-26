import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// FIX: SiteSettings is defined in constants.ts, not App.tsx
import { Note, NoteRecording, Photo } from '../App';
import { SiteSettings } from '../constants';
import { useRecorder } from '../hooks/useRecorder';
import { XIcon } from './icons/XIcon';
import { CameraCapture } from './CameraCapture';
import { dataURLtoBlob } from '../utils/dataUtils';
import { WaveformPlayer } from './WaveformPlayer';
import { LiveWaveform } from './LiveWaveform';
import { resizeImage } from '../utils/imageUtils';
import { useDebounce } from '../hooks/useDebounce';
import { formatTime } from '../utils/formatters';
import { Spinner } from './icons/Spinner';
import { CheckIcon } from './icons/CheckIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BellIcon } from './icons/BellIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';
import { StrikethroughIcon } from './icons/StrikethroughIcon';
import { ListIcon } from './icons/ListIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { ImageIcon } from './icons/ImageIcon';
import { ScanIcon } from './icons/ScanIcon';
import { MicIcon } from './icons/MicIcon';
import { LockIcon } from './icons/LockIcon';
import { UnlockIcon } from './icons/UnlockIcon';

// Props definition
interface NoteEditorProps {
    note: Note;
    onUpdate: (note: Note, silent?: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onClose: () => void;
    noteRecordings: NoteRecording[];
    onSaveNoteRecording: (rec: NoteRecording) => Promise<void>;
    onDeleteNoteRecording: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    performAiAction: (prompt: string, context: string) => Promise<any>;
    siteSettings: SiteSettings;
}

const colorMap: Record<string, { bg: string; ring: string }> = {
    sky: { bg: 'bg-sky-500', ring: 'ring-sky-500' },
    purple: { bg: 'bg-purple-500', ring: 'ring-purple-500' },
    emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-500' },
    pink: { bg: 'bg-pink-500', ring: 'ring-pink-500' },
    cyan: { bg: 'bg-cyan-500', ring: 'ring-cyan-500' },
};
const defaultColors = ['sky', 'purple', 'emerald', 'amber', 'pink', 'cyan'];

const paperStyles: Record<string, string> = {
    'paper-dark': 'bg-gray-800 text-gray-200',
    'paper-grid': 'bg-gray-800 text-gray-200 bg-cover bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]',
};

const fontStyles: Record<string, string> = {
    'font-sans': 'font-sans',
    'font-serif': 'font-lora',
    'font-mono': 'font-mono',
};

const NoteSettingsModal: React.FC<{
    note: Note;
    onNoteChange: (updater: (note: Note) => Note) => void;
    onClose: () => void;
}> = ({ note, onNoteChange, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-end md:items-center justify-center" onClick={onClose}>
             <div onClick={e => e.stopPropagation()} className="bg-slate-900/80 backdrop-blur-md w-full md:max-w-md rounded-t-2xl md:rounded-xl shadow-xl border-t-2 md:border border-orange-500/30 note-settings-modal-in">
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                    <h4 className="font-bold text-white">Note Settings</h4>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><XIcon/></button>
                </div>
                <div className="p-4 space-y-4">
                     <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-400"><BellIcon /> Due Date</label>
                        <input type="datetime-local" value={note.dueDate ? note.dueDate.slice(0, 16) : ''} onChange={e => onNoteChange(n => ({...n, dueDate: e.target.value || null, reminderDate: e.target.value || null, reminderFired: false }))} className="w-full bg-gray-800 text-sm p-1 rounded-md border border-gray-600 mt-1" />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-400"><NotepadIcon /> Paper Style</label>
                        <select value={note.paperStyle} onChange={e => onNoteChange(n => ({ ...n, paperStyle: e.target.value }))} className="w-full bg-gray-800 text-sm p-1.5 rounded-md border border-gray-600 mt-1">
                            {Object.keys(paperStyles).map(s => <option key={s} value={s}>{s.replace('paper-','').replace('-',' ')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">Aa Font Style</label>
                        <select value={note.fontStyle} onChange={e => onNoteChange(n => ({ ...n, fontStyle: e.target.value }))} className="w-full bg-gray-800 text-sm p-1.5 rounded-md border border-gray-600 mt-1">
                            {Object.keys(fontStyles).map(s => <option key={s} value={s}>{s.replace('font-','')}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center gap-2 pt-2">
                        {defaultColors.map(c => (
                            <button key={c} type="button" onClick={() => onNoteChange(n => ({...n, color:c}))} className={`w-6 h-6 rounded-full ${colorMap[c].bg} ${note.color === c ? `ring-2 ring-offset-2 ring-offset-slate-900 ${colorMap[c].ring}` : ''}`}></button>
                        ))}
                    </div>
                     <div className="pt-4 border-t border-gray-600">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">Security</label>
                         <button onClick={() => onNoteChange(n => ({...n, isLocked: !n.isLocked}))} className="mt-2 w-full flex items-center justify-center gap-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-600">
                            {note.isLocked ? <UnlockIcon /> : <LockIcon />}
                            <span className="font-semibold">{note.isLocked ? 'Unlock Note' : 'Lock Note'}</span>
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate, onDelete, onClose, noteRecordings, onSaveNoteRecording, onSavePhoto, performAiAction }) => {
    const [localNote, setLocalNote] = useState(note);
    const contentRef = useRef<HTMLDivElement>(null);
    const lastSavedNote = useRef(note);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const debouncedNote = useDebounce(localNote, 1000);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    // ... other state variables for modals, etc.

    useEffect(() => {
        if (JSON.stringify(debouncedNote) !== JSON.stringify(lastSavedNote.current)) {
            onUpdate(debouncedNote, true);
            lastSavedNote.current = debouncedNote;
        }
    }, [debouncedNote, onUpdate]);

    useEffect(() => {
        if (contentRef.current && contentRef.current.innerHTML !== localNote.content) {
            contentRef.current.innerHTML = localNote.content;
        }
    }, [localNote.id, localNote.content]);

    const handleContentChange = useCallback(() => {
        if (contentRef.current) {
            setLocalNote(prev => ({ ...prev, content: contentRef.current!.innerHTML, date: new Date().toISOString() }));
        }
    }, []);

    // FIX: Add missing `executeCommand` function used by toolbar buttons.
    const executeCommand = (command: string) => {
        document.execCommand(command, false);
        handleContentChange();
        contentRef.current?.focus();
    };

    // FIX: Add missing `handleChecklist` function for the checklist toolbar button.
    const handleChecklist = () => {
        executeCommand('insertUnorderedList');
        const ul = contentRef.current?.querySelector('ul:not([data-type])');
        if (ul) {
            ul.setAttribute('data-type', 'checklist');
            ul.querySelectorAll('li').forEach(li => li.setAttribute('data-checked', 'false'));
            handleContentChange();
        }
    };

    const handleSaveManually = async () => {
        setSaveState('saving');
        await onUpdate(localNote, false);
        lastSavedNote.current = localNote;
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
    };

    const isDirty = useMemo(() => {
        return JSON.stringify(localNote) !== JSON.stringify(lastSavedNote.current);
    }, [localNote]);

    // ... other handlers

    return (
        <div className="h-full flex flex-col bg-[var(--theme-card-bg)]">
            {isSettingsOpen && 
                <NoteSettingsModal 
                    note={localNote} 
                    onNoteChange={setLocalNote} 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            }
            <header className="p-2 border-b border-[var(--theme-border)] flex items-center justify-between flex-shrink-0">
               <div className="flex items-center gap-2 flex-grow min-w-0">
                   <button onClick={onClose} className="p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white"><ChevronLeftIcon /></button>
                   <input type="text" value={localNote.title} onChange={e => setLocalNote(n => ({ ...n, title: e.target.value, date: new Date().toISOString() }))} placeholder="Note Title..." className="text-xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-orange)] focus:outline-none w-full truncate" />
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                    {isDirty && (
                       <button onClick={handleSaveManually} disabled={saveState === 'saving'} className="text-sm font-semibold py-1.5 px-4 rounded-full flex items-center gap-1.5 transition-colors duration-200 bg-orange-600 text-white hover:bg-orange-500 disabled:bg-gray-500">
                           {saveState === 'saving' ? <><Spinner className="w-4 h-4" /> Saving...</> : saveState === 'saved' ? <><CheckIcon /> Saved</> : 'Save'}
                       </button>
                   )}
                   <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-[var(--theme-text-secondary)] hover:text-white relative"><SettingsIcon /></button>
                   <button onClick={() => onDelete(localNote.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
               </div>
           </header>
           
           <div className="flex-grow overflow-y-auto relative" style={{ paddingBottom: '60px' }}>
               <div ref={contentRef} onInput={handleContentChange} contentEditable suppressContentEditableWarning className={`note-editor-content p-4 outline-none min-h-full ${paperStyles[localNote.paperStyle]} ${fontStyles[localNote.fontStyle]}`}/>
           </div>
           
           <footer className="absolute bottom-0 left-0 right-0 p-2 bg-slate-900/80 backdrop-blur-sm border-t border-white/10 note-editor-toolbar z-10">
                <div className="flex items-center justify-start gap-1 flex-wrap">
                   {/* Toolbar buttons remain the same */}
                   <button title="Bold" onClick={() => document.execCommand('bold')} className="p-2 hover:bg-slate-700 rounded"><BoldIcon /></button>
                   <button title="Italic" onClick={() => document.execCommand('italic')} className="p-2 hover:bg-slate-700 rounded"><ItalicIcon /></button>
                   <button title="Underline" onClick={() => document.execCommand('underline')} className="p-2 hover:bg-slate-700 rounded"><UnderlineIcon /></button>
                   <button title="Strikethrough" onClick={() => document.execCommand('strikeThrough')} className="p-2 hover:bg-slate-700 rounded"><StrikethroughIcon /></button>
                   <div className="toolbar-divider"></div>
                   <button title="Bulleted List" onClick={() => document.execCommand('insertUnorderedList')} className="p-2 hover:bg-slate-700 rounded"><ListIcon /></button>
                   <button title="Checklist" onClick={handleChecklist} className="p-2 hover:bg-slate-700 rounded"><ChecklistIcon /></button>
                   <div className="toolbar-divider"></div>
                   <button title="Attach Image" className="p-2 hover:bg-slate-700 rounded"><ImageIcon /></button>
                   <button title="Scan Document" className="p-2 hover:bg-slate-700 rounded"><ScanIcon /></button>
                   <button title="Record Audio Clip" className="p-2 hover:bg-slate-700 rounded"><MicIcon /></button>
                </div>
           </footer>
        </div>
    );
};