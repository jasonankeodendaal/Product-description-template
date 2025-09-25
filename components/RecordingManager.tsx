
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
import { Spinner } from './icons/Spinner';
import { XIcon } from './icons/XIcon';
import { TranscriptIcon } from './icons/TranscriptIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';

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

    // FIX: Imported useEffect from React to fix 'Cannot find name' error.
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
    const { isRecording, recordingTime, audioBlob, startRecording, stopRecording, analyserNode, setAudioBlob } = useRecorder();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDetailModalClosing, setIsDetailModalClosing] = useState(false);

    const handleSaveRecording = useCallback(async () => {
        if (!audioBlob) return;
        setIsSaving(true);
        const newRecording: Recording = { id: crypto.randomUUID(), name: `Recording ${new Date().toLocaleString()}`, date: new Date().toISOString(), transcript: '', notes: '', audioBlob, tags: [], photoIds: [] };
        const savedRecording = await onSave(newRecording);
        setSelectedRecording(savedRecording);
        setIsSaving(false);
        setAudioBlob(null);
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
        return recordings.filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.transcript && r.transcript.toLowerCase().includes(searchTerm.toLowerCase())) ||
            r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [recordings, searchTerm]);
    
    const closeDetailModal = () => {
        setIsDetailModalClosing(true);
        setTimeout(() => {
            setSelectedRecording(null);
            setIsDetailModalClosing(false);
        }, 300);
    };

    return (
        <div className="flex flex-col flex-1 bg-transparent backdrop-blur-2xl">
            {/* Mobile Detail Modal */}
            {selectedRecording && (
                 <div className={`fixed inset-0 bg-black/70 z-50 flex flex-col justify-end lg:hidden ${isDetailModalClosing ? 'recording-detail-modal-out' : 'recording-detail-modal-in'}`}>
                    <div className="flex-1" onClick={closeDetailModal}></div>
                    <div className="bg-[var(--theme-card-bg)] rounded-t-2xl flex flex-col h-[85vh]">
                        <header className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 flex items-center justify-between">
                            <input type="text" value={selectedRecording.name} onChange={(e) => setSelectedRecording(p => p ? {...p, name: e.target.value} : null)} onBlur={() => onUpdate(selectedRecording)} className="text-lg font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-orange)] focus:outline-none w-full mr-4 truncate" />
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleDeleteRecording(selectedRecording.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
                                <button onClick={closeDetailModal} className="p-2 text-[var(--theme-text-secondary)] hover:text-white"><XIcon /></button>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto">
                            <RecordingDetailView recording={selectedRecording} onUpdate={onUpdate} onTranscribe={handleTranscribe} photos={photos} onSavePhoto={onSavePhoto} />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-grow flex overflow-hidden">
                <aside className="w-full lg:w-1/3 lg:max-w-sm h-full flex flex-col border-r-0 lg:border-r border-[var(--theme-border)]">
                    <div className="p-4 border-b border-[var(--theme-border)] flex-shrink-0">
                        <h2 className="text-xl font-bold">Recordings</h2>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Search recordings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[var(--theme-card-bg)] border border-[var(--theme-border)] rounded-md pl-10 pr-4 py-2" />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        {filteredRecordings.length > 0 ? (
                             <ul className="divide-y divide-[var(--theme-border)]">
                                {filteredRecordings.map(rec => (
                                    <li key={rec.id}><button onClick={() => setSelectedRecording(rec)} className="w-full text-left p-4 hover:bg-[var(--theme-card-bg)] transition-colors"><h3 className="font-semibold truncate">{rec.name}</h3><p className="text-sm text-[var(--theme-text-secondary)]">{new Date(rec.date).toLocaleDateString()}</p></button></li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center p-4 text-[var(--theme-text-secondary)]"><MicIcon className="h-12 w-12 mb-4" /><h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">Your recordings will appear here</h3><p className="text-sm mt-1">Use the recorder below to capture your first voice note.</p></div>
                        )}
                    </div>
                </aside>

                <main className="hidden lg:flex flex-1 h-full flex-col overflow-y-auto">
                    {selectedRecording ? (
                        <>
                            <header className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 flex items-center justify-between">
                                <input type="text" value={selectedRecording.name} onChange={(e) => setSelectedRecording(p => p ? {...p, name: e.target.value} : null)} onBlur={() => onUpdate(selectedRecording)} className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-[var(--theme-orange)] focus:outline-none w-full mr-4 truncate" />
                                <button onClick={() => handleDeleteRecording(selectedRecording.id)} className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-red)]"><TrashIcon /></button>
                            </header>
                            <div className="flex-1 overflow-y-auto">
                                <RecordingDetailView recording={selectedRecording} onUpdate={onUpdate} onTranscribe={handleTranscribe} photos={photos} onSavePhoto={onSavePhoto} />
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-[var(--theme-text-secondary)] h-full flex flex-col justify-center items-center"><MicIcon className="h-12 w-12" /><p className="mt-4 text-lg">Select a recording to view details.</p></div>
                    )}
                </main>
            </div>
            
            <footer className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-dark-bg)]/50 flex-shrink-0 mb-16 lg:mb-0">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-16 bg-[var(--theme-card-bg)] rounded-md overflow-hidden">
                        {isRecording && <LiveWaveform analyserNode={analyserNode} />}
                        {!isRecording && audioBlob && <WaveformPlayer audioBlob={audioBlob} />}
                    </div>
                    {isRecording ? (
                        <button onClick={stopRecording} className="p-4 bg-red-500 text-white rounded-full shadow-lg transform transition-transform hover:scale-110"><MicIcon /></button>
                    ) : (
                        <button onClick={startRecording} className="p-4 bg-[var(--theme-orange)] text-black rounded-full shadow-lg transform transition-transform hover:scale-110"><MicIcon /></button>
                    )}
                    <span className="font-mono text-lg w-20">{formatTime(recordingTime)}</span>
                    <button onClick={handleSaveRecording} disabled={!audioBlob || isSaving} className="ml-auto bg-[var(--theme-orange)] text-black font-bold py-2 px-4 rounded-md flex items-center gap-2 disabled:bg-[var(--theme-border)]">
                        <SaveIcon />
                        <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save Recording'}</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};