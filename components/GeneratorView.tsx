import React from 'react';
import { GenerationResult, OutputPanel } from './OutputPanel';
import { TemplateManager } from './TemplateManager';
import { Template, ParsedProductData, Photo, Recording, Note, View, Video } from '../App';
import { SiteSettings } from '../constants';
import { ComposerPanel } from './ComposerPanel';
import { Hero } from '../Hero';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface GeneratorViewProps {
    userInput: string;
    onUserInputChange: (value: string) => void;
    generatedOutput: GenerationResult | null;
    isLoading: boolean;
    error: string | null;
    templates: Template[];
    onAddTemplate: (name: string, prompt: string) => void;
    onEditTemplate: (id: string, newName: string, newPrompt: string) => void;
    selectedTemplateId: string;
    onTemplateChange: (id: string) => void;
    tone: string;
    onToneChange: (tone: string) => void;
    onGenerate: () => void;
    onSaveToFolder: (item: ParsedProductData, structuredData: Record<string, string>) => Promise<void>;
    siteSettings: SiteSettings;
    photos: Photo[];
    onSavePhoto: (photo: Photo) => Promise<void>;
    onDeletePhoto: (photo: Photo) => Promise<void>;
    videos: Video[];
    onSaveVideo: (video: Video) => Promise<void>;
    onDeleteVideo: (video: Video) => Promise<void>;
    recordings: Recording[];
    notes: Note[];
    onEditImage: (photo: Photo) => void;
    onUpdatePhoto: (photo: Photo) => Promise<void>;
    heroImageSrc: string | null;
    onNavigate: (view: View) => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
    userInput,
    onUserInputChange,
    generatedOutput,
    isLoading,
    error,
    templates,
    onAddTemplate,
    onEditTemplate,
    selectedTemplateId,
    onTemplateChange,
    tone,
    onToneChange,
    onGenerate,
    onSaveToFolder,
    siteSettings,
    photos,
    onSavePhoto,
    onDeletePhoto,
    videos,
    onSaveVideo,
    onDeleteVideo,
    recordings,
    notes,
    onEditImage,
    onUpdatePhoto,
    heroImageSrc,
    onNavigate,
}) => {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col flex-1">
                 <div className="flex-shrink-0 mb-4">
                    <button 
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] font-semibold transition-colors"
                    >
                        <ChevronLeftIcon />
                        Back to Home
                    </button>
                </div>
                
                <Hero heroImageSrc={heroImageSrc} />
                <div className="flex-shrink-0 mb-8">
                     <TemplateManager 
                        templates={templates} 
                        onAddTemplate={onAddTemplate} 
                        onEditTemplate={onEditTemplate} 
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 flex-1">
                    <ComposerPanel
                        value={userInput}
                        onChange={(e) => onUserInputChange(e.target.value)}
                        onGenerate={onGenerate}
                        isLoading={isLoading}
                        templates={templates}
                        selectedTemplateId={selectedTemplateId}
                        onTemplateChange={(e) => onTemplateChange(e.target.value)}
                        tone={tone}
                        onToneChange={(e) => onToneChange(e.target.value)}
                        recordings={recordings}
                        notes={notes}
                        photos={photos}
                        siteSettings={siteSettings}
                        onAddToInput={(text) => onUserInputChange(userInput + '\n' + text)}
                        onDeletePhoto={onDeletePhoto}
                    />
                    <OutputPanel 
                        output={generatedOutput} 
                        isLoading={isLoading} 
                        error={error} 
                        onSaveToFolder={onSaveToFolder} 
                        syncMode={siteSettings.syncMode}
                        photos={photos}
                        onSavePhoto={onSavePhoto}
                        onEditImage={onEditImage}
                        onUpdatePhoto={onUpdatePhoto}
                        videos={videos}
                        onSaveVideo={onSaveVideo}
                        onDeleteVideo={onDeleteVideo}
                    />
                </div>
            </div>
        </div>
    );
};