import React, { useState, useCallback, useMemo } from 'react';
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

interface RecordingManagerProps {
    recordings: Recording[];
    onSave: (recording: Recording) => Promise<void>;
    onUpdate: (recording: Recording) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    siteSettings: SiteSettings;
}

export const RecordingManager: React.FC<RecordingManagerProps> = ({ 
    recordings, onSave, onUpdate, onDelete, photos, onSavePhoto, siteSettings 
}) => {
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const { isRecording, isPaused, recordingTime, audioBlob, startRecording, stopRecording, pauseRecording, resumeRecording, analyserNode } = useRecorder();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleSaveRecording = useCallback(async () => {
        if (!audioBlob) return;
        setIsSaving(true);
        const newRecording: Recording = {
            id: crypto.randomUUID(),
            name: `Recording ${new Date().toLocaleString()}`,
            date: new Date().toISOString(),
            transcript: '',
            notes: '',
            audioBlob,
            tags: [],
            photoIds: [],
        };
        await onSave(newRecording);
        setSelectedRecording(newRecording);
        setIsSaving(false);
    }, [audioBlob, onSave]);

    const handleDeleteRecording = useCallback(async (id: string) => {
        if (window.confirm("Are you sure you want to delete this recording?")) {
            await onDelete(id);
            setSelectedRecording(null); // Return to list view on mobile, or placeholder on desktop
        }
    }, [onDelete]);
    
    const handleTranscribe = useCallback(async (recording: Recording) => {
        const recordingToUpdate = { ...recording, isTranscribing: true };
        setSelectedRecording(recordingToUpdate);
        await onUpdate(recordingToUpdate);
        try {
            const transcript = await transcribeAudio(recording.audioBlob, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey);
            const finalUpdate = { ...recording, transcript, isTranscribing: false };
            setSelectedRecording(finalUpdate);
            await onUpdate(finalUpdate);
        } catch (error) {
            console.error("Transcription failed:", error);
            alert(`Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            const errorUpdate = { ...recording, isTranscribing: false };
            setSelectedRecording(errorUpdate);
            await onUpdate(errorUpdate);
        }
    }, [onUpdate, siteSettings]);

    const filteredRecordings = useMemo(() => {
        return recordings.filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.transcript && r.transcript.toLowerCase().includes(searchTerm.toLowerCase())) ||
            r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [recordings, searchTerm]);

    const handleUpdateField = (field: keyof Recording, value: any) => {
        if (selectedRecording) {
            const updatedRecording = { ...selectedRecording, [field]: value };
            setSelectedRecording(updatedRecording);
            onUpdate(updatedRecording);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-[var(--theme-bg)]">
            {isCameraOpen && selectedRecording && (
                <CameraCapture 
                    onClose={() => setIsCameraOpen(false)}
                    onCapture={async (dataUrl) => {
                       const newPhoto: Photo = {
                           id: crypto.randomUUID(),
                           name: `Photo for ${selectedRecording.name}`,
                           notes: '',
                           date: new Date().toISOString(),
                           folder: `recordings/${selectedRecording.id}`,
                           imageBlob: dataURLtoBlob(dataUrl),
                           imageMimeType: 'image/jpeg',
                           tags: [selectedRecording.name, 'recording-asset']
                       };
                       await onSavePhoto(newPhoto);
                       handleUpdateField('photoIds', [...selectedRecording.photoIds, newPhoto.id]);
                       setIsCameraOpen(false);
                    }}
                />
            )}

            <div className="flex-grow flex overflow-hidden">
                {/* List View */}
                <aside className={`
                    ${selectedRecording ? 'hidden' : 'flex'} lg:flex 
                    w-full lg:w-1/3 lg:max-w-sm h-full flex-col border-r-0 lg:border-r border-[var(--theme-border)]
                `}>
                    <div className="p-4 border-b border-[var(--theme-border)] flex-shrink-0">
                        <h2 className="text-xl font-bold">Recordings</h2>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search recordings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-md pl-10 pr-4 py-2"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        {filteredRecordings.length > 0 ? (
                             <ul className="divide-y divide-[var(--theme-border)]">
                                {filteredRecordings.map(rec => (
                                    <li key={rec.id}>
                                        <button 
                                            onClick={() => setSelectedRecording(rec)}
                                            className={`w-full text-left p-4 hover:bg-[var(--theme-card-bg)] transition-colors`}
                                        >
                                            <h3 className="font-semibold truncate">{rec.name}</h3>
                                            <p className="text-sm text-[var(--theme-text-secondary)]">{new Date(rec.date).toLocaleDateString()}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]">
                                <MicIcon className="h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">Your recordings will appear here</h3>
                                <p className="text-sm mt-1">Use the recorder below to capture your first voice note.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Detail View */}
                <main className={`
                    ${selectedRecording ? 'flex' : 'hidden'} lg:flex
                    flex-1 h-full flex-col overflow-y-auto
                `}>
                    <div className="p-6">
                        {selectedRecording ? (
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                         <button onClick={() => setSelectedRecording(null)} className="lg:hidden p-2 -ml-2 text-[var(--theme-text-secondary)] hover:text-white flex-shrink-0">
                                            <ChevronLeftIcon />
                                        </button>
                                        <input 
                                            type="text"
                                            value={selectedRecording.name}
                                            onChange={(e) => handleUpdateField('name', e.target.value)}
                                            className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-green)] focus:outline-none w-full mr-4 truncate"
                                        />
                                    </div>
                                    <button onClick={() => handleDeleteRecording(selectedRecording.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)] flex-shrink-0 ml-2"><TrashIcon /></button>
                                </div>
                                <p className="text-sm text-[var(--theme-text-secondary)] mt-1 ml-0 lg:ml-10">{new Date(selectedRecording.date).toLocaleString()}</p>
                                
                                <div className="mt-6 bg-white/5 p-4 rounded-lg">
                                    <WaveformPlayer audioBlob={selectedRecording.audioBlob} />
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                                    {selectedRecording.transcript ? (
                                        <textarea 
                                            value={selectedRecording.transcript}
                                            onChange={(e) => handleUpdateField('transcript', e.target.value)}
                                            className="w-full h-40 bg-[var(--theme-card-bg)] p-3 rounded-md border border-[var(--theme-border)] resize-y"
                                            placeholder="Transcript appears here..."
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => handleTranscribe(selectedRecording)}
                                            disabled={selectedRecording.isTranscribing}
                                            className="bg-[var(--theme-green)] text-black font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed"
                                        >
                                            {selectedRecording.isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
                                        </button>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                                    <textarea 
                                        value={selectedRecording.notes}
                                        onChange={(e) => handleUpdateField('notes', e.target.value)}
                                        className="w-full h-32 bg-[var(--theme-card-bg)] p-3 rounded-md border border-[var(--theme-border)] resize-y"
                                        placeholder="Add your notes here..."
                                    />
                                </div>
                                
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Linked Photos</h3>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {selectedRecording.photoIds.map(id => {
                                            const photo = photos.find(p => p.id === id);
                                            return photo ? <PhotoThumbnail key={id} photo={photo} onSelect={() => {}} /> : null;
                                        })}
                                        <button onClick={() => setIsCameraOpen(true)} className="aspect-square border-2 border-dashed border-[var(--theme-border)] rounded-md flex items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]">
                                            <CameraIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex text-center text-[var(--theme-text-secondary)] h-full flex-col justify-center items-center">
                                <MicIcon className="h-12 w-12" />
                                <p className="mt-4 text-lg">Select a recording to view details.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            <footer className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/50 flex-shrink-0 mb-16 lg:mb-0">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-16 bg-[var(--theme-card-bg)] rounded-md overflow-hidden">
                        {isRecording && <LiveWaveform analyserNode={analyserNode} isPaused={isPaused} />}
                    </div>
                    {isRecording ? (
                        <>
                            <button onClick={isPaused ? resumeRecording : pauseRecording} className="p-3 bg-yellow-500 text-black rounded-full text-sm font-semibold">{isPaused ? 'Resume' : 'Pause'}</button>
                            <button onClick={stopRecording} className="p-3 bg-red-500 text-white rounded-full text-sm font-semibold">Stop</button>
                        </>
                    ) : (
                        <button onClick={startRecording} className="p-4 bg-[var(--theme-green)] text-black rounded-full"><MicIcon /></button>
                    )}
                    <span className="font-mono text-lg w-20">{formatTime(recordingTime)}</span>
                        <button 
                        onClick={handleSaveRecording}
                        disabled={!audioBlob || isSaving}
                        className="ml-auto bg-[var(--theme-green)] text-black font-bold py-2 px-4 rounded-md flex items-center gap-2 disabled:bg-[var(--theme-border)]"
                        >
                            <SaveIcon />
                            <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save Recording'}</span>
                        </button>
                </div>
            </footer>
        </div>
    );
};