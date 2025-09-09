import React from 'react';

interface HeroProps {
  heroImageSrc: string | null;
}

export const Hero: React.FC<HeroProps> = React.memo(({ heroImageSrc }) => {
  const heroStyle: React.CSSProperties = heroImageSrc
    ? { backgroundImage: `url(${heroImageSrc})` }
    : {};

  return (
    <div 
      className="relative bg-gradient-to-b from-slate-800 to-slate-900/50 h-64 rounded-lg mb-8 text-center overflow-hidden border border-[var(--theme-border)] bg-cover bg-center"
      style={heroStyle}
      role="banner"
    >
      {!heroImageSrc && (
         <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-600">No hero image uploaded. Set one in the dashboard.</p>
        </div>
      )}
       <div className="absolute inset-0 bg-black/30"></div>
    </div>
  );
});
