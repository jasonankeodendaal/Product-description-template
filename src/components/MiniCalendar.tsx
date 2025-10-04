import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { formatIsoToDate } from '../utils/formatters';

interface MiniCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    highlightedDays: Set<string>; // 'YYYY-MM-DD'
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onDateSelect, highlightedDays }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const changeMonth = (delta: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const grid: (Date | null)[] = Array(startingDayOfWeek).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
            grid.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
        }
        return grid;
    }, [viewDate]);

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();

    return (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 animate-fade-in-down">
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-700 rounded-full"><ChevronLeftIcon /></button>
                <h4 className="font-bold text-white">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-700 rounded-full"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 mt-2 gap-y-1">
                {calendarGrid.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`}></div>;
                    const dateKey = formatIsoToDate(date.toISOString());
                    const isSelected = formatIsoToDate(selectedDate.toISOString()) === dateKey;
                    const isToday = formatIsoToDate(today.toISOString()) === dateKey;
                    const hasData = highlightedDays.has(dateKey);

                    let buttonClass = 'relative w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ';
                    if (isSelected) {
                        buttonClass += 'bg-orange-500 text-black';
                    } else if (isToday) {
                        buttonClass += 'bg-orange-500/20 text-orange-400';
                    } else {
                        buttonClass += 'text-slate-200 hover:bg-slate-700';
                    }

                    return (
                        <div key={dateKey} className="flex justify-center items-center">
                            <button
                                onClick={() => onDateSelect(date)}
                                className={buttonClass}
                            >
                                {date.getDate()}
                                {hasData && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-orange-400'}`}></div>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
