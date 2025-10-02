import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Note, NoteRecording, Photo } from '../App';
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
import { dataURLtoBlob } from '../utils/dataUtils';
import { ScanIcon } from './icons/ScanIcon';
import { BellIcon } from './icons/BellIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ImageIcon } from './icons/ImageIcon';
import { StrikethroughIcon } from './icons/StrikethroughIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { MagicIcon } from './icons/MagicIcon';
import { UploadIcon } from './icons/UploadIcon';
import { Spinner } from './icons/Spinner';
import { resizeImage } from '../utils/imageUtils';
import { SaveIcon } from './icons/SaveIcon';
import { CheckIcon } from './icons/CheckIcon';
import { useDebounce } from '../hooks/useDebounce';
import { LockIcon } from './icons/LockIcon';
import { UnlockIcon } from './icons/UnlockIcon';

// Props definition
interface NotepadProps {
    notes: Note[];
    onSave: (note: Note) => Promise<void>;
    onUpdate: (note: Note) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    noteRecordings: NoteRecording[];
    onSaveNoteRecording: (rec: NoteRecording) => Promise<void>;
    onUpdateNoteRecording: (rec: NoteRecording) => Promise<void>;
    onDeleteNoteRecording: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    onUpdatePhoto: (photo: Photo) => Promise<void>;
    performAiAction: (prompt: string, context: string) => Promise<any>;
}

