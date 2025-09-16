import React from 'react';

export const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 relative ${
            active 
                ? 'bg-[var(--theme-blue)]/10 text-[var(--theme-blue)]' 
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)]/50 hover:text-[var(--theme-text-primary)]'
        }`}
        role="tab"
        aria-selected={active}
    >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[var(--theme-blue)] rounded-r-full"></div>}
        <div className="w-5 h-5">{icon}</div>
        <span>{children}</span>
    </button>
);