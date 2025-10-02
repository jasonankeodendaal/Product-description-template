import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Recording, Photo } from '../App';
import { SiteSettings } from '../constants';
import { useRecorder } from '../hooks/useRecorder';
import { transcribeAudio } from '../services/geminiService';
import { LiveWaveform } from './LiveWaveform';
import { WaveformPlayer } from './WaveformPlayer';
import { MicIcon } from './icons/MicIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatTime, formatRelativeTime, formatDateGroup } from '../utils/formatters';
import { SaveIcon } from './icons/SaveIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PhotoThumbnail } from './PhotoThumbnail';
import { dataURLtoBlob } from '../utils/dataUtils';
import { Spinner } from './icons/Spinner';
import { XIcon } from './icons/XIcon';
import { TranscriptIcon } from './icons/TranscriptIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PauseIcon } from './icons/PauseIcon';
import { PlayIcon } from './icons/PlayIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { resizeImage } from '../utils/imageUtils';


interface RecordingManagerProps {
    recordings: Recording[];
    onSave: (recording: Recording) => Promise<Recording>;
    onUpdate: (recording: Recording) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    siteSettings: SiteSettings;
}

const RecordingDetailContent: React.FC<{
    recording: Recording;
    onUpdate: (updatedRecording: Recording) => Promise<void>;
    onTranscribe: (recording: Recording) => void;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => void;
}> = React.memo(({ recording, onUpdate, onTranscribe, photos, onSavePhoto }) => {
    const [localRecording, setLocalRecording] = useState(recording);
    const [isCopied, setIsCopied] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    
    // State for photo selection within this view
    const [isSelectionActive, setIsSelectionActive] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

    useEffect(() => { setLocalRecording(recording); }, [recording]);

    const handleFieldChange = (field: keyof Recording, value: any) => {
        setLocalRecording(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveChanges = () => { if (JSON.stringify(localRecording) !== JSON.stringify(recording)) { onUpdate(localRecording); }};
    
    const handleUnlinkPhoto = useCallback((photoToUnlink: Photo) => {
        const updatedPhotoIds = localRecording.photoIds.filter(id => id !== photoToUnlink.id);
        onUpdate({ ...localRecording, photoIds: updatedPhotoIds });
    }, [localRecording, onUpdate]);

    const handleUnlinkSelectedPhotos = useCallback(() => {
        const updatedPhotoIds = localRecording.photoIds.filter(id => !selectedPhotoIds.has(id));
        onUpdate({ ...localRecording, photoIds: updatedPhotoIds });
        setSelectedPhotoIds(new Set());
        setIsSelectionActive(false);
    }, [localRecording, onUpdate, selectedPhotoIds]);

    const togglePhotoSelection = (id: string) => {
        setSelectedPhotoIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleFileCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
       const file = event.target.files?.[0];
       if (!file) return;

       const resizedDataUrl = await resizeImage(file);
       const imageBlob = dataURLtoBlob(resizedDataUrl);

       const newPhoto: Photo = { id: crypto.randomUUID(), name: `Photo for ${localRecording.name}`, notes: '', date: new Date().toISOString(), folder: `recordings/${localRecording.id}`, imageBlob, imageMimeType: imageBlob.type, tags: [localRecording.name, 'recording-asset']};
       await onSavePhoto(newPhoto);
       onUpdate({ ...localRecording, photoIds: [...localRecording.photoIds, newPhoto.id] });
       if (event.target) event.target.value = '';
    };
    
    const handleCopyTranscript = () => {
        navigator.clipboard.writeText(localRecording.transcript);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
     const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode; }> = ({ icon, title, children, action }) => (
        <div className="bg-black/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-orange-400">{icon}</div>
                    <h4 className="font-semibold text-white">{title}</h4>
                </div>
                {action}
            </div>
            {children}
        </div>
    );

    return (
        <>
            <input type="file" ref={cameraInputRef} className="sr-only" onChange={handleFileCapture} accept="image/*" capture="environment" />
            <div className="p-4 space-y-4 bg-black/10">
                <div className="bg-black/20 p-3 rounded-lg"><WaveformPlayer audioBlob={localRecording.audioBlob} /></div>
                
                <Section icon={<TranscriptIcon />} title="Transcript" action={
                    localRecording.transcript && (
                        <button onClick={handleCopyTranscript} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                           {isCopied ? <><CheckIcon className="w-4 h-4"/> Copied</> : <><CopyIcon className="w-4 h-4"/> Copy</>}
                       </button>
                   )
                }>
                    {localRecording.transcript ? (
                        <textarea value={localRecording.transcript} onChange={(e) => handleFieldChange('transcript', e.target.value)} onBlur={handleSaveChanges} className="w-full h-32 bg-[var(--theme-bg)] p-3 rounded-md border border-[var(--theme-border)] resize-y" placeholder="Transcript appears here..." />
                    ) : (
                        <button onClick={() => onTranscribe(localRecording)} disabled={localRecording.isTranscribing} className="bg-orange-500 text-black font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]">
                            {localRecording.isTranscribing ? <><Spinner className="h-4 w-4" /><span>Transcribing...</span></> : 'Generate Transcript'}
                        </button>
                    )}
                </Section>
                
                <Section icon={<NotepadIcon />} title="Notes">
                    <textarea value={localRecording.notes} onChange={(e) => handleFieldChange('notes', e.target.value)} onBlur={handleSaveChanges} className="w-full h-28 bg-[var(--theme-bg)] p-3 rounded-md border border-[var(--theme-border)] resize-y" placeholder="Add your notes here..." />
                </Section>
                
                <Section icon={<PhotoIcon />} title="Linked Photos" action={
                     <button onClick={() => setIsSelectionActive(prev => !prev)} className="text-xs font-semibold text-gray-400 hover:text-white bg-white/10 px-3 py-1 rounded-full">
                        {isSelectionActive ? 'Cancel' : 'Select'}
                     </button>
                }>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {localRecording.photoIds.map(id => {
                            const photo = photos.find(p => p.id === id);
                            return photo ? <PhotoThumbnail key={id} photo={photo} onSelect={() => {}} onDelete={handleUnlinkPhoto} isSelected={selectedPhotoIds.has(id)} isSelectionActive={isSelectionActive} onToggleSelection={togglePhotoSelection} /> : null;
                        })}
                        <button onClick={() => cameraInputRef.current?.click()} className="aspect-square border-2 border-dashed border-[var(--theme-border)] rounded-md flex items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]">
                            <CameraIcon className="h-6 w-6" />
                        </button>
                    </div>
                     {isSelectionActive && selectedPhotoIds.size > 0 && (
                        <div className="mt-4 p-2 bg-slate-800/50 rounded-lg flex justify-between items-center animate-fade-in-down">
                             <span className="text-sm font-semibold">{selectedPhotoIds.size} selected</span>
                             <button onClick={handleUnlinkSelectedPhotos} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
                                <TrashIcon /> Unlink Selected
                            </button>
                        </div>
                    )}
                </Section>
            </div>
        </>
    )
});


export const RecordingManager: React.FC<RecordingManagerProps> = ({ recordings, onSave, onUpdate, onDelete, photos, onSavePhoto, siteSettings }) => {
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const [isDetailViewClosing, setIsDetailViewClosing] = useState(false);
    const { isRecording, isPaused, recordingTime, audioBlob, startRecording, stopRecording, pauseRecording, resumeRecording, analyserNode, setAudioBlob } = useRecorder();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);
    
    useEffect(() => {
        // If the selected recording is deleted from the main list, close the detail view.
        if (selectedRecording && !recordings.find(r => r.id === selectedRecording.id)) {
            setSelectedRecording(null);
        }
    }, [recordings, selectedRecording]);
    
    const handleSelectRecording = (rec: Recording) => { setSelectedRecording(rec); };

    const handleCloseDetailView = () => {
        setIsDetailViewClosing(true);
        setTimeout(() => {
            setSelectedRecording(null);
            setIsDetailViewClosing(false);
        }, 300); // Corresponds to animation duration
    };

    const handleSaveAndClose = useCallback(async () => {
        if (!audioBlob) return;
        setIsSaving(true);
        const newRecording: Recording = { id: crypto.randomUUID(), name: `Recording ${new Date().toLocaleString()}`, date: new Date().toISOString(), transcript: '', notes: '', audioBlob, tags: [], photoIds: [] };
        const savedRecording = await onSave(newRecording);
        setIsSaving(false);
        setShowRecorder(false);
        setAudioBlob(null);
        setSelectedRecording(savedRecording);
    }, [audioBlob, onSave, setAudioBlob]);

    const handleDeleteRecording = useCallback(async (id: string) => {
        await onDelete(id);
        handleCloseDetailView();
    }, [onDelete]);
    
    const handleTranscribe = useCallback(async (recording: Recording) => {
        const recordingToUpdate = { ...recording, isTranscribing: true };
        onUpdate(recordingToUpdate);
        try {
            const transcript = await transcribeAudio(recording.audioBlob, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey);
            onUpdate({ ...recording, transcript, isTranscribing: false });
        } catch (error) {
            console.error("Transcription failed:", error);
            alert(`Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            onUpdate({ ...recording, isTranscribing: false });
        }
    }, [onUpdate, siteSettings]);

    const groupedRecordings = useMemo(() => {
        const filtered = recordings.filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.transcript && r.transcript.toLowerCase().includes(searchTerm.toLowerCase())) ||
            r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        const sorted = filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return sorted.reduce((acc, recording) => {
            const group = formatDateGroup(recording.date);
            if (!acc[group]) acc[group] = [];
            acc[group].push(recording);
            return acc;
        }, {} as Record<string, Recording[]>);

    }, [recordings, searchTerm]);

    const sortedGroupKeys = useMemo(() => {
        const keys = Object.keys(groupedRecordings);
        const groupOrder = ["Today", "Yesterday", "This Week", "Last Week", "This Month"];
        return keys.sort((a, b) => {
            const aIndex = groupOrder.indexOf(a);
            const bIndex = groupOrder.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return b.localeCompare(a);
        });
    }, [groupedRecordings]);
    
    return (
        <div className="flex flex-col md:flex-row flex-1 bg-transparent backdrop-blur-2xl overflow-hidden relative">
            
            {/* LEFT PANE (LIST) */}
            <div className={`w-full md:w-2/5 lg:w-1/3 flex flex-col border-r-0 md:border-r md:border-[var(--theme-border)] transition-transform duration-300 ease-in-out ${selectedRecording ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-4 border-b border-[var(--theme-border)] flex-shrink-0">
                    <div className="relative"><SearchIcon className="absolute inset-y-0 left-3 h-5 w-5 text-[var(--theme-text-secondary)]" /><input type="text" placeholder="Search recordings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-md pl-10 pr-4 py-2" /></div>
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar pb-24">
                    {sortedGroupKeys.length > 0 ? (
                        sortedGroupKeys.map(group => (
                            <section key={group} className="py-2">
                                <h3 className="px-4 pb-2 text-sm font-bold text-orange-400">{group}</h3>
                                <ul className="space-y-1 px-2">
                                    {groupedRecordings[group].map(rec => (
                                         <li key={rec.id}>
                                            <button 
                                                onClick={() => handleSelectRecording(rec)}
                                                className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${selectedRecording?.id === rec.id ? 'bg-orange-500/20' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{rec.name}</p>
                                                    <p className="text-sm text-gray-400">{formatRelativeTime(rec.date)}</p>
                                                </div>
                                                 <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                                                    {rec.transcript && <TranscriptIcon className="w-4 h-4 text-gray-400" />}
                                                    {rec.photoIds.length > 0 && <PhotoIcon className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </button>
                                         </li>
                                    ))}
                                </ul>
                            </section>
                        ))
                    ) : (<div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]"><MicIcon className="h-12 w-12 mb-4" /><h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">No recordings found</h3><p className="text-sm mt-1">Tap the plus button to start.</p></div>)}
                </div>
            </div>

            {/* RIGHT PANE / MODAL */}
            <div className={`fixed inset-0 z-10 md:static md:w-3/5 lg:w-2/3 flex flex-col bg-[var(--theme-card-bg)] transition-transform duration-300 ease-in-out ${selectedRecording ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} ${isDetailViewClosing ? 'translate-x-full md:translate-x-0' : ''}`}>
                {selectedRecording ? (
                    <>
                        <header className="p-2 pr-4 border-b border-[var(--theme-border)] flex-shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-1 flex-grow min-w-0">
                                <button onClick={handleCloseDetailView} className="p-2 text-gray-400 hover:text-white"><ChevronLeftIcon /></button>
                                <input 
                                    type="text"
                                    value={selectedRecording.name}
                                    onChange={(e) => onUpdate({...selectedRecording, name: e.target.value})}
                                    className="text-lg font-bold bg-transparent border-b-2 border-transparent focus:border-orange-500 focus:outline-none w-full truncate"
                                />
                            </div>
                            <button onClick={() => handleDeleteRecording(selectedRecording.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                        </header>
                         <div className="flex-1 overflow-y-auto">
                            <RecordingDetailContent 
                                recording={selectedRecording}
                                onUpdate={onUpdate}
                                onTranscribe={handleTranscribe}
                                photos={photos}
                                onSavePhoto={onSavePhoto}
                            />
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center text-center text-gray-500 p-8">
                        <div>
                            <MicIcon className="h-16 w-16 mx-auto" />
                            <h3 className="mt-4 text-xl font-semibold text-white">Select a recording</h3>
                            <p>Choose an item from the list to see its details.</p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-20 right-4 z-30 lg:bottom-4 flex flex-col items-end gap-4">
                 {showRecorder && (
                    <div className="p-4 bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-2xl w-80 animate-fade-in-down">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-16 bg-[var(--theme-bg)] rounded-md overflow-hidden">
                                {isRecording || isPaused ? <LiveWaveform analyserNode={analyserNode} isPaused={isPaused} /> : audioBlob ? <WaveformPlayer audioBlob={audioBlob} /> : <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Ready...</div>}
                            </div>
                            <div className="flex flex-col gap-2 items-center">
                                <span className="font-mono text-lg text-center">{formatTime(recordingTime)}</span>
                                {isRecording || isPaused ? (
                                <div className="flex gap-2">
                                    <button onClick={isPaused ? resumeRecording : pauseRecording} className="p-2 bg-amber-500 text-black rounded-full" title={isPaused ? 'Resume' : 'Pause'}>{isPaused ? <PlayIcon /> : <PauseIcon />}</button>
                                    <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full" title="Stop"><div className="w-3 h-3 bg-white rounded-sm"></div></button>
                                </div>
                                ) : (
                                <button onClick={handleSaveAndClose} disabled={!audioBlob || isSaving} className="bg-[var(--theme-orange)] text-black font-bold py-1 px-3 rounded-md flex items-center justify-center gap-1 text-sm disabled:bg-[var(--theme-border)]">
                                    <SaveIcon /> {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                )}
                            </div>
                        </div>
                    </div>
                 )}
                <button onClick={() => { if(isRecording || isPaused) stopRecording(); else { setShowRecorder(true); startRecording(); } }} className={`${isRecording || isPaused ? 'bg-red-500' : 'bg-[var(--theme-orange)]'} text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all hover:scale-110 active:scale-95`}>
                    <PlusIcon className={`w-8 h-8 transition-transform duration-300 ${isRecording || isPaused ? 'rotate-45' : ''}`} />
                </button>
            </div>
        </div>
    );
};