// --- NoteSettingsSidebar Component (New) ---
const NoteSettingsPanel: React.FC<{
    note: Note;
    onNoteChange: (updater: (note: Note) => Note) => void;
    onClose: () => void;
    isClosing: boolean;
}> = ({ note, onNoteChange, onClose, isClosing }) => {
    const solidColorMap: Record<string, string> = {
        sky: '#38bdf8', purple: '#a855f7', emerald: '#10b981',
        amber: '#f59e0b', pink: '#ec4899', cyan: '#22d3ee',
    };
    const paperStyles: Record<string, string> = { 'paper-dark': 'Dark', 'paper-grid': 'Grid' };
    const fontStyles: Record<string, string> = { 'font-sans': 'Sans', 'font-serif': 'Serif', 'font-mono': 'Mono' };

    return (
        <div 
            className={`note-settings-panel-container ${isClosing ? 'note-settings-panel-out' : ''}`}
            onClick={onClose}
        >
            <div 
                className="note-settings-sidebar"
                onClick={e => e.stopPropagation()}
            >
                <header className="settings-sidebar-header">
                    <h3 className="text-lg font-bold">Note Settings</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><XIcon /></button>
                </header>
                <div className="settings-sidebar-content">
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <BellIcon />
                            <label>Due Date</label>
                        </div>
                        <input type="datetime-local" value={note.dueDate ? note.dueDate.slice(0, 16) : ''} onChange={e => onNoteChange(n => ({...n, dueDate: e.target.value || null, reminderDate: e.target.value || null, reminderFired: false }))} className="settings-input" />
                    </div>

                    <div className="settings-section">
                        <div className="settings-section-header">
                             <NotepadIcon />
                             <label>Paper Style</label>
                        </div>
                        <select value={note.paperStyle} onChange={e => onNoteChange(n => ({ ...n, paperStyle: e.target.value }))} className="settings-select">
                            {Object.entries(paperStyles).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                        </select>
                        <div className="settings-section-controls">
                            <label>Aa Font Style</label>
                            <select value={note.fontStyle} onChange={e => onNoteChange(n => ({ ...n, fontStyle: e.target.value }))} className="settings-select">
                                {Object.entries(fontStyles).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                            </select>
                        </div>
                        <div className="settings-color-palette">
                            {Object.entries(solidColorMap).map(([name, color]) => (
                                <button key={name} type="button" onClick={() => onNoteChange(n => ({...n, color:name}))} className={`settings-color-swatch ${note.color === name ? 'selected' : ''}`} style={{ backgroundColor: color }}>
                                    {note.color === name && <CheckIcon className="w-4 h-4 text-black" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="settings-section">
                         <div className="settings-section-header">
                            <LockIcon />
                            <label>Security</label>
                        </div>
                        <p className="text-sm text-gray-400 -mt-2 mb-4">Lock this note to require a PIN to view its content.</p>
                        <button onClick={() => onNoteChange(n => ({...n, isLocked: !n.isLocked}))} className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-600">
                            {note.isLocked ? <UnlockIcon className="w-4 h-4"/> : <LockIcon className="w-4 h-4"/>}
                            <span className="font-semibold text-sm">{note.isLocked ? 'Unlock Note' : 'Lock Note'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AudioPlayerModal: React.FC<{recording: NoteRecording, onClose: () => void}> = ({ recording, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--theme-border)]/50 p-6 animate-modal-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">{recording.name}</h3>
            <WaveformPlayer audioBlob={recording.audioBlob} />
            <button onClick={onClose} className="mt-4 w-full bg-orange-500 text-black font-bold py-2 px-4 rounded-md">Close</button>
        </div>
    </div>
);

const PhotoViewerModal: React.FC<{photo: Photo, onClose: () => void}> = ({ photo, onClose }) => (
     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in-down" onClick={onClose}>
        <div className="bg-[var(--theme-card-bg)] max-w-4xl w-full max-h-[90vh] rounded-xl shadow-2xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <img src={URL.createObjectURL(photo.imageBlob)} alt={photo.name} className="flex-1 max-w-full max-h-[calc(90vh - 80px)] object-contain" />
            <div className="flex-shrink-0 flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                <p className="text-white font-semibold truncate">{photo.name}</p>
                <button onClick={onClose} className="text-sm bg-orange-500 text-black font-bold py-1 px-3 rounded-md">Close</button>
            </div>
        </div>
    </div>
);


const NoteEditor: React.FC<Omit<NotepadProps, 'notes' | 'onSave'> & { note: Note; onClose: () => void; }> = ({ note, onUpdate, onDelete, onClose, onSaveNoteRecording, onUpdateNoteRecording, onSavePhoto, onUpdatePhoto, performAiAction, noteRecordings, photos }) => {
    const [localNote, setLocalNote] = useState(note);
    const [isDirty, setIsDirty] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const contentRef = useRef<HTMLDivElement>(null);
    const { isRecording, recordingTime, audioBlob, startRecording, stopRecording, analyserNode, setAudioBlob } = useRecorder();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSettingsClosing, setIsSettingsClosing] = useState(false);
    const [isRecordingPanelOpen, setIsRecordingPanelOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const heroFileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [playingRecording, setPlayingRecording] = useState<NoteRecording | null>(null);
    const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

    useEffect(() => {
        setLocalNote(note);
        setIsDirty(false);
        setSaveState('idle');
        if (contentRef.current) {
            contentRef.current.innerHTML = note.content;
        }
    }, [note]);

    const updateLocalNote = (updater: (prevNote: Note) => Note) => {
        setLocalNote(prev => {
            const newState = updater(prev);
            if (JSON.stringify(newState) !== JSON.stringify(note)) {
                setIsDirty(true);
                setSaveState('idle');
            }
            return newState;
        });
    };
    
    const handleCloseSettings = () => {
        setIsSettingsClosing(true);
        setTimeout(() => {
            setIsSettingsOpen(false);
            setIsSettingsClosing(false);
        }, 300);
    };

    const handleSave = async () => {
        if (!isDirty) return;
        setSaveState('saving');
        try {
            await onUpdate(localNote);
            setIsDirty(false);
            setSaveState('saved');
            setTimeout(() => setSaveState('idle'), 2000);
        } catch (e) {
            console.error("Failed to save note:", e);
            setSaveState('idle');
        }
    };
    
    const handleContentChange = useCallback(() => {
        if (contentRef.current) {
            updateLocalNote(prev => ({ ...prev, content: contentRef.current!.innerHTML, date: new Date().toISOString() }));
        }
    }, []);

     useEffect(() => {
        const editor = contentRef.current;
        if (!editor) return;
    
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
    
            const li = target.closest<HTMLLIElement>('ul[data-type="checklist"] > li');
            if (li) {
                const liRect = li.getBoundingClientRect();
                if (e.clientX < liRect.left + 32) {
                    e.preventDefault();
                    const isChecked = li.dataset.checked === 'true';
                    li.dataset.checked = isChecked ? 'false' : 'true';
                    handleContentChange();
                    return;
                }
            }
            
            const embeddedRecording = target.closest<HTMLSpanElement>('.embedded-recording[data-recording-id]');
            if (embeddedRecording) {
                e.preventDefault();
                const recordingId = embeddedRecording.dataset.recordingId;
                const recording = noteRecordings.find(r => r.id === recordingId);
                if (recording) setPlayingRecording(recording);
                return;
            }
    
            const embeddedImage = target.closest<HTMLSpanElement>('.embedded-image[data-photo-id]');
            if (embeddedImage) {
                e.preventDefault();
                const photoId = embeddedImage.dataset.photoId;
                const photo = photos.find(p => p.id === photoId);
                if (photo) setViewingPhoto(photo);
            }
        };
        
        const handleDoubleClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const embeddedItem = target.closest<HTMLSpanElement>('.embedded-recording[data-recording-id], .embedded-image[data-photo-id]');
            
            if (embeddedItem) {
                e.preventDefault();
                
                const recordingId = embeddedItem.dataset.recordingId;
                const photoId = embeddedItem.dataset.photoId;
                
                if (recordingId) {
                    const recording = noteRecordings.find(r => r.id === recordingId);
                    if (!recording) return;

                    const newName = prompt("Enter new name for recording:", recording.name);
                    if (newName && newName.trim() && newName.trim() !== recording.name) {
                        const updatedRecording = { ...recording, name: newName.trim() };
                        await onUpdateNoteRecording(updatedRecording); 
                        
                        const icon = embeddedItem.querySelector('svg')?.outerHTML || '';
                        embeddedItem.innerHTML = `${icon} ${newName.trim()}`;
                        handleContentChange();
                    }
                } else if (photoId) {
                    const photo = photos.find(p => p.id === photoId);
                    if (!photo) return;

                    const newName = prompt("Enter new name for image/scan:", photo.name);
                    if (newName && newName.trim() && newName.trim() !== photo.name) {
                        const updatedPhoto = { ...photo, name: newName.trim() };
                        await onUpdatePhoto(updatedPhoto);

                        const icon = embeddedItem.querySelector('svg')?.outerHTML || '';
                        embeddedItem.innerHTML = `${icon} ${newName.trim()}`;
                        handleContentChange();
                    }
                }
            }
        };
    
        editor.addEventListener('click', handleClick);
        editor.addEventListener('dblclick', handleDoubleClick);
        return () => {
            editor.removeEventListener('click', handleClick);
            editor.removeEventListener('dblclick', handleDoubleClick);
        };
    }, [noteRecordings, photos, handleContentChange, onUpdateNoteRecording, onUpdatePhoto]);

    const executeCommand = (command: string) => {
        document.execCommand(command, false);
        handleContentChange();
        contentRef.current?.focus();
    };

    const insertHtml = (html: string) => {
        document.execCommand('insertHTML', false, html);
        handleContentChange();
    };
    
    const handleChecklist = () => {
        executeCommand('insertUnorderedList');
        const ul = contentRef.current?.querySelector('ul:not([data-type])');
        if (ul) {
            ul.setAttribute('data-type', 'checklist');
            ul.querySelectorAll('li').forEach(li => li.setAttribute('data-checked', 'false'));
            handleContentChange();
        }
    };

    const handleSaveRecording = useCallback(async () => {
        if (!audioBlob) return;
        const newRec: NoteRecording = { id: crypto.randomUUID(), noteId: localNote.id, name: `Audio Note ${new Date().toLocaleString()}`, date: new Date().toISOString(), audioBlob };
        await onSaveNoteRecording(newRec);
        setAudioBlob(null); 
        insertHtml(`<p><span contenteditable="false" data-recording-id="${newRec.id}" class="embedded-recording"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> ${newRec.name}</span>&nbsp;</p>`);
    }, [audioBlob, localNote.id, onSaveNoteRecording, setAudioBlob]);

    const handleFileSelect = async (file: File) => {
        const placeholderId = `placeholder-${crypto.randomUUID()}`;
        const spinnerSVG = `<svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        insertHtml(`<p><span id="${placeholderId}" contenteditable="false" class="embedded-image">${spinnerSVG} Uploading ${file.name}...</span>&nbsp;</p>`);
        
        try {
            const resizedDataUrl = await resizeImage(file);
            const imageBlob = dataURLtoBlob(resizedDataUrl);
            const newPhoto: Photo = { id: crypto.randomUUID(), name: file.name.split('.').slice(0, -1).join('.') || 'Attached Image', notes: `Attached to note: ${localNote.id}`, date: new Date().toISOString(), folder: `notes/images/${localNote.id}`, imageBlob, imageMimeType: imageBlob.type, tags: ['note-image', localNote.title]};
            await onSavePhoto(newPhoto);

            const editor = contentRef.current;
            if (editor) {
                const placeholder = editor.querySelector<HTMLSpanElement>(`#${placeholderId}`);
                if (placeholder) {
                    const imageIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`;
                    placeholder.innerHTML = `${imageIconSVG} ${newPhoto.name}`;
                    placeholder.dataset.photoId = newPhoto.id;
                    placeholder.removeAttribute('id');
                    handleContentChange();
                }
            }
        } catch (err) {
            console.error("Error attaching image:", err);
            const editor = contentRef.current;
            if(editor) {
                const placeholder = editor.querySelector<HTMLSpanElement>(`#${placeholderId}`);
                if(placeholder) {
                    placeholder.outerHTML = `<span contenteditable="false" class="embedded-image-error">Upload failed: ${file.name}</span>`;
                    handleContentChange();
                }
            }
        }
    };

    const handleHeroImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resizedDataUrl = await resizeImage(file, 800);
                updateLocalNote(prev => ({ ...prev, heroImage: resizedDataUrl, date: new Date().toISOString() }));
            } catch (err) {
                alert('Could not process image.');
            }
        }
    };
    
    const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        if (event.target) event.target.value = '';
    };

    const dragHandlers = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.items?.[0]?.kind === 'file') setIsDraggingOver(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: async (e: React.DragEvent) => {
            e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                await handleFileSelect(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
            }
        },
    };

    useEffect(() => {
        const editor = contentRef.current; if (!editor) return;
        let draggedItem: HTMLLIElement | null = null, dropIndicator: HTMLLIElement | null = null;
        const createDropIndicator = () => { const li = document.createElement('li'); li.className = 'drop-indicator-li'; const div = document.createElement('div'); div.className = 'drop-indicator'; li.appendChild(div); return li; };
        const handleDragStart = (e: DragEvent) => { const target = e.target as HTMLLIElement; if (target.tagName === 'LI' && target.closest('ul[data-type="checklist"]')) { draggedItem = target; setTimeout(() => target.classList.add('dragging'), 0); } };
        const handleDragOver = (e: DragEvent) => { e.preventDefault(); if (!draggedItem) return; const target = (e.target as HTMLElement).closest('li'); const ul = (e.target as HTMLElement).closest('ul[data-type="checklist"]'); if (!ul) return; if (!dropIndicator) dropIndicator = createDropIndicator(); if (target && target !== draggedItem && ul.contains(target)) { const rect = target.getBoundingClientRect(); const isAfter = e.clientY > rect.top + rect.height / 2; ul.insertBefore(dropIndicator, isAfter ? target.nextSibling : target); } else if (!target) { ul.appendChild(dropIndicator); } };
        const handleDrop = (e: DragEvent) => { e.preventDefault(); if (draggedItem && dropIndicator && dropIndicator.parentNode) { dropIndicator.parentNode.replaceChild(draggedItem, dropIndicator); handleContentChange(); } };
        const handleDragEnd = () => { draggedItem?.classList.remove('dragging'); draggedItem = null; dropIndicator?.remove(); dropIndicator = null; };
        editor.addEventListener('dragstart', handleDragStart); editor.addEventListener('dragover', handleDragOver); editor.addEventListener('drop', handleDrop); editor.addEventListener('dragend', handleDragEnd);
        return () => { editor.removeEventListener('dragstart', handleDragStart); editor.removeEventListener('dragover', handleDragOver); editor.removeEventListener('drop', handleDrop); editor.removeEventListener('dragend', handleDragEnd); };
    }, [handleContentChange]);
    
    useEffect(() => {
        const updateToolbarState = () => { const newFormats = new Set<string>(); ['bold', 'italic', 'underline', 'strikeThrough'].forEach(cmd => { if (document.queryCommandState(cmd)) newFormats.add(cmd); }); setActiveFormats(newFormats); };
        document.addEventListener('selectionchange', updateToolbarState);
        return () => document.removeEventListener('selectionchange', updateToolbarState);
    }, []);

    const paperStyles: Record<string, string> = { 'paper-dark': 'bg-gray-800 text-gray-200', 'paper-grid': 'bg-gray-800 text-gray-200 bg-cover bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]' };
    const fontStyles: Record<string, string> = { 'font-sans': 'font-sans', 'font-serif': 'font-lora', 'font-mono': 'font-mono' };

    return (
        <div className="h-full flex flex-col bg-[var(--theme-card-bg)] relative overflow-hidden">
           {isSettingsOpen && <NoteSettingsPanel note={localNote} onNoteChange={updateLocalNote} onClose={handleCloseSettings} isClosing={isSettingsClosing} />}
           {playingRecording && <AudioPlayerModal recording={playingRecording} onClose={() => setPlayingRecording(null)}/>}
           {viewingPhoto && <PhotoViewerModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)}/>}
           
           <input type="file" ref={heroFileInputRef} className="sr-only" accept="image/*" onChange={handleHeroImageSelect} />
           <input type="file" ref={cameraInputRef} className="sr-only" accept="image/*" capture="environment" onChange={handleCameraCapture} />
           {localNote.heroImage ? (
               <div className="note-hero-container group">
                   <img src={localNote.heroImage} alt="Note hero" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => updateLocalNote(n => ({ ...n, heroImage: null }))} className="bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2"><TrashIcon /> Remove Header</button>
                   </div>
               </div>
           ) : (
               <div className="p-2 border-b border-[var(--theme-border)]"><button onClick={() => heroFileInputRef.current?.click()} className="w-full text-sm text-center py-2 bg-[var(--theme-bg)]/50 hover:bg-[var(--theme-bg)] rounded-md text-gray-400">+ Add Header Image</button></div>
           )}
           
           <header className="p-2 border-b border-[var(--theme-border)] flex items-center justify-between flex-shrink-0">
               <div className="flex items-center gap-2 flex-grow min-w-0">
                   <button onClick={onClose} className="p-2 text-[var(--theme-text-secondary)]"><ChevronLeftIcon /></button>
                   <input type="text" value={localNote.title} onChange={e => updateLocalNote(n => ({ ...n, title: e.target.value, date: new Date().toISOString() }))} placeholder="Note Title..." className="text-xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-orange)] focus:outline-none w-full truncate" />
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                    {isDirty && (
                       <button onClick={handleSave} disabled={saveState === 'saving'} className="text-sm font-semibold py-1.5 px-4 rounded-full flex items-center gap-1.5 transition-colors duration-200 bg-orange-600 text-white hover:bg-orange-500 disabled:bg-gray-500">
                           {saveState === 'saving' ? <><Spinner className="w-4 h-4" /> Saving...</> : saveState === 'saved' ? <><CheckIcon /> Saved</> : 'Save'}
                       </button>
                   )}
                   <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-[var(--theme-text-secondary)] hover:text-white relative"><SettingsIcon /></button>
                   <button onClick={() => onDelete(localNote.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
               </div>
           </header>
           
           <div className="flex-grow overflow-y-auto relative" style={{ paddingBottom: '60px' }} {...dragHandlers}>
               {isDraggingOver && <div className="dropzone-overlay"><UploadIcon /><p>Drop to attach file</p></div>}
               <div ref={contentRef} onInput={handleContentChange} contentEditable suppressContentEditableWarning className={`note-editor-content p-4 outline-none min-h-full ${paperStyles[localNote.paperStyle]} ${fontStyles[localNote.fontStyle]}`}/>
           </div>
           
           <footer className="absolute bottom-0 left-0 right-0 p-2 bg-slate-900/80 backdrop-blur-sm border-t border-white/10 note-editor-toolbar z-10">
               <div className="flex items-center justify-start gap-1 flex-wrap">
                   <button title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('bold')} className={`p-2 hover:bg-slate-700 rounded ${activeFormats.has('bold') ? 'active' : ''}`}><BoldIcon /></button>
                   <button title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('italic')} className={`p-2 hover:bg-slate-700 rounded ${activeFormats.has('italic') ? 'active' : ''}`}><ItalicIcon /></button>
                   <button title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('underline')} className={`p-2 hover:bg-slate-700 rounded ${activeFormats.has('underline') ? 'active' : ''}`}><UnderlineIcon /></button>
                   <button title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('strikeThrough')} className={`p-2 hover:bg-slate-700 rounded ${activeFormats.has('strikeThrough') ? 'active' : ''}`}><StrikethroughIcon /></button>
                   <div className="toolbar-divider"></div>
                   <button title="Bulleted List" onMouseDown={(e) => e.preventDefault()} onClick={() => executeCommand('insertUnorderedList')} className="p-2 hover:bg-slate-700 rounded"><ListIcon /></button>
                   <button title="Checklist" onMouseDown={(e) => e.preventDefault()} onClick={handleChecklist} className="p-2 hover:bg-slate-700 rounded"><ChecklistIcon /></button>
                   <div className="toolbar-divider"></div>
                   <input type="file" ref={fileInputRef} className="sr-only" accept="image/*" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} />
                   <button title="Attach Image" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-700 rounded"><ImageIcon /></button>
                   <button title="Scan Document" onClick={() => cameraInputRef.current?.click()} className="p-2 hover:bg-slate-700 rounded"><ScanIcon /></button>
                   <button title="Record Audio Clip" onClick={() => setIsRecordingPanelOpen(p => !p)} className={`p-2 hover:bg-slate-700 rounded ${isRecordingPanelOpen ? 'active' : ''}`}><MicIcon /></button>
                   <button title="Note Settings" onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-slate-700 rounded"><SettingsIcon /></button>
               </div>
               {isRecordingPanelOpen && (
                   <div className="p-2 bg-black/30 rounded mt-2">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-10 rounded-md overflow-hidden bg-black/20">
                               {isRecording && <LiveWaveform analyserNode={analyserNode} />}
                               {!isRecording && audioBlob && <WaveformPlayer audioBlob={audioBlob} />}
                           </div>
                           <button onClick={isRecording ? stopRecording : startRecording} className="p-2 bg-red-500 text-white rounded-full"><MicIcon /></button>
                           <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                           <button onClick={handleSaveRecording} disabled={!audioBlob} className="text-sm bg-green-500 text-black font-semibold px-3 py-1 rounded disabled:opacity-50">Save</button>
                       </div>
                   </div>
               )}
           </footer>
        </div>
    );
};


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

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent?.replace(/&nbsp;/g, ' ').trim() || "";
};

