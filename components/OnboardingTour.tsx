import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { RocketIcon } from './icons/RocketIcon';

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
        title: "Meet Your AI Content Engine",
        content: "Turn messy notes into polished, web-ready descriptions. The AI even searches the web for missing details, ensuring every description is complete."
    },
    {
        icon: <TemplateIcon />,
        title: "Your Brand, Your Voice",
        content: "The AI strictly follows your custom templates and tone of voice for perfect, consistent results that match your brand."
    },
    {
        icon: <RecordingIcon className="w-16 h-16 text-pink-400" />,
        title: "Capture Ideas Instantly",
        content: "Record voice notes on the fly and get accurate text transcripts with a single click. Attach photos for full context."
    },
    {
        icon: (
            <div className="flex items-center justify-center gap-4">
                <PhotoIcon className="w-12 h-12 text-purple-400" />
                <ImageIcon className="w-12 h-12 text-amber-400" />
            </div>
        ),
        title: "Your Central Visual Hub",
        content: "Manage, organize, and edit all your photos in one place. Use the Image Tool to create perfect square images for any platform."
    },
    {
        icon: <NotepadIcon className="w-16 h-16 text-sky-400" />,
        title: "More Than Just Notes",
        content: "Draft ideas, manage tasks with interactive checklists, set reminders, and attach audio memos or scanned documents to your notes."
    },
    {
        icon: <DatabaseIcon className="w-16 h-16 text-gray-400" />,
        title: "Your Command Center",
        content: "The Dashboard is where you manage everything: update branding, back up your data, and choose your sync mode."
    },
    {
        icon: (
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">
                <RocketIcon className="w-8 h-8 text-emerald-400" />
            </div>
        ),
        title: "You're Ready for Takeoff!",
        content: "That's the tour! Dive in and start creating with your new AI-powered toolkit."
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
                            {currentStep === tourSteps.length - 1 ? "Finish Tour" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
