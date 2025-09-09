import React, { useState, useEffect, useMemo } from 'react';
import { Recording } from '../App';
import { XIcon } from './icons/XIcon';
import { MicIcon } from './icons/MicIcon';
import { SaveIcon } from './icons/SaveIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useRecorder } from '../hooks/useRecorder';
import { formatTime } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';

interface RecordingManagerProps {
  onClose: () => void;
  recordings: Recording[];
  onSave: (recording: Omit<Recording, 'transcript' | 'isTranscribing'>) => Promise<void>;
  onUpdate: (recording: Recording) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  directoryHandle: FileSystemDirectoryHandle | null;
  onTranscribe: (id: string) => Promise<void>;
}

export const RecordingManager: React.FC<RecordingManagerProps> = ({
  onClose,
  recordings,
  onSave,
  onUpdate,
  onDelete,
  directoryHandle,
  onTranscribe
}) => {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'date' | 'name'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [formState, setFormState] = useState({ name: '', notes: '' });
  const { isRecording, recordingTime, audioBlob, startRecording, stopRecording } = useRecorder();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  const filteredAndSortedRecordings = useMemo(() => {
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    const filtered = recordings.filter(rec => 
        rec.name.toLowerCase().includes(lowercasedQuery) ||
        rec.notes.toLowerCase().includes(lowercasedQuery) ||
        rec.transcript?.toLowerCase().includes(lowercasedQuery)
    );

    return filtered.sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [recordings, sortOrder, debouncedSearchQuery]);

  useEffect(() => {
    if (selectedRecording) {
      setFormState({ name: selectedRecording.name, notes: selectedRecording.notes });
      setIsEditing(true);
    } else {
      setFormState({ name: '', notes: '' });
      setIsEditing(false);
    }
  }, [selectedRecording]);

  useEffect(() => {
    if (audioBlob) {
      setIsEditing(false);
      setSelectedRecording(null);
      const now = new Date();
      setFormState({
        name: `Recording ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        notes: '',
      });
    }
  }, [audioBlob]);
  
  const handleSave = async () => {
    const blobToSave = selectedRecording?.audioBlob || audioBlob;
    if (!blobToSave) return;

    if (isEditing && selectedRecording) {
      const updatedRecording = { ...selectedRecording, ...formState };
      await onUpdate(updatedRecording);
      setSelectedRecording(updatedRecording);
    } else {
      const newRecording = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        name: formState.name.trim() || 'Untitled Recording',
        notes: formState.notes,
        audioBlob: blobToSave,
        duration: recordingTime,
      };
      await onSave(newRecording);
      setFormState({ name: '', notes: ''});
    }
  };
  
  const togglePlay = () => {
      const currentBlob = selectedRecording?.audioBlob || audioBlob;
      if (!currentBlob) return;

      if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
          audioPlayerRef.current.pause();
          return;
      }
      
      const player = new Audio(URL.createObjectURL(currentBlob));
      audioPlayerRef.current = player;
      player.play();
      player.onplay = () => setIsPlaying(true);
      player.onpause = () => setIsPlaying(false);
      player.onended = () => setIsPlaying(false);
  };
  
  // Cleanup audio player
  useEffect(() => {
    return () => {
        audioPlayerRef.current?.pause();
    }
  }, []);

  const handleDelete = async () => {
    if (!selectedRecording) return;
    if (window.confirm(`Are you sure you want to delete "${selectedRecording.name}"?`)) {
      await onDelete(selectedRecording.id);
      setSelectedRecording(null);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full h-full md:max-w-4xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Recording Manager</h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">Record, search, and transcribe your audio notes.</p>
          </div>
          <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close">
            <XIcon />
          </button>
        </header>

        <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Recordings List */}
          <div className="w-full md:w-1/3 border-b md:border-r md:border-b-0 border-[var(--theme-border)] flex flex-col h-1/3 md:h-full flex-shrink-0">
            <div className="p-4 border-b border-[var(--theme-border)] flex-shrink-0 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Recordings ({recordings.length})</h3>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'date' | 'name')} className="bg-[var(--theme-bg)] text-sm rounded p-1 border border-[var(--theme-border)]">
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
               <input
                    type="search"
                    placeholder="Search recordings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[var(--theme-yellow)]"
                />
            </div>
            <ul className="overflow-y-auto flex-grow p-2">
              {filteredAndSortedRecordings.map(rec => (
                <li key={rec.id}>
                  <button onClick={() => setSelectedRecording(rec)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedRecording?.id === rec.id ? 'bg-[var(--theme-blue)]/20' : 'hover:bg-[var(--theme-bg)]/50'}`}>
                    <p className="font-medium text-[var(--theme-text-primary)] truncate">{rec.name}</p>
                    <p className="text-xs text-[var(--theme-text-secondary)]">{new Date(rec.date).toLocaleString()} - {formatTime(rec.duration)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Details / Recording Panel */}
          <div className="w-full md:w-2/3 p-6 flex flex-col overflow-y-auto">
              {isRecording ? (
                  <div className="text-center flex-grow flex flex-col items-center justify-center">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[var(--theme-red)]/30 rounded-full animate-pulse"></div>
                        <MicIcon className="h-10 w-10 text-[var(--theme-red)]" />
                    </div>
                    <p className="text-2xl font-mono mt-4">{formatTime(recordingTime)}</p>
                    <button onClick={stopRecording} className="mt-6 bg-[var(--theme-red)] hover:opacity-90 text-white font-bold py-2 px-6 rounded-full">Stop</button>
                  </div>
              ) : (
                  <>
                    {(selectedRecording || audioBlob) ? (
                        <div className="w-full h-full flex flex-col">
                             <div className="flex-grow space-y-4 pr-2">
                                <div>
                                    <label htmlFor="rec-name" className="text-sm text-[var(--theme-text-secondary)]">Name</label>
                                    <input id="rec-name" type="text" value={formState.name} onChange={e => setFormState(s => ({...s, name: e.target.value}))} className="w-full bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] rounded-md p-2 mt-1 focus:ring-1 focus:ring-[var(--theme-yellow)]"/>
                                </div>
                                <div>
                                    <label htmlFor="rec-notes" className="text-sm text-[var(--theme-text-secondary)]">Notes</label>
                                    <textarea id="rec-notes" value={formState.notes} onChange={e => setFormState(s => ({...s, notes: e.target.value}))} rows={3} className="w-full bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] rounded-md p-2 mt-1 resize-y focus:ring-1 focus:ring-[var(--theme-yellow)]"></textarea>
                                </div>
                                 <div className="flex items-center gap-4 bg-[var(--theme-bg)]/50 p-3 rounded-md">
                                    <button onClick={togglePlay} className="p-2 bg-[var(--theme-blue)] rounded-full text-white hover:opacity-90 flex-shrink-0">
                                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </button>
                                    <p className="text-sm text-[var(--theme-text-secondary)]">Duration: {formatTime(selectedRecording?.duration || recordingTime)}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--theme-text-secondary)] flex items-center gap-2">
                                        AI Transcript
                                        {selectedRecording?.isTranscribing && <div className="w-3 h-3 bg-[var(--theme-yellow)] rounded-full animate-pulse"></div>}
                                    </label>
                                    <div className="w-full bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] rounded-md p-3 mt-1 min-h-[120px] text-sm text-[var(--theme-text-primary)]">
                                        {selectedRecording?.isTranscribing ? "Transcription in progress..." : (selectedRecording?.transcript || <span className="text-[var(--theme-text-secondary)]/50">No transcript available.</span>)}
                                    </div>
                                    {selectedRecording && !selectedRecording.transcript && !selectedRecording.isTranscribing && (
                                        <button onClick={() => onTranscribe(selectedRecording.id)} className="text-sm mt-2 flex items-center gap-2 text-[var(--theme-yellow)] hover:underline">
                                            <SparklesIcon /> Transcribe Audio
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-auto pt-4 flex justify-between items-center flex-shrink-0">
                                {isEditing && selectedRecording ? (
                                    <button onClick={handleDelete} className="text-[var(--theme-red)] hover:underline flex items-center gap-2 p-2">
                                        <TrashIcon /> Delete
                                    </button>
                                ) : <div />}
                                <button onClick={handleSave} style={{backgroundColor: 'var(--theme-green)'}} className="text-white font-bold py-2 px-4 rounded-md hover:opacity-90 flex items-center gap-2">
                                    <SaveIcon /> {isEditing ? 'Save Changes' : 'Save Recording'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center flex-grow flex flex-col items-center justify-center">
                             <button onClick={startRecording} style={{backgroundColor: 'var(--theme-blue)'}} className="hover:opacity-90 text-white font-bold py-3 px-5 rounded-full flex items-center gap-2">
                                <MicIcon /> Start Recording
                            </button>
                            <p className="mt-4 text-[var(--theme-text-secondary)]/70">Or select a recording from the list.</p>
                        </div>
                    )}
                  </>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};