const NoteCard: React.FC<{ note: Note; onSelect: (note: Note) => void; isSelected: boolean }> = ({ note, onSelect, isSelected }) => {
    return (
        <button
            onClick={() => onSelect(note)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                    ? `bg-[var(--theme-card-bg)] border-[var(--theme-orange)]`
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


export const Notepad: React.FC<NotepadProps> = (props) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const lastSavedNote = useRef<Note | null>(null);

    const handleSelectNote = useCallback(async (noteToSelect: Note | null) => {
        if (selectedNote && lastSavedNote.current && JSON.stringify(selectedNote) !== JSON.stringify(lastSavedNote.current)) {
            await props.onUpdate(selectedNote);
        }
        
        setSelectedNote(noteToSelect);
        lastSavedNote.current = noteToSelect;
    }, [selectedNote, props.onUpdate]);
    
    const handleUpdate = useCallback(async (updatedNote: Note) => {
        await props.onUpdate(updatedNote);
        lastSavedNote.current = updatedNote;
    }, [props.onUpdate]);

    const handleAddNewNote = useCallback(async () => {
        const newNote: Note = { id: crypto.randomUUID(), title: 'New Note', content: '<p></p>', category: 'General', tags: [], date: new Date().toISOString(), color: defaultColors[Math.floor(Math.random() * defaultColors.length)], paperStyle: 'paper-dark', fontStyle: 'font-sans', heroImage: null, dueDate: null, reminderDate: null, reminderFired: false, recordingIds: [], photoIds: [], isLocked: false };
        await props.onSave(newNote);
        handleSelectNote(newNote);
    }, [props.onSave, handleSelectNote]);

    useEffect(() => {
        if (selectedNote) {
            const updatedNoteFromList = props.notes.find(n => n.id === selectedNote.id);
            if (!updatedNoteFromList) {
                setSelectedNote(null);
            } else if (JSON.stringify(updatedNoteFromList) !== JSON.stringify(selectedNote)) {
                if(new Date(updatedNoteFromList.date) > new Date(selectedNote.date)){
                    setSelectedNote(updatedNoteFromList);
                }
            }
        }
    }, [props.notes, selectedNote]);

    const handleDelete = async (id: string) => {
        await props.onDelete(id);
        setSelectedNote(null);
    };
    
     const filteredNotes = useMemo(() => {
        const sorted = [...props.notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!debouncedSearchTerm) return sorted;
        return sorted.filter(note =>
            note.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            stripHtml(note.content).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        );
    }, [props.notes, debouncedSearchTerm]);
    
    return (
        <div className="flex-1 flex flex-col bg-transparent backdrop-blur-2xl">
            <div className="flex-grow flex overflow-hidden">
                <aside className={`w-full md:w-1/3 md:max-w-sm flex flex-col border-r border-transparent md:border-[var(--theme-border)] ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
                    <header className="p-4 flex-shrink-0 border-b border-[var(--theme-border)] flex items-center justify-between">
                         <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="h-5 w-5 text-[var(--theme-text-secondary)]" /></div>
                            <input type="text" placeholder="Search notes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg pl-10 pr-4 py-2"/>
                        </div>
                        <button onClick={handleAddNewNote} className="ml-2 p-2 bg-[var(--theme-orange)] text-black rounded-full flex-shrink-0"><PlusIcon /></button>
                    </header>
                     <div className="flex-grow overflow-y-auto no-scrollbar p-2 space-y-2">
                        {filteredNotes.length > 0 ? (
                            filteredNotes.map(note => (
                                <NoteCard key={note.id} note={note} onSelect={() => handleSelectNote(note)} isSelected={selectedNote?.id === note.id} />
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
                            {...props}
                            note={selectedNote}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onClose={() => handleSelectNote(null)}
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