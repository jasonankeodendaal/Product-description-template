import React from 'react';

const HeroIllustration: React.FC = () => (
    <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 50" 
        preserveAspectRatio="xMidYMid slice"
        className="absolute bottom-0 left-0 w-full h-auto text-[var(--theme-blue)] opacity-20"
    >
        <g stroke="currentColor" strokeWidth="0.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Background grid lines */}
            <path d="M0 25 H200 M0 35 H200 M0 45 H200" strokeOpacity="0.3"/>
            <path d="M20 0 V50 M40 0 V50 M60 0 V50 M80 0 V50 M100 0 V50 M120 0 V50 M140 0 V50 M160 0 V50 M180 0 V50" strokeOpacity="0.3"/>

            {/* Main illustration */}
            <path d="M 50 40 Q 55 20, 70 25 T 90 30" strokeWidth="1" strokeOpacity="0.8"/>
            <path d="M 80 45 Q 85 25, 100 30 T 120 35" strokeWidth="1" strokeOpacity="0.8"/>
            <path d="M 110 42 Q 115 22, 130 27 T 150 32" strokeWidth="1" strokeOpacity="0.8"/>
            
            {/* Hand drawing a line */}
            <path d="M 40 45 C 45 40, 50 30, 60 28" strokeWidth="1.2" />
            <path d="M 38 48 L 40 45 L 42 47" />
            <path d="M 36 50 L 38 48" />
            <path d="M 34 48 L 36 50" />
            <path d="M 32 46 L 34 48" />

             {/* Screen element */}
            <rect x="55" y="10" width="100" height="30" rx="2" strokeWidth="0.8" strokeOpacity="0.7"/>
            <path d="M 60 18 h 40" strokeWidth="0.6" strokeOpacity="0.6" />
            <path d="M 60 24 h 80" strokeWidth="0.6" strokeOpacity="0.6" />
            <path d="M 60 30 h 60" strokeWidth="0.6" strokeOpacity="0.6" />

        </g>
    </svg>
);


export const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-slate-900/50 to-transparent p-8 rounded-lg mb-8 text-center overflow-hidden border border-[var(--theme-border)]">
      <HeroIllustration />
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-slate-100">AI-Powered Product Descriptions</h1>
        <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
          Transform raw notes or audio recordings into perfectly structured, professional product descriptions in seconds.
        </p>
      </div>
    </div>
  );
};
