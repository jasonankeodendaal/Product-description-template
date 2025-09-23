import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';

interface OnboardingTourProps {
    onFinish: () => void;
}

const tourSteps = [
    {
        icon: (
            <div className="text-4xl animate-bounce" style={{ animationDuration: '1.5s' }}>👋</div>
        ),
        title: "Welcome to Your AI Workspace!",
        content: "Let's take a quick tour to see how you can supercharge your workflow. It'll only take a moment."
    },
    {
        icon: <SparklesIcon className="w-16 h-16 text-emerald-400" />,
        title: "The AI Generator",
        content: "This is your creative engine. Paste raw product info, choose a template, and watch it generate perfectly structured, professional descriptions in seconds."
    },
    {
        icon: (
            <div className="flex items-center justify-center gap-4">
                <RecordingIcon className="w-12 h-12 text-pink-400" />
                <NotepadIcon className="w-12 h-12 text-sky-400" />
                <PhotoIcon className="w-12 h-12 text-purple-400" />
            </div>
        ),
        title: "All-in-One Tools",
        content: "Capture ideas with the Recorder, organize visuals in the Photo Library, and draft thoughts in the Notepad. Everything is connected and at your fingertips."
    },
    {
        icon: (
             <div className="flex items-center justify-center gap-4">
                <HardDriveIcon />
                <FolderSyncIcon />
            </div>
        ),
        title: "You Control Your Data",
        content: "Your work is private and saved offline-first to your browser. For automatic backups and syncing, connect a local folder in the Dashboard. No clouds, no accounts."
    }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--theme-card-bg)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--theme-border)] relative animate-modal-scale-in flex flex-col text-center">
                <div className="p-8 space-y-4">
                    <div className="w-20 h-20 mx-auto flex items-center justify-center text-emerald-400">
                        {tourSteps[currentStep].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{tourSteps[currentStep].title}</h2>
                    <p className="text-[var(--theme-text-secondary)]">{tourSteps[currentStep].content}</p>
                </div>

                <div className="p-6 bg-black/20 border-t border-[var(--theme-border)]/50 space-y-4">
                    <div className="flex justify-center gap-2">
                        {tourSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    index === currentStep ? 'bg-[var(--theme-green)]' : 'bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onFinish}
                            className="text-sm font-semibold text-gray-400 hover:text-white"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-[var(--theme-green)] text-black font-bold py-2 px-6 rounded-full"
                        >
                            {currentStep === tourSteps.length - 1 ? "Let's Go!" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
