import React, { useMemo } from 'react';
import { WeatherData, WeatherIcon } from './WeatherWidget';
import { XIcon } from '../icons/XIcon';
import { WindIcon } from '../icons/WindIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { HumidityIcon } from '../icons/HumidityIcon';

interface WeatherForecastModalProps {
    weatherData: WeatherData;
    onClose: () => void;
}

export const WeatherForecastModal: React.FC<WeatherForecastModalProps> = ({ weatherData, onClose }) => {
    
    const { minTemp, maxTemp, tempRange } = useMemo(() => {
        if (!weatherData.forecast || weatherData.forecast.length === 0) {
            return { minTemp: 0, maxTemp: 0, tempRange: 0 };
        }
        const allTemps = weatherData.forecast.flatMap(d => [d.tempLowCelsius, d.tempHighCelsius]);
        const min = Math.floor(Math.min(...allTemps));
        const max = Math.ceil(Math.max(...allTemps));
        return { minTemp: min, maxTemp: max, tempRange: max - min };
    }, [weatherData.forecast]);
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-[var(--theme-card-bg)] w-full max-w-2xl rounded-xl shadow-2xl border border-[var(--theme-border)]/50 relative animate-modal-scale-in flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">7-Day Forecast for {weatherData.city}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-[var(--theme-text-secondary)] hover:text-white"><XIcon /></button>
                </header>

                <div className="p-4 space-y-2">
                    {weatherData.forecast.map((day, index) => {
                        const date = new Date(day.date);
                        date.setDate(date.getDate() + 1); 
                        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                        
                        const lowOffset = tempRange > 0 ? ((day.tempLowCelsius - minTemp) / tempRange) * 100 : 0;
                        const barWidth = tempRange > 0 ? ((day.tempHighCelsius - day.tempLowCelsius) / tempRange) * 100 : 0;

                        return (
                            <div key={day.date} className={`grid grid-cols-12 items-center gap-2 text-sm font-semibold p-2 rounded-lg ${index === 0 ? 'bg-black/20' : ''}`}>
                                <span className="col-span-2 text-gray-300 font-bold">{dayName}</span>
                                
                                <div className="col-span-3 flex items-center gap-2">
                                    <div className="w-8 h-8 text-white flex-shrink-0">
                                        <WeatherIcon icon={day.icon} />
                                    </div>
                                    <span className="text-gray-400 text-xs hidden sm:inline capitalize">{day.condition}</span>
                                </div>

                                <div className="col-span-5 flex items-center gap-2">
                                    <span className="w-8 text-right text-gray-400">{Math.round(day.tempLowCelsius)}°</span>
                                    <div className="flex-grow h-2 bg-gray-700/50 rounded-full relative">
                                        <div 
                                            className="absolute h-2 bg-gradient-to-r from-sky-400 to-orange-400 rounded-full"
                                            style={{ left: `${lowOffset}%`, width: `${barWidth}%`}}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-left text-white">{Math.round(day.tempHighCelsius)}°</span>
                                </div>
                                
                                <div className="col-span-2 flex items-center justify-end gap-3 text-xs text-gray-400">
                                    <div className="flex items-center gap-1" title="Humidity">
                                        <HumidityIcon className="w-3 h-3"/>
                                        <span>{day.humidityPercent}%</span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1" title="Wind">
                                        <WindIcon className="w-3 h-3" />
                                        <span>{Math.round(day.windSpeedKph)}km/h</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};