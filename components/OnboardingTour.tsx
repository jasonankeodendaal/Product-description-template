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
            <div className="text-5xl animate-bounce" style={{ animationDuration: '1.5s' }}>👋</div>
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

    const progressPercentage = ((currentStep + 1) / tourSteps.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-center justify-center p-4 font-inter" aria-modal="true" role="dialog">
            <div className="bg-slate-900/50 backdrop-blur-2xl w-full max-w-2xl rounded-2xl shadow-2xl border border-orange-500/20 relative animate-modal-scale-in flex flex-col overflow-hidden">
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-800/50 h-2.5">
                    <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-r-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center text-left min-h-[450px]">
                    <div key={currentStep} className="animate-tour-content-in">
                        <div className="w-24 h-24 mb-6 flex items-center justify-center text-emerald-400 bg-slate-800/50 rounded-2xl">
                            {tourSteps[currentStep].icon}
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">{tourSteps[currentStep].title}</h2>
                        <p className="text-slate-300 mt-4 text-lg max-w-prose">{tourSteps[currentStep].content}</p>
                    </div>
                </div>

                <div className="p-6 bg-black/30 border-t border-orange-500/10 flex items-center justify-between">
                    <button
                        onClick={onFinish}
                        className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        Skip Tour
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full transition-colors transform hover:scale-105"
                    >
                        {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};