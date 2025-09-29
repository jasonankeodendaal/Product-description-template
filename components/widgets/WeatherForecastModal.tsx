import React from 'react';
import { WeatherData, WeatherIcon } from './WeatherWidget';
import { XIcon } from '../icons/XIcon';
import { WindIcon } from '../icons/WindIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';

interface WeatherForecastModalProps {
    weatherData: WeatherData;
    onClose: () => void;
}

export const WeatherForecastModal: React.FC<WeatherForecastModalProps> = ({ weatherData, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-[var(--theme-card-bg)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">7-Day Forecast for {weatherData.city}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)] hover:text-white"><XIcon /></button>
                </header>

                <div className="p-4 space-y-2">
                    {weatherData.forecast.map((day, index) => {
                        const date = new Date(day.date);
                        // Add a day to account for UTC vs local time differences in parsing
                        date.setDate(date.getDate() + 1); 
                        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                        
                        return (
                            <div key={day.date} className="flex items-center gap-4 text-sm font-semibold p-2 rounded-lg odd:bg-black/10">
                                <span className="w-12 text-gray-300">{dayName}</span>
                                <div className="w-8 h-8 text-white flex-shrink-0">
                                    <WeatherIcon icon={day.icon} />
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 w-12">
                                    <ArrowDownIcon className="w-4 h-4" />
                                    <span>{Math.round(day.tempLowCelsius)}°</span>
                                </div>
                                <div className="flex-grow h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                     <div className="h-full bg-gradient-to-r from-sky-400 to-orange-400"></div>
                                </div>
                                <div className="flex items-center gap-1 text-white w-12">
                                    <ArrowUpIcon className="w-4 h-4" />
                                    <span>{Math.round(day.tempHighCelsius)}°</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-300 w-20 justify-end">
                                    <WindIcon className="w-4 h-4" />
                                    <span>{Math.round(day.windSpeedKph)} kph</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};