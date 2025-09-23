import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { HardDriveIcon } from './icons/HardDriveIcon';
import { FolderSyncIcon } from './icons/FolderSyncIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloudIcon } from './icons/CloudIcon';

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
        content: "The Generator uses powerful AI to turn messy product notes into polished descriptions. It even searches the web to find missing details like dimensions and warranty info, ensuring every description is complete."
    },
    {
        icon: <TemplateIcon />,
        title: "Your Brand, Your Voice",
        content: "Control the output with customizable Templates and select a Tone of Voice (e.g., Professional, Casual) to match your brand perfectly. The AI strictly follows your rules for consistent results every time."
    },
    {
        icon: <RecordingIcon className="w-16 h-16 text-pink-400" />,
        title: "Capture Ideas Instantly",
        content: "Never lose a thought again. Record voice notes on the fly and get an accurate text transcript with a single click. You can even attach photos and notes to your recordings for full context."
    },
    {
        icon: (
            <div className="flex items-center justify-center gap-4">
                <PhotoIcon className="w-12 h-12 text-purple-400" />
                <ImageIcon className="w-12 h-12 text-amber-400" />
            </div>
        ),
        title: "Your Central Visual Hub",
        content: "Manage all your product photos in one place. Organize with folders and tags, capture new images with the built-in camera, and use the Image Tool to batch-process photos into perfect squares."
    },
    {
        icon: <NotepadIcon className="w-16 h-16 text-sky-400" />,
        title: "More Than Just Notes",
        content: "Draft ideas with a rich text editor, manage tasks with interactive checklists, and attach audio memos or scanned documents. Set due dates and reminders to stay on top of deadlines."
    },
    {
        icon: <DatabaseIcon className="w-16 h-16 text-gray-400" />,
        title: "Your Command Center",
        content: "The Dashboard is where you manage everything. Update your company branding, back up your data, and choose your sync mode (Local, Folder, or API). All app settings are here."
    },
    {
        icon: (
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">
                <CheckIcon />
            </div>
        ),
        title: "You're All Set!",
        content: "That's the tour! You now have a powerful, private, and offline-first workspace. Dive in and start creating."
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
