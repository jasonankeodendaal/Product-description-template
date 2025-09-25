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
    getWeatherInfo: (location: { city?: string; lat?: number; lon?: number }) => Promise<any>;
    siteSettings: SiteSettings;
}

interface WeatherData {
    city: string;
    latitude: number;
    longitude: number;
    temperatureCelsius: number;
    condition: string;
    icon: 'SUNNY' | 'CLOUDY' | 'PARTLY_CLOUDY' | 'RAIN' | 'SNOW' | 'WIND' | 'FOG' | 'STORM' | 'UNKNOWN';
}

const WeatherIcon: React.FC<{ icon: WeatherData['icon'] }> = ({ icon }) => {
    switch (icon) {
        case 'SUNNY': return <SunIcon />;
        case 'CLOUDY': return <CloudIcon isConnected={false} className="h-full w-full text-white"/>;
        case 'PARTLY_CLOUDY': return <CloudIcon isConnected={false} className="h-full w-full text-white"/>;
        case 'RAIN': return <RainIcon />;
        case 'SNOW': return <SnowIcon />;
        case 'WIND': return <WindIcon />;
        default: return <SunIcon />;
    }
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ getWeatherInfo, siteSettings }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [cityInput, setCityInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingCity, setIsEditingCity] = useState(false);
    const [isDetecting, setIsDetecting] = useState(true);

    const fetchWeather = useCallback(async (location: { city?: string; lat?: number; lon?: number }) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWeatherInfo(location);
            setWeather(data);
            if (data.city) {
                setCityInput(data.city);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not fetch weather.');
            setWeather(null);
        } finally {
            setIsLoading(false);
        }
    }, [getWeatherInfo]);
    
    useEffect(() => {
        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather({ lat: latitude, lon: longitude });
                setIsDetecting(false);
            },
            (geoError) => {
                console.warn("Geolocation error:", geoError.message);
                // Fallback to a default city if geolocation fails
                fetchWeather({ city: 'London' });
                setIsDetecting(false);
            },
            { timeout: 10000 }
        );
    }, [fetchWeather]);

    const handleCitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cityInput.trim()) {
            fetchWeather({ city: cityInput.trim() });
        }
        setIsEditingCity(false);
    };
    
    const handleRefresh = () => {
        if (weather?.latitude && weather?.longitude) {
            fetchWeather({ lat: weather.latitude, lon: weather.longitude });
        } else if (cityInput) {
            fetchWeather({ city: cityInput });
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                {isEditingCity ? (
                    <form onSubmit={handleCitySubmit} className="flex-grow">
                        <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-orange-500 text-white text-sm font-semibold focus:outline-none"
                            autoFocus
                            onBlur={handleCitySubmit}
                        />
                    </form>
                ) : (
                    <button onClick={() => setIsEditingCity(true)} className="text-sm font-semibold text-white hover:text-orange-400 truncate">
                        {isDetecting ? 'Detecting...' : (weather?.city || cityInput)}
                    </button>
                )}
                <button onClick={handleRefresh} className={`p-1 ${isLoading ? 'animate-spin' : ''}`} disabled={isLoading}>
                    <RefreshIcon />
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center py-1">
                {isLoading || isDetecting ? (
                    <Spinner className="w-6 h-6 text-white" />
                ) : error ? (
                    <p className="text-rose-400 text-xs text-center">{error}</p>
                ) : weather ? (
                    <div className="flex items-center gap-1">
                        <div className="w-10 h-10 text-white">{<WeatherIcon icon={weather.icon} />}</div>
                        <div>
                            <p className="text-3xl font-bold text-white">{Math.round(weather.temperatureCelsius)}°C</p>
                            <p className="text-gray-300 font-semibold text-xs -mt-1">{weather.condition}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No weather data.</p>
                )}
            </div>
        </div>
    );
};