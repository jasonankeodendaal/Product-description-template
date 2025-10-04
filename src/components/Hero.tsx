import React from 'react';

interface HeroProps {
  heroImageSrc: string | null;
}

const HeroIllustration: React.FC = () => (
    <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 150" 
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-[var(--theme-green)] opacity-10"
    >
        <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5"/>
            </pattern>
        </defs>
        <rect width="400" height="150" fill="url(#grid)" />
        <g stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 50 120 Q 80 40, 150 75 T 250 90" strokeOpacity="0.3"/>
            <path d="M 80 140 Q 110 60, 180 85 T 280 105" strokeOpacity="0.3"/>
            <path d="M 150 130 Q 180 50, 250 85 T 350 100" strokeOpacity="0.3"/>
        </g>
    </svg>
);


export const Hero: React.FC<HeroProps> = React.memo(({ heroImageSrc }) => {
  return (
    <div 
      className="relative rounded-lg mb-8 overflow-hidden border border-[var(--theme-border)] text-center h-60 md:h-72 lg:h-80 flex flex-col justify-center items-center p-4 sm:p-8"
      role="banner"
    >
      {heroImageSrc ? (
        <>
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear animate-[slow-zoom_15s_ease-in-out_infinite]"
                style={{ backgroundImage: `url(${heroImageSrc})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-[var(--theme-bg)]/60 to-transparent/20"></div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-card-bg)] to-[var(--theme-bg)]">
            <HeroIllustration />
        </div>
      )}
      
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--theme-text-primary)] tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
          Generate Flawless Product Descriptions
        </h1>
        <p className="mt-2 text-base sm:text-lg text-[var(--theme-text-secondary)] max-w-3xl mx-auto" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)'}}>
          Effortlessly transform raw product data into compelling, structured content that converts.
        </p>
      </div>
    </div>
  );
});
