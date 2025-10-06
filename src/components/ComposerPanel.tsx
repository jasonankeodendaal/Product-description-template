import React, { useState, useRef, useEffect } from 'react';
import { InputPanel } from './InputPanel';
import type { Template, Recording, Note, Photo } from '../types';
import { SiteSettings } from '../constants';
import { describeImage } from '../services/geminiService';
import { PhotoThumbnail } from './PhotoThumbnail';
import { Spinner } from './icons/Spinner';
import { VideoIcon } from './icons/VideoIcon';
import { dataURLtoBlob } from '../utils/dataUtils';
import { XIcon } from './icons/XIcon';

interface ComposerPanelProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onGenerate: () => void;
    isLoading: boolean;
    templates: Template[];
    selectedTemplateId: string;
    onTemplateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    tone: string;
    onToneChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    recordings: Recording[];
    notes: Note[];
    photos: Photo[];
    siteSettings: SiteSettings;
    onAddToInput: (text: string) => void;
    onDeletePhoto: (photo: Photo) => Promise<void>;
    onClear: () => void;
}

type AssetTab = 'recordings' | 'notes' | 'photos' | 'videos';

const VideoFrameExtractorModal: React.FC<{
    videoFile: File;
    onClose: () => void;
    onCapture: (dataUrl: string) => void;
}> = ({ videoFile, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        const url = URL.createObjectURL(videoFile);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    const handleCaptureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--theme-card-bg)] w-full max-w-2xl rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">Capture Frame from Video</h3>
                    <button onClick={onClose} className="text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-primary)]" aria-label="Close"><XIcon /></button>
                </header>
                <div className="p-6 flex-grow">
                    {videoUrl && <video ref={videoRef} src={videoUrl} controls className="w-full max-h-[60vh] rounded-md" />}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <footer className="p-4 bg-black/20 border-t border-[var(--theme-border)] flex justify-end">
                    <button onClick={handleCaptureFrame} className="bg-[var(--theme-orange)] text-black font-bold py-2 px-6 rounded-md hover:opacity-90">
                        Capture & Use Frame
                    </button>
                </footer>
            </div>
        </div>
    );
};

export const ComposerPanel: React.FC<ComposerPanelProps> = ({
    value, onChange, onGenerate, isLoading, templates, selectedTemplateId,
    onTemplateChange, tone, onToneChange, recordings, notes, photos,
    siteSettings, onAddToInput, onDeletePhoto, onClear
}) => {
    const [activeTab, setActiveTab] = useState<AssetTab>('photos');
    const [describingPhotoId, setDescribingPhotoId] = useState<string | null>(null);
    const [videoToProcess, setVideoToProcess] = useState<File | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleDescribeImage = async (photo: Photo) => {
        if (describingPhotoId) return;
        if (!window.confirm("Use AI to describe this image and add it to the input?")) return;
        setDescribingPhotoId(photo.id);
        try {
            const description = await describeImage(photo.imageBlob, "Briefly describe this product image for an e-commerce listing.", siteSettings.customApiEndpoint, siteSettings.customApiAuthKey);
            onAddToInput(`Image Description (${photo.name}): ${description}`);
        } catch (error) {
            alert(`Failed to describe image: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setDescribingPhotoId(null);
        }
    };
    
    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideoToProcess(file);
        } else if (file) {
            alert('Please select a valid video file.');
        }
        if (e.target) e.target.value = ''; // Reset file input
    };

    const handleFrameCaptured = async (dataUrl: string) => {
        if (!videoToProcess) return;
        setVideoToProcess(null);
        
        const blob = dataURLtoBlob(dataUrl);
        const tempPhoto: Photo = {
            id: crypto.randomUUID(),
            name: `${videoToProcess.name} frame`,
            notes: '',
            date: new Date().toISOString(),
            folder: '',
            imageBlob: blob,
            imageMimeType: 'image/jpeg',
            tags: [],
        };
        await handleDescribeImage(tempPhoto);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'recordings':
                return (
                    <ul className="space-y-2">
                        {recordings.slice(0, 10).map(rec => (
                            <li key={rec.id} className="bg-[var(--theme-bg)]/50 p-2 rounded-md">
                                <p className="font-semibold text-sm truncate">{rec.name}</p>
                                <button onClick={() => onAddToInput(rec.transcript)} className="text-xs text-[var(--theme-green)] hover:underline" disabled={!rec.transcript}>Add Transcript</button>
                            </li>
                        ))}
                    </ul>
                );
            case 'notes':
                 return (
                    <ul className="space-y-2">
                        {notes.slice(0, 10).map(note => (
                            <li key={note.id} className="bg-[var(--theme-bg)]/50 p-2 rounded-md">
                                <p className="font-semibold text-sm truncate">{note.title}</p>
                                <button onClick={() => onAddToInput(note.content)} className="text-xs text-[var(--theme-green)] hover:underline">Add Content</button>
                            </li>
                        ))}
                    </ul>
                );
            case 'photos':
                return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photos.slice(0, 8).map(photo => (
                            <div key={photo.id} className="relative group">
                                <PhotoThumbnail 
                                    photo={photo} 
                                    onSelect={() => handleDescribeImage(photo)} 
                                    onDelete={onDeletePhoto} 
                                    isSelected={false} 
                                    isSelectionActive={false} 
                                    onToggleSelection={() => {}}
                                />
                                 {describingPhotoId === photo.id ? (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
                                        <Spinner className="h-6 w-6 text-white" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none rounded-md">
                                        <p className="text-white text-xs text-center p-1">Describe & Add</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            case 'videos':
                return (
                     <div className="flex flex-col items-center justify-center h-full text-center text-[var(--theme-text-secondary)]">
                        <input
                            type="file"
                            ref={videoInputRef}
                            className="sr-only"
                            onChange={handleVideoUpload}
                            accept="video/*"
                        />
                        <button
                            onClick={() => videoInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-bg)] transition-colors w-full h-full"
                        >
                            <VideoIcon className="w-10 h-10 mb-2" />
                            <span className="text-sm font-semibold">Upload Video</span>
                            <span className="text-xs">to capture a frame for AI description</span>
                        </button>
                    </div>
                );
            default: return null;
        }
    }
    
    return (
        <div className="flex flex-col gap-8 h-full">
             {videoToProcess && (
                <VideoFrameExtractorModal
                    videoFile={videoToProcess}
                    onClose={() => setVideoToProcess(null)}
                    onCapture={handleFrameCaptured}
                />
            )}
            <InputPanel 
                value={value}
                onChange={onChange}
                onGenerate={onGenerate}
                isLoading={isLoading}
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onTemplateChange={onTemplateChange}
                tone={tone}
                onToneChange={onToneChange}
                onClear={onClear}
            />
            <div className="bg-[var(--theme-card-bg)] backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)]">
                <h2 className="text-xl font-semibold mb-4 text-[var(--theme-green)]">2. Add From Library</h2>
                <div className="border-b border-[var(--theme-border)] mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <TabButton label="Photos" isActive={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
                        <TabButton label="Videos" isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
                        <TabButton label="Recordings" isActive={activeTab === 'recordings'} onClick={() => setActiveTab('recordings')} />
                        <TabButton label="Notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                    </nav>
                </div>
                <div className="h-48 overflow-y-auto">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string; isActive: boolean; onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            isActive
                ? 'border-[var(--theme-green)] text-[var(--theme-green)]'
                : 'border-transparent text-[var(--theme-text-secondary)] hover:border-gray-500 hover:text-[var(--theme-text-primary)]'
        }`}
    >
        {label}
    </button>
);