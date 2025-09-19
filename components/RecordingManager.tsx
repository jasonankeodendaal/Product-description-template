import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Recording } from '../App';
import { XIcon } from './icons/XIcon';
import { MicIcon } from './icons/MicIcon';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { useRecorder } from '../hooks/useRecorder';
import { formatTime } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import { resizeImage } from '../utils/imageUtils';
import { CameraCapture } from './CameraCapture';
import { WaveformPlayer } from './WaveformPlayer';
import { DownloadIcon } from './icons/DownloadIcon';


interface RecordingManagerProps {
  onClose: () => void;
  recordings: Recording[];
  onSave: (recording: Recording) => Promise<void>;
  onUpdate: (recording: Recording) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTranscribe: (id: string) => Promise<void>;
}

export const RecordingManager: React.FC<RecordingManagerProps> = ({
  onClose,
  recordings,
  onSave,
  onUpdate,
  onDelete,
  onTranscribe
}) => {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'date' | 'name'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [formState, setFormState] = useState<{
    name: string;
    notes: string;
    tags: string;
    images: { id: string; dataUrl: string; }[];
  }>({ name: '', notes: '', tags: '', images: [] });
  
  const { isRecording, recordingTime, audioBlob, startRecording, stopRecording } = useRecorder();
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAndSortedRecordings = useMemo(() => {
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    const filtered = recordings.filter(rec => 
        rec.name.toLowerCase().includes(lowercasedQuery) ||
        rec.notes.toLowerCase().includes(lowercasedQuery) ||
        rec.transcript?.toLowerCase().includes(lowercasedQuery) ||
        rec.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery))
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
      setFormState({ 
        name: selectedRecording.name, 
        notes: selectedRecording.notes,
        tags: (selectedRecording.tags || []).join(', '),
        images: selectedRecording.images || []
      });
      setIsEditing(true);
    } else {
      setFormState({ name: '', notes: '', tags: '', images: [] });
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
        tags: '',
        images: []
      });
    }
  }, [audioBlob]);
  
  const handleSave = async () => {
    const blobToSave = selectedRecording?.audioBlob || audioBlob;
    if (!blobToSave) return;

    const finalTags = formState.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (isEditing && selectedRecording) {
      const updatedRecording: Recording = { 
          ...selectedRecording, 
          name: formState.name,
          notes: formState.notes,
          tags: finalTags,
          images: formState.images,
      };
      await onUpdate(updatedRecording);
      setSelectedRecording(updatedRecording);
    } else {
      const newRecording: Recording = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        name: formState.name.trim() || 'Untitled Recording',
        notes: formState.notes,
        audioBlob: blobToSave,
        duration: recordingTime,
        tags: finalTags,
        images: formState.images,
      };
      await onSave(newRecording);
      setFormState({ name: '', notes: '', tags: '', images: []});
    }
  };
  
  const handleDelete = async () => {
    if (!selectedRecording) return;
    if (window.confirm(`Are you sure you want to delete "${selectedRecording.name}"?`)) {
      await onDelete(selectedRecording.id);
      setSelectedRecording(null);
    }
  };

  const handleDownloadRecording = useCallback(() => {
    if (!selectedRecording) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(selectedRecording.audioBlob);
    const sanitizedName = selectedRecording.name.replace(/[^a-z0-9_.-]/gi, '_').trim() || 'recording';
    link.download = `${sanitizedName}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [selectedRecording]);

  const handleAttachmentsUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const resizedDataUrl = await resizeImage(file);
        setFormState(s => ({
          ...s,
          images: [...s.images, { id: crypto.randomUUID(), dataUrl: resizedDataUrl }]
        }));
      } catch (error) {
        console.error("Failed to process image:", error);
        alert("Failed to process an image. It might be corrupted or in an unsupported format.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleCameraCapture = (dataUrl: string) => {
    setFormState(s => ({
      ...s,
      images: [...s.images, { id: crypto.randomUUID(), dataUrl }]
    }));
    setIsCameraOpen(false);
  };

  const handleRemoveImage = (idToRemove: string) => {
    setFormState(s => ({
      ...s,
      images: s.images.filter(img => img.id !== idToRemove)
    }));
  };

  const tags = useMemo(() => formState.tags.split(',').map(t => t.trim()).filter(Boolean), [formState.tags]);

  return (
    <>
    {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4" aria-modal="true" role="dialog">
      <div className="bg-[var(--theme-card-bg)] w-full h-full md:max-w-4xl md:h-[90vh] rounded-none md:rounded-lg shadow-xl border-t md:border border-[var(--theme-border)] flex flex-col">
        <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-yellow)]">Recording Manager</h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">Record, tag, and attach images to your audio notes.</p>
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
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'date' | 'name')} className="bg-[var(--theme-text-primary)] text-sm rounded p-1 border border-[var(--theme-border)] text-[var(--theme-dark-bg)]">
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
               <input type="search" placeholder="Search recordings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md py-2 px-3 text-sm text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"/>
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
                                <WaveformPlayer audioBlob={selectedRecording?.audioBlob || audioBlob} />
                                <div>
                                    <label htmlFor="rec-name" className="text-sm text-[var(--theme-text-secondary)]">Name</label>
                                    <input id="rec-name" type="text" value={formState.name} onChange={e => setFormState(s => ({...s, name: e.target.value}))} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"/>
                                </div>
                                 <div>
                                    <label htmlFor="rec-tags" className="text-sm text-[var(--theme-text-secondary)]">Tags (comma-separated)</label>
                                    <input id="rec-tags" type="text" value={formState.tags} onChange={e => setFormState(s => ({...s, tags: e.target.value}))} placeholder="e.g. idea, new-product, draft" className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"/>
                                     {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {tags.map(tag => <span key={tag} className="bg-[var(--theme-blue)]/20 text-[var(--theme-blue)] text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                                        </div>
                                     )}
                                </div>
                                <div>
                                    <label htmlFor="rec-notes" className="text-sm text-[var(--theme-text-secondary)]">Notes</label>
                                    <textarea id="rec-notes" value={formState.notes} onChange={e => setFormState(s => ({...s, notes: e.target.value}))} rows={3} className="w-full bg-[var(--theme-text-primary)] border border-[var(--theme-border)] rounded-md p-2 mt-1 resize-y text-[var(--theme-dark-bg)] placeholder:text-[var(--theme-dark-bg)]/60 focus:ring-1 focus:ring-[var(--theme-yellow)]"></textarea>
                                </div>
                                
                                 <div>
                                    <label className="text-sm text-[var(--theme-text-secondary)]">Attachments</label>
                                     <div className="mt-2 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                        {formState.images.map(img => (
                                            <div key={img.id} className="relative aspect-square bg-[var(--theme-bg)] rounded-md overflow-hidden group">
                                                <img src={img.dataUrl} alt="attachment" className="w-full h-full object-cover" />
                                                <button onClick={() => handleRemoveImage(img.id)} className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <XIcon />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                         <input type="file" ref={fileInputRef} className="sr-only" onChange={(e) => handleAttachmentsUpload(e.target.files)} accept="image/*" multiple/>
                                         <button onClick={() => fileInputRef.current?.click()} className="text-sm flex items-center gap-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-dark-bg)] text-[var(--theme-text-secondary)] font-semibold py-1.5 px-3 rounded-md">
                                            <UploadIcon /> Upload
                                         </button>
                                          <button onClick={() => setIsCameraOpen(true)} className="text-sm flex items-center gap-2 bg-[var(--theme-bg)] hover:bg-[var(--theme-dark-bg)] text-[var(--theme-text-secondary)] font-semibold py-1.5 px-3 rounded-md">
                                            <CameraIcon /> Camera
                                         </button>
                                    </div>
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
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleDelete} className="text-[var(--theme-red)] hover:underline flex items-center gap-2 p-2">
                                            <TrashIcon /> Delete
                                        </button>
                                        <button onClick={handleDownloadRecording} className="text-[var(--theme-text-secondary)] hover:text-white flex items-center gap-2 p-2" aria-label="Download Recording">
                                            <DownloadIcon /> Download
                                        </button>
                                    </div>
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
    </>
  );
};