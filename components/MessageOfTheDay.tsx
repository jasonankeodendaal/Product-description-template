import React, { useMemo, useState, useEffect } from 'react';
import { inspirationalMessages } from '../data/messages';

const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

const fonts = ['font-inter', 'font-lora', 'font-patrick-hand'];

const BackgroundIllustration: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full -z-10" aria-hidden="true">
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.1)" />
                <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
    </svg>
)

export const MessageOfTheDay: React.FC = () => {
    const [currentFontIndex, setCurrentFontIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFontIndex(prevIndex => (prevIndex + 1) % fonts.length);
        }, 30 * 60 * 1000); // Change font every 30 minutes
        return () => clearInterval(interval);
    }, []);

    const dailyMessage = useMemo(() => {
        const dayIndex = getDayOfYear(new Date());
        return inspirationalMessages[dayIndex % inspirationalMessages.length];
    }, []);

    const [message, reference] = dailyMessage.split(' - ');
    const fontClass = fonts[currentFontIndex];

    return (
        <div className="relative text-center p-6 rounded-xl overflow-hidden bg-gray-900/50 border border-orange-500/20 shadow-lg flex flex-col justify-center min-h-[140px]">
            <BackgroundIllustration />
            <blockquote className="space-y-2">
                <p 
                    className={`text-2xl md:text-3xl leading-tight font-bold text-orange-300 transition-all duration-1000 ${fontClass}`}
                    style={{ animation: 'text-glow 4s ease-in-out infinite' }}
                >
                    “{message}”
                </p>
                <footer className="text-sm font-semibold text-gray-400 tracking-wider">
                    — {reference}
                </footer>
            </blockquote>
        </div>
    );
};