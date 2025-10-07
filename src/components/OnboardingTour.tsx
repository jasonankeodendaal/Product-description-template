import React, { useState } from 'react';
import { RocketIcon } from './icons/RocketIcon';

interface OnboardingTourProps {
    onFinish: () => void;
}

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
        <rect x="50" y="40" width="100" height="15" rx="0" fill="#0369A1" />
        <path d="M 65 70 H 135 M 65 90 H 135 M 65 110 H 135 M 65 130 H 110" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round" />
        <g transform="translate(100 120) rotate(20)">
            <path d="M 0 -30 L 0 20" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" />
            <path d="M 0 20 L -5 30 L 5 30 Z" fill="#F59E0B" />
            <path d="M 0 -30 L 0 -40" stroke="#78716C" strokeWidth="12" strokeLinecap="round" />
        </g>
        <path d="M 65 130 H 135" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round" className="writing-line" />
    </svg>
);

const AnimatedFileBrowserIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes folder-flap-open { 0%, 100% { transform: rotateX(0deg); } 50% { transform: rotateX(-30deg); } }
            @keyframes file-fly-out-1 { 0% { transform: translate(0, 0) scale(0); opacity: 0; } 50% { transform: translate(-30px, -40px) scale(1); opacity: 1; } 100% { transform: translate(-40px, -60px) scale(1); opacity: 0; } }
            @keyframes file-fly-out-2 { 0% { transform: translate(0, 0) scale(0); opacity: 0; } 50% { transform: translate(30px, -40px) scale(1); opacity: 1; } 100% { transform: translate(40px, -60px) scale(1); opacity: 0; } }
            .folder-flap { animation: folder-flap-open 3s ease-in-out infinite; transform-origin: bottom center; }
            .file-1 { animation: file-fly-out-1 3s ease-in-out infinite 0.2s; }
            .file-2 { animation: file-fly-out-2 3s ease-in-out infinite 0.4s; }
        `}</style>
        <path d="M 40 140 L 40 70 L 90 70 L 110 90 L 160 90 L 160 140 Z" fill="#60A5FA" />
        <g className="file-1">
            <rect x="90" y="80" width="20" height="25" rx="2" fill="#38BDF8" />
        </g>
        <g className="file-2">
            <rect x="90" y="80" width="20" height="25" rx="2" fill="#A855F7" />
        </g>
        <path className="folder-flap" d="M 40 80 L 40 70 L 90 70 L 110 90 L 160 90 L 160 80 L 105 80 L 90 65 L 40 65 Z" fill="#93C5FD" />
    </svg>
);

const AnimatedTimesheetIcon = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <style>{`
            @keyframes clock-hand-spin { from { transform: rotate(0deg); } to { transform: rotate(720deg); } }
            @keyframes bar-grow-anim { 0% { height: 5; } 50% { height: 30; } 100% { height: 15; } }
            .clock-hand { animation: clock-hand-spin 4s linear infinite; transform-origin: center; }
            .chart-bar { animation: bar-grow-anim 4s ease-in-out infinite; }
        `}</style>
        <path d="M 50 150 L 150 150 L 150 140 L 50 140 Z" fill="#475569" />
        <g transform="translate(0 140)">
            <rect x="60" y="-30" width="20" height="30" fill="#34D399" className="chart-bar" style={{ animationDelay: '0s' }} />
            <rect x="90" y="-50" width="20" height="50" fill="#EF4444" className="chart-bar" style={{ animationDelay: '0.5s' }} />
            <rect x="120" y="-40" width="20" height="40" fill="#60A5FA" className="chart-bar" style={{ animationDelay: '1s' }} />
        </g>
        <circle cx="100" cy="80" r="40" fill="#1F2937" stroke="#94A3B8" strokeWidth="4" />
        <g className="clock-hand">
            <path d="M 100 80 L 100 50" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <path d="M 100 80 L 120 80" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
        </g>
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
        title: "Welcome to Your Unified Workspace!",
        content: (
            <div className="space-y-3">
                <p>This isn't just another app—it's a complete, offline-first suite designed to bring your entire creative process into one cohesive workspace.</p>
                <p className="font-semibold text-orange-300">Let's explore how you can go from scattered ideas to a polished final product, all in one place.</p>
            </div>
        )
    },
    {
        icon: <AnimatedAiEngineIcon />,
        title: "From Raw Data to Perfect Copy",
        content: (
             <div className="space-y-4">
                <p>Paste raw product data, messy notes, or transcribed audio into the <strong className="text-white">Generator</strong>. Our AI, powered by Google's Gemini, will intelligently restructure it into a professional description.</p>
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li><strong className="text-white">Web-Powered Accuracy:</strong> The AI uses Google Search to find and fill in missing details like dimensions or warranty info, ensuring your content is always complete and accurate.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <AnimatedBrandingIcon />,
        title: "Total Control Over Tone & Structure",
        content: (
            <div className="space-y-4">
                <p>Maintain perfect brand consistency effortlessly. You have complete control over the AI's output.</p>
                 <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li><strong className="text-white">Custom Templates:</strong> Build unlimited templates with your own unique sections. The AI follows your structure to the letter.</li>
                    <li><strong className="text-white">Tone of Voice Control:</strong> Instantly switch between Professional, Casual, or Persuasive tones to match any product or audience.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <AnimatedRecordingIcon />,
        title: "From Voice Memos to Actionable Text",
        content: (
            <div className="space-y-4">
                <p>Inspiration strikes anywhere. Use the <strong className="text-white">Recorder</strong> to capture voice notes on the fly. With a single click, get a fast, accurate text transcript.</p>
                 <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Use this text directly in the Generator or add it to your notes. Link photos for complete context during site visits or client meetings.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <AnimatedVisualHubIcon />,
        title: "Unify Your Visual Assets",
        content: (
            <div className="space-y-4">
                <p>The <strong className="text-white">Photo Library</strong> is your central hub for all project images and videos. Upload, capture, and organize assets into smart folders that automatically link to your content.</p>
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Need a perfect product shot? The <strong className="text-white">Image Tool</strong> creates broadcast-quality, squared images ready for any e-commerce platform.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <AnimatedNotepadIcon />,
        title: "The Multimedia Notepad",
        content: (
            <div className="space-y-4">
                <p>This is far more than a simple text editor. The <strong className="text-white">Notepad</strong> is a multimedia workspace for brainstorming, planning, and drafting.</p>
                 <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Format text, create drag-and-drop checklists, and <strong className="text-white">embed audio recordings or scanned documents</strong> directly into your notes.</li>
                    <li>Add a hero image, set due dates, and even lock sensitive notes with your PIN.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <AnimatedFileBrowserIcon />,
        title: "Navigate Your Content, Natively",
        content: (
             <div className="space-y-4">
                <p>No need to leave the app to find your saved work. The new <strong className="text-white">File Browser</strong> provides a direct window into your `Generated_Content` folder.</p>
                 <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Navigate your brands and products, preview descriptions, and view all linked images and videos with the same structure as your local files.</li>
                </ul>
            </div>
        )
    },
     {
        icon: <AnimatedTimesheetIcon />,
        title: "Track Your Productivity",
        content: (
             <div className="space-y-4">
                <p>Understand where your time goes. The <strong className="text-white">Timesheet</strong> automatically logs key activities like creating a note or adding a photo.</p>
                 <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Start a manual timer for specific tasks, view daily and weekly summaries of your work, and export professional PDF reports.</li>
                </ul>
            </div>
        )
    },
    {
        icon: <AnimatedDashboardIcon />,
        title: "You're in Complete Control",
        content: (
            <div className="space-y-4">
                <p>This app is built on data sovereignty: your data is yours, period. The <strong className="text-white">Dashboard</strong> is your command center.</p>
                 <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Create full backups of your entire workspace in a single `.zip` file.</li>
                    <li>Choose your sync mode: private browser storage, a local PC folder, or a cloud service. You decide.</li>
                </ul>
            </div>
        )
    },
    {
        icon: (
             <div className="w-24 h-24 flex items-center justify-center">
                <AnimatedRocketIcon />
            </div>
        ),
        title: "You're All Set!",
        content: (
            <div className="space-y-3">
                <p>You now have a powerful, integrated suite of tools at your fingertips. Eliminate distractions, streamline your process, and unlock a new level of productivity.</p>
                <p className="font-semibold text-orange-300">Let's get creating!</p>
            </div>
        )
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
                
                <div className="w-full bg-slate-800/50 h-2.5">
                    <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-r-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center text-left min-h-[450px]">
                    <div key={currentStep} className="animate-tour-content-in">
                        <div className="w-24 h-24 mb-6 flex items-center justify-center">
                            {tourSteps[currentStep].icon}
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">{tourSteps[currentStep].title}</h2>
                        <div className="text-slate-300 mt-4 text-lg max-w-prose">
                            {tourSteps[currentStep].content}
                        </div>
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
