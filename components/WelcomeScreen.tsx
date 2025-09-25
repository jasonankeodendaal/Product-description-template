import React, { useEffect } from 'react';
import { UserRole } from '../App';

interface WelcomeScreenProps {
    userRole: UserRole;
    creatorName: string;
    onDismiss: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userRole, creatorName, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000); // 3 seconds total
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const welcomeName = userRole === 'creator' ? creatorName : 'User';

    return (
        <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-out"
            style={{ animationDelay: '2.5s' }}
            onClick={onDismiss}
        >
            <div className="text-center animate-fade-in-down">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                    Welcome, <span className="text-[var(--theme-orange)]">{welcomeName}</span>!
                </h1>
                <p className="text-xl text-gray-300 mt-2">Your workspace is ready.</p>
            </div>
        </div>
    );
};
