

import React, { useState } from 'react';
import { InputPanel } from './InputPanel';
// FIX: SiteSettings is exported from constants.ts, not App.tsx.
import { Template, Recording, Note, Photo } from '../App';
import { SiteSettings } from '../constants';
import { describeImage } from '../services/geminiService';
import { PhotoThumbnail } from './PhotoThumbnail';
import { Spinner } from './icons/Spinner';

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
}

type AssetTab = 'recordings' | 'notes' | 'photos';

export const ComposerPanel: React.FC<ComposerPanelProps> = ({
    value, onChange, onGenerate, isLoading, templates, selectedTemplateId,
    onTemplateChange, tone, onToneChange, recordings, notes, photos,
    siteSettings, onAddToInput
}) => {
    const [activeTab, setActiveTab] = useState<AssetTab>('recordings');
    const [describingPhotoId, setDescribingPhotoId] = useState<string | null>(null);

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
                    <div className="grid grid-cols-4 gap-2">
                        {photos.slice(0, 8).map(photo => (
                            <div key={photo.id} className="relative group">
                                <PhotoThumbnail photo={photo} onSelect={() => handleDescribeImage(photo)} />
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
            default: return null;
        }
    }
    
    return (
        <div className="flex flex-col gap-8">
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
            />
            <div className="bg-[var(--theme-card-bg)] p-4 md:p-6 rounded-lg shadow-lg border border-[var(--theme-border)]">
                <h2 className="text-xl font-semibold mb-4 text-[var(--theme-green)]">2. Add From Library</h2>
                <div className="border-b border-[var(--theme-border)] mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <TabButton label="Recordings" isActive={activeTab === 'recordings'} onClick={() => setActiveTab('recordings')} />
                        <TabButton label="Notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                        <TabButton label="Photos" isActive={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
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
)
