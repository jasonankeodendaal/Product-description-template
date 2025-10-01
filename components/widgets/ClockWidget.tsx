import React, { useState, useEffect } from 'react';
import { CalendarIcon } from '../icons/CalendarIcon';

export const ClockWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 h-full shadow-lg border border-white/10 flex flex-col justify-center items-center text-center">
            <p className="font-bold text-white tracking-tighter leading-none clock-time md:text-8xl">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
            <div className="flex items-center gap-1.5 text-gray-300 mt-2">
                <CalendarIcon className="w-4 h-4" />
                <p className="font-semibold clock-date md:text-lg">
                    {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </div>
    );
};