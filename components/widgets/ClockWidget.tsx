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
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div>
                <p className="text-3xl font-bold text-white tracking-tighter">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
                <CalendarIcon className="w-4 h-4" />
                <p className="font-semibold text-[10px]">
                    {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </div>
    );
};