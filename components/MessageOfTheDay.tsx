import React, { useMemo } from 'react';
import { inspirationalMessages } from '../data/messages';

const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

export const MessageOfTheDay: React.FC = () => {
    const dailyMessage = useMemo(() => {
        const dayIndex = getDayOfYear(new Date());
        return inspirationalMessages[dayIndex % inspirationalMessages.length];
    }, []);

    const [message, reference] = dailyMessage.split(' - ');

    return (
        <div className="relative text-center p-4 h-full rounded-xl overflow-hidden bg-gray-900/50 border border-emerald-500/20 shadow-lg flex flex-col justify-center">
            <div className="absolute inset-0 -z-10 bg-grid-emerald-500/10 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]"></div>
            <blockquote className="space-y-2">
                <p 
                    className="text-lg md:text-xl font-bold font-inter text-emerald-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]" 
                    style={{ textShadow: '0 0 10px rgba(52, 211, 153, 0.5)' }}
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