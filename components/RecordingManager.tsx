// FIX: Import 'useEffect' from 'react' to resolve the "Cannot find name 'useEffect'" error.
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Recording, Photo } from '../App';
import { SiteSettings } from '../constants';
import { useRecorder } from '../hooks/useRecorder';
import { transcribeAudio } from '../services/geminiService';
import { LiveWaveform } from './LiveWaveform';
import { WaveformPlayer } from './WaveformPlayer';
import { MicIcon } from './icons/MicIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatTime } from '../utils/formatters';
import { SaveIcon } from './icons/SaveIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PhotoThumbnail } from './PhotoThumbnail';
import { CameraCapture } from './CameraCapture';
import { dataURLtoBlob } from '../utils/dataUtils';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { Spinner } from './icons/Spinner';
import { XIcon } from './icons/XIcon';
import { TranscriptIcon } from './icons/TranscriptIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { PlusIcon } from './icons/PlusIcon';
import { WaveformIcon } from './icons/WaveformIcon';
import { PauseIcon } from './icons/PauseIcon';
import { PlayIcon } from './icons/PlayIcon';


interface RecordingManagerProps {
    recordings: Recording[];
    onSave: (recording: Recording) => Promise<Recording>;
    onUpdate: (recording: Recording) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    siteSettings: SiteSettings;
}

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-text-primary)] mb-2">
        <div className="w-6 h-6 text-[var(--theme-orange)]">{icon}</div>
        <h3>{title}</h3>
    </div>
);

