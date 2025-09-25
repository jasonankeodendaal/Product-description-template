import React, { useState } from 'react';

interface OnboardingTourProps {
    onFinish: () => void;
}

// --- Animated SVG Icons ---

const AnimatedAiEngineIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes pulse-neuron { 0%, 100% { stroke-opacity: 0.2; } 50% { stroke-opacity: 1; } }
            .neuron-1 { animation: pulse-neuron 2s ease-in-out infinite; }
            .neuron-2 { animation: pulse-neuron 2s ease-in-out infinite 0.5s; }
            .neuron-3 { animation: pulse-neuron 2s ease-in-out infinite 1s; }
        `}</style>
        <defs>
            <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#ai-glow)">
            <path d="M100 50 C 60 50, 50 70, 50 100 C 50 130, 60 150, 100 150 C 140 150, 150 130, 150 100 C 150 70, 140 50, 100 50 Z" fill="none" stroke="#34D399" strokeWidth="4" />
            <circle cx="100" cy="100" r="15" fill="#34D399" />
            <path className="neuron-1" d="M100 100 C 80 70, 70 80, 60 60" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
            <path className="neuron-2" d="M100 100 C 120 70, 130 80, 140 60" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
            <path className="neuron-1" d="M100 100 C 80 130, 70 120, 60 140" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
            <path className="neuron-2" d="M100 100 C 120 130, 130 120, 140 140" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
            <path className="neuron-3" d="M100 100 C 70 90, 60 110, 52 100" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
            <path className="neuron-3" d="M100 100 C 130 90, 140 110, 148 100" fill="none" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
        </g>
    </svg>
);

const AnimatedBrandingIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes stamp-it { 0% { transform: translateY(-20px) rotate(-10deg); } 50% { transform: translateY(10px) rotate(5deg); } 100% { transform: translateY(-20px) rotate(-10deg); } }
            @keyframes mark-appear { 0%, 50% { opacity: 0; } 75%, 100% { opacity: 1; } }
            .stamp-handle { animation: stamp-it 3s ease-in-out infinite; transform-origin: center; }
            .stamp-mark { animation: mark-appear 3s ease-in-out infinite; }
        `}</style>
        <g className="stamp-mark" opacity="0">
            <path d="M 60 140 Q 100 100, 140 140" stroke="#FBBF24" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 80 140 Q 100 120, 120 140" stroke="#FBBF24" strokeWidth="8" fill="none" strokeLinecap="round" />
        </g>
        <g className="stamp-handle">
            <rect x="70" y="30" width="60" height="20" rx="10" fill="#78716C" />
            <rect x="85" y="50" width="30" height="40" fill="#A8A29E" />
            <rect x="60" y="90" width="80" height="30" rx="5" fill="#F59E0B" />
        </g>
    </svg>
);

const AnimatedRecordingIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes wave-radiate { 0% { r: 0; opacity: 0.8; } 100% { r: 60; opacity: 0; } }
            .wave-1 { animation: wave-radiate 2s ease-out infinite; }
            .wave-2 { animation: wave-radiate 2s ease-out infinite 1s; }
        `}</style>
        <g>
            <circle cx="100" cy="100" r="35" fill="#EC4899" />
            <path d="M100,75 v50 M85,85 v30 M115,85 v30" stroke="#FBCFE8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="100" cy="100" fill="none" stroke="#F9A8D4" strokeWidth="4" className="wave-1" />
            <circle cx="100" cy="100" fill="none" stroke="#F9A8D4" strokeWidth="4" className="wave-2" />
        </g>
    </svg>
);

const AnimatedVisualHubIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes shuffle-1 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-10px, 5px) rotate(-8deg); } }
            @keyframes shuffle-2 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(5px, -5px) rotate(5deg); } }
            @keyframes shuffle-3 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, 5px) rotate(8deg); } }
            .photo-card-1 { animation: shuffle-1 4s ease-in-out infinite; }
            .photo-card-2 { animation: shuffle-2 4s ease-in-out infinite; }
            .photo-card-3 { animation: shuffle-3 4s ease-in-out infinite; }
        `}</style>
        <defs>
            <filter id="photo-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.3" /></filter>
        </defs>
        <g filter="url(#photo-shadow)" transform="translate(30 30)">
            <g className="photo-card-1" transform-origin="center">
                <rect x="40" y="40" width="80" height="100" rx="8" fill="#E5E7EB" transform="rotate(-5)" />
                <rect x="50" y="50" width="60" height="60" fill="#A855F7" transform="rotate(-5)" />
            </g>
            <g className="photo-card-2" transform-origin="center">
                <rect x="40" y="40" width="80" height="100" rx="8" fill="#E5E7EB" transform="rotate(3)" />
                <rect x="50" y="50" width="60" height="60" fill="#D97706" transform="rotate(3)" />
            </g>
             <g className="photo-card-3" transform-origin="center">
                <rect x="40" y="40" width="80" height="100" rx="8" fill="#E5E7EB" />
                <rect x="50" y="50" width="60" height="60" fill="#A855F7" />
            </g>
        </g>
    </svg>
);

const AnimatedNotepadIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes write-line { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
            .writing-line { stroke-dasharray: 20 20; animation: write-line 1.5s linear infinite; }
        `}</style>
        <rect x="50" y="40" width="100" height="120" rx="10" fill="#38BDF8" />
        <rect x="50" y="40" width="100" height="15" rx="0" fill="#2563EB" />
        <path d="M 65 70 H 135 M 65 90 H 135 M 65 110 H 135 M 65 130 H 110" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round" />
        <g transform="translate(100 120) rotate(20)">
            <path d="M 0 -30 L 0 20" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" />
            <path d="M 0 20 L -5 30 L 5 30 Z" fill="#F59E0B" />
            <path d="M 0 -30 L 0 -40" stroke="#78716C" strokeWidth="12" strokeLinecap="round" />
        </g>
        <path d="M 65 130 H 135" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round" className="writing-line" />
    </svg>
);

const AnimatedDashboardIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes grow-bar { from { transform: scaleY(0.1); } to { transform: scaleY(1); } }
            .bar-1 { animation: grow-bar 1.5s ease-in-out infinite alternate 0s; }
            .bar-2 { animation: grow-bar 1.5s ease-in-out infinite alternate 0.3s; }
            .bar-3 { animation: grow-bar 1.5s ease-in-out infinite alternate 0.6s; }
        `}</style>
        <rect x="40" y="40" width="120" height="120" rx="10" fill="#475569" />
        <g transform-origin="bottom center">
            <rect x="60" y="100" width="20" height="40" fill="#34D399" className="bar-1" style={{ transformBox: 'fill-box' }} />
            <rect x="90" y="80" width="20" height="60" fill="#F87171" className="bar-2" style={{ transformBox: 'fill-box' }} />
            <rect x="120" y="110" width="20" height="30" fill="#60A5FA" className="bar-3" style={{ transformBox: 'fill-box' }} />
        </g>
        <path d="M60 80 C 80 60, 110 90, 140 70" stroke="#94A3B8" strokeWidth="4" fill="none" />
    </svg>
);

const AnimatedRocketIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes take-off { 0%, 100% { transform: translateY(5px); } 50% { transform: translateY(-5px); } }
            @keyframes flame-flicker { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.2); } }
            .rocket-body { animation: take-off 2s ease-in-out infinite; }
            .rocket-flame { animation: flame-flicker 0.2s linear infinite; transform-origin: top center; }
        `}</style>
        <g className="rocket-body">
            <path d="M100 40 L 120 90 L 130 110 L 100 100 L 70 110 L 80 90 Z" fill="#E5E7EB" />
            <path d="M100 40 C 90 60, 90 80, 100 100 C 110 80, 110 60, 100 40 Z" fill="#EF4444" />
            <circle cx="100" cy="80" r="10" fill="#9CA3AF" />
            <path d="M 70 110 L 60 140 L 80 115 Z" fill="#9CA3AF" />
            <path d="M 130 110 L 140 140 L 120 115 Z" fill="#9CA3AF" />
        </g>
        <g className="rocket-flame" transform="translate(0 5)">
            <path d="M 85 115 C 90 140, 110 140, 115 115 C 110 130, 90 130, 85 115 Z" fill="#F59E0B" />
            <path d="M 90 115 C 95 130, 105 130, 110 115 C 105 125, 95 125, 90 115 Z" fill="#FBBF24" />
        </g>
    </svg>
);


const tourSteps = [
    {
        icon: <div className="text-5xl animate-bounce" style={{ animationDuration: '1.5s' }}>👋</div>,
        title: "Welcome to Your AI Workspace!",
        content: "Let's take a quick tour to see how you can supercharge your workflow. It'll only take a moment."
    },
    {
        icon: <AnimatedAiEngineIcon />,
        title: "Meet Your AI Content Engine",
        content: "Turn messy notes into polished, web-ready descriptions. The AI even searches the web for missing details, ensuring every description is complete."
    },
    {
        icon: <AnimatedBrandingIcon />,
        title: "Your Brand, Your Voice",
        content: "The AI strictly follows your custom templates and tone of voice for perfect, consistent results that match your brand."
    },
    {
        icon: <AnimatedRecordingIcon />,
        title: "Capture Ideas Instantly",
        content: "Record voice notes on the fly and get accurate text transcripts with a single click. Attach photos for full context."
    },
    {
        icon: <AnimatedVisualHubIcon />,
        title: "Your Central Visual Hub",
        content: "Manage, organize, and edit all your photos in one place. Use the Image Tool to create perfect square images for any platform."
    },
    {
        icon: <AnimatedNotepadIcon />,
        title: "More Than Just Notes",
        content: "Draft ideas, manage tasks with interactive checklists, set reminders, and attach audio memos or scanned documents to your notes."
    },
    {
        icon: <AnimatedDashboardIcon />,
        title: "Your Command Center",
        content: "The Dashboard is where you manage everything: update branding, back up your data, and choose your sync mode."
    },
    {
        icon: <AnimatedRocketIcon />,
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
                    <div key={currentStep} className="animate-fade-in-down">
                        <div className="w-24 h-24 mb-6 flex items-center justify-center">
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