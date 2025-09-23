import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../../constants';
import { Spinner } from '../icons/Spinner';
import { SunIcon } from '../icons/SunIcon';
import { CloudIcon } from '../icons/CloudIcon';
import { RainIcon } from '../icons/RainIcon';
import { SnowIcon } from '../icons/SnowIcon';
import { WindIcon } from '../icons/WindIcon';
import { RefreshIcon } from '../icons/RefreshIcon';

interface WeatherWidgetProps {
    getWeatherInfo: (city: string) => Promise<any>;
    siteSettings: SiteSettings;
}

interface WeatherData {
    city: string;
    temperatureCelsius: number;
    condition: string;
    icon: 'SUNNY' | 'CLOUDY' | 'PARTLY_CLOUDY' | 'RAIN' | 'SNOW' | 'WIND' | 'FOG' | 'STORM' | 'UNKNOWN';
}

const WeatherIcon: React.FC<{ icon: WeatherData['icon'] }> = ({ icon }) => {
    switch (icon) {
        case 'SUNNY': return <SunIcon />;
        // FIX: Pass a full className to override the icon's default size and color, resolving the type error.
        case 'CLOUDY': return <CloudIcon isConnected={false} className="h-full w-full text-white"/>;
        // FIX: Pass a full className to override the icon's default size and color, resolving the type error.
        case 'PARTLY_CLOUDY': return <CloudIcon isConnected={false} className="h-full w-full text-white"/>;
        case 'RAIN': return <RainIcon />;
        case 'SNOW': return <SnowIcon />;
        case 'WIND': return <WindIcon />;
        default: return <SunIcon />;
    }
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ getWeatherInfo, siteSettings }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [city, setCity] = useState<string>(() => localStorage.getItem('weatherCity') || 'New York');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingCity, setIsEditingCity] = useState(false);

    const fetchWeather = useCallback(async (targetCity: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWeatherInfo(targetCity);
            setWeather(data);
            localStorage.setItem('weatherCity', targetCity);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not fetch weather.');
            setWeather(null);
        } finally {
            setIsLoading(false);
        }
    }, [getWeatherInfo]);

    useEffect(() => {
        fetchWeather(city);
    }, [fetchWeather]);

    const handleCitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWeather(city);
        setIsEditingCity(false);
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                {isEditingCity ? (
                    <form onSubmit={handleCitySubmit} className="flex-grow">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-emerald-500 text-white text-base font-bold focus:outline-none"
                            autoFocus
                            onBlur={() => setIsEditingCity(false)}
                        />
                    </form>
                ) : (
                    <button onClick={() => setIsEditingCity(true)} className="text-base font-bold text-white hover:text-emerald-400">
                        {weather?.city || city}
                    </button>
                )}
                <button onClick={() => fetchWeather(city)} className={`p-1 ${isLoading ? 'animate-spin' : ''}`} disabled={isLoading}>
                    <RefreshIcon />
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center py-2">
                {isLoading ? (
                    <Spinner className="w-8 h-8 text-white" />
                ) : error ? (
                    <p className="text-rose-400 text-xs text-center">{error}</p>
                ) : weather ? (
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 text-white">{<WeatherIcon icon={weather.icon} />}</div>
                        <div>
                            <p className="text-4xl font-bold text-white">{Math.round(weather.temperatureCelsius)}°C</p>
                            <p className="text-gray-300 font-semibold text-sm">{weather.condition}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No weather data.</p>
                )}
            </div>
        </div>
    );
};