const RecordingDetailView: React.FC<{
    recording: Recording;
    onUpdate: (updatedRecording: Recording) => void;
    onTranscribe: (recording: Recording) => void;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => void;
}> = ({ recording, onUpdate, onTranscribe, photos, onSavePhoto }) => {
    const [localRecording, setLocalRecording] = useState(recording);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    useEffect(() => {
        setLocalRecording(recording);
    }, [recording]);

    const handleFieldChange = (field: keyof Recording, value: any) => {
        setLocalRecording(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveChanges = () => {
        if (JSON.stringify(localRecording) !== JSON.stringify(recording)) {
            onUpdate(localRecording);
        }
    };

    const handleUnlinkPhoto = useCallback((photoToUnlink: Photo) => {
        if (window.confirm(`Are you sure you want to unlink "${photoToUnlink.name}" from this recording? This will not delete the photo itself.`)) {
            const updatedPhotoIds = localRecording.photoIds.filter(id => id !== photoToUnlink.id);
            const updatedRecording = { ...localRecording, photoIds: updatedPhotoIds };
            setLocalRecording(updatedRecording);
            onUpdate(updatedRecording);
        }
    }, [localRecording, onUpdate]);

    const handleCapture = async (dataUrl: string) => {
       const newPhoto: Photo = {
           id: crypto.randomUUID(),
           name: `Photo for ${localRecording.name}`,
           notes: '',
           date: new Date().toISOString(),
           folder: `recordings/${localRecording.id}`,
           imageBlob: dataURLtoBlob(dataUrl),
           imageMimeType: 'image/jpeg',
           tags: [localRecording.name, 'recording-asset']
       };
       await onSavePhoto(newPhoto);
       const updatedRecording = { ...localRecording, photoIds: [...localRecording.photoIds, newPhoto.id] };
       setLocalRecording(updatedRecording);
       onUpdate(updatedRecording);
       setIsCameraOpen(false);
    };

    return (
        <>
            {isCameraOpen && <CameraCapture onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
            <div className="p-4 md:p-6 space-y-6">
                <p className="text-sm text-[var(--theme-text-secondary)] -mt-2">{new Date(localRecording.date).toLocaleString()}</p>
                <div className="bg-black/20 p-4 rounded-lg">
                    <WaveformPlayer audioBlob={localRecording.audioBlob} />
                </div>

                <div>
                    <SectionHeader icon={<TranscriptIcon />} title="Transcript" />
                    {localRecording.transcript ? (
                        <textarea value={localRecording.transcript} onChange={(e) => handleFieldChange('transcript', e.target.value)} onBlur={handleSaveChanges} className="w-full h-40 bg-[var(--theme-bg)] p-3 rounded-md border border-[var(--theme-border)] resize-y" placeholder="Transcript appears here..." />
                    ) : (
                        <button onClick={() => onTranscribe(localRecording)} disabled={localRecording.isTranscribing} className="bg-[var(--theme-orange)] text-black font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]">
                            {localRecording.isTranscribing ? <><Spinner className="h-4 w-4" /><span>Transcribing...</span></> : 'Transcribe Audio'}
                        </button>
                    )}
                </div>

                <div>
                    <SectionHeader icon={<NotepadIcon />} title="Notes" />
                    <textarea value={localRecording.notes} onChange={(e) => handleFieldChange('notes', e.target.value)} onBlur={handleSaveChanges} className="w-full h-32 bg-[var(--theme-bg)] p-3 rounded-md border border-[var(--theme-border)] resize-y" placeholder="Add your notes here..." />
                </div>
                
                <div>
                    <SectionHeader icon={<PhotoIcon />} title="Linked Photos" />
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {localRecording.photoIds.map(id => {
                            const photo = photos.find(p => p.id === id);
                            return photo ? <PhotoThumbnail key={id} photo={photo} onSelect={() => {}} onDelete={handleUnlinkPhoto} /> : null;
                        })}
                        <button onClick={() => setIsCameraOpen(true)} className="aspect-square border-2 border-dashed border-[var(--theme-border)] rounded-md flex items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg)]">
                            <CameraIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
};

export const RecordingManager: React.FC<RecordingManagerProps> = ({ 
    recordings, onSave, onUpdate, onDelete, photos, onSavePhoto, siteSettings 
}) => {
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const { isRecording, isPaused, recordingTime, audioBlob, startRecording, stopRecording, pauseRecording, resumeRecording, analyserNode, setAudioBlob } = useRecorder();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);

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
        if (window.confirm("Are you sure you want to delete this recording?")) {
            await onDelete(id);
            setSelectedRecording(null);
        }
    }, [onDelete]);
    
    const handleTranscribe = useCallback(async (recording: Recording) => {
        const recordingToUpdate = { ...recording, isTranscribing: true };
        onUpdate(recordingToUpdate);
        setSelectedRecording(recordingToUpdate);
        try {
            const transcript = await transcribeAudio(recording.audioBlob, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey);
            const finalUpdate = { ...recording, transcript, isTranscribing: false };
            await onUpdate(finalUpdate);
            setSelectedRecording(finalUpdate);
        } catch (error) {
            console.error("Transcription failed:", error);
            alert(`Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            const errorUpdate = { ...recording, isTranscribing: false };
            await onUpdate(errorUpdate);
            setSelectedRecording(errorUpdate);
        }
    }, [onUpdate, siteSettings]);

    const filteredRecordings = useMemo(() => {
        return recordings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.transcript && r.transcript.toLowerCase().includes(searchTerm.toLowerCase())) ||
            r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [recordings, searchTerm]);
    
    const handleFabClick = () => {
        if (!showRecorder) {
            setShowRecorder(true);
            startRecording();
        } else {
            stopRecording();
        }
    };
    

    return (
        <div className="flex flex-col flex-1 bg-transparent backdrop-blur-2xl overflow-hidden relative">
            <div className="flex-grow flex relative overflow-hidden">
                <aside className={`w-full lg:w-1/3 lg:max-w-sm h-full flex flex-col border-r-0 lg:border-r border-[var(--theme-border)] flex-shrink-0 transition-transform duration-300 ease-in-out ${selectedRecording ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}>
                    <div className="p-4 border-b border-[var(--theme-border)] flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Search recordings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-md pl-10 pr-4 py-2" />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-grow pb-24 no-scrollbar">
                        {filteredRecordings.length > 0 ? (
                             <ul className="divide-y divide-[var(--theme-border)]">
                                {filteredRecordings.map(rec => (
                                    <li key={rec.id}>
                                        <button onClick={() => setSelectedRecording(rec)} className={`w-full text-left p-4 transition-colors flex justify-between items-center ${selectedRecording?.id === rec.id ? 'bg-[var(--theme-card-bg)]' : 'hover:bg-[var(--theme-card-bg)]/50'}`}>
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[var(--theme-bg)] rounded-lg text-[var(--theme-orange)]"><WaveformIcon /></div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold truncate">{rec.name}</h3>
                                                    <p className="text-sm text-[var(--theme-text-secondary)]">{new Date(rec.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <ChevronRightIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]"><MicIcon className="h-12 w-12 mb-4" /><h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">Your recordings will appear here</h3><p className="text-sm mt-1">Tap the plus button to capture your first voice note.</p></div>
                        )}
                    </div>
                </aside>
                
                <main className={`absolute inset-0 lg:static flex flex-1 h-full flex-col bg-[var(--theme-card-bg)] transition-transform duration-300 ease-in-out z-10 ${selectedRecording ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                    {selectedRecording ? (
                        <>
                            <header className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <button onClick={() => setSelectedRecording(null)} className="lg:hidden p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white"><ChevronLeftIcon /></button>
                                    <input type="text" value={selectedRecording.name} onChange={(e) => setSelectedRecording(p => p ? {...p, name: e.target.value} : null)} onBlur={() => onUpdate(selectedRecording)} className="text-lg lg:text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-orange)] focus:outline-none w-full mr-4 truncate" />
                                </div>
                                <button onClick={() => handleDeleteRecording(selectedRecording.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
                            </header>
                            <div className="flex-1 overflow-y-auto">
                                <RecordingDetailView recording={selectedRecording} onUpdate={onUpdate} onTranscribe={handleTranscribe} photos={photos} onSavePhoto={onSavePhoto} />
                            </div>
                        </>
                    ) : (
                         <div className="hidden lg:flex w-full h-full items-center justify-center text-center text-[var(--theme-text-secondary)] p-8">
                             <div><MicIcon className="h-12 w-12 mx-auto" /><p className="mt-4 text-lg">Select a recording to view details.</p></div>
                         </div>
                    )}
                </main>
            </div>
            
            <div className="fixed bottom-20 right-4 z-30 lg:bottom-4">
                 {showRecorder && (
                    <div className="p-4 bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-lg shadow-2xl w-80 mb-4 animate-fade-in-down">
                         <div className="flex items-center gap-4">
                            <div className="flex-1 h-16 bg-[var(--theme-bg)] rounded-md overflow-hidden">
                                {isRecording || isPaused ? <LiveWaveform analyserNode={analyserNode} isPaused={isPaused} /> : audioBlob ? <WaveformPlayer audioBlob={audioBlob} /> : <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Ready...</div>}
                            </div>
                            <div className="flex flex-col gap-2 items-center">
                                <span className="font-mono text-lg text-center">{formatTime(recordingTime)}</span>
                                {isRecording || isPaused ? (
                                    <div className="flex gap-2">
                                        <button onClick={isPaused ? resumeRecording : pauseRecording} className="p-2 bg-amber-500 text-black rounded-full">
                                            {isPaused ? <PlayIcon /> : <PauseIcon />}
                                        </button>
                                        <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full">
                                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                                        </button>
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
                <button onClick={handleFabClick} className={`${isRecording || isPaused ? 'bg-red-500' : 'bg-[var(--theme-orange)]'} text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all hover:scale-110 active:scale-95`}>
                    <PlusIcon className={`w-8 h-8 transition-transform duration-300 ${isRecording || isPaused ? 'rotate-45' : ''}`} />
                </button>
            </div>
        </div>
    );
};