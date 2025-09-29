import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../../constants';
import { Spinner } from '../icons/Spinner';
import { SunIcon } from '../icons/SunIcon';
import { CloudIcon } from '../icons/CloudIcon';
import { RainIcon } from '../icons/RainIcon';
import { SnowIcon } from '../icons/SnowIcon';
import { WindIcon } from '../icons/WindIcon';
import { RefreshIcon } from '../icons/RefreshIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { HumidityIcon } from '../icons/HumidityIcon';

interface DailyForecast {
    date: string;
    tempHighCelsius: number;
    tempLowCelsius: number;
    condition: string;
    windSpeedKph: number;
    windDirection: string;
    humidityPercent: number;
    icon: 'SUNNY' | 'CLOUDY' | 'PARTLY_CLOUDY' | 'RAIN' | 'SNOW' | 'WIND' | 'FOG' | 'STORM' | 'UNKNOWN';
}

export interface WeatherData {
    city: string;
    latitude: number;
    longitude: number;
    current: {
        temperatureCelsius: number;
        feelsLikeCelsius: number;
        condition: string;
        icon: DailyForecast['icon'];
    };
    forecast: DailyForecast[];
}


interface WeatherWidgetProps {
    getWeatherInfo: (location: { city?: string; lat?: number; lon?: number }) => Promise<WeatherData>;
    siteSettings: SiteSettings;
    onOpenForecast: (data: WeatherData) => void;
}

export const WeatherIcon: React.FC<{ icon: WeatherData['current']['icon'], className?: string }> = ({ icon, className = "h-full w-full" }) => {
    switch (icon) {
        case 'SUNNY': return <SunIcon className={className} />;
        case 'CLOUDY': return <CloudIcon isConnected={false} className={className}/>;
        case 'PARTLY_CLOUDY': return <CloudIcon isConnected={false} className={className}/>;
        case 'RAIN': return <RainIcon className={className}/>;
        case 'SNOW': return <SnowIcon className={className}/>;
        case 'WIND': return <WindIcon className={className}/>;
        default: return <SunIcon className={className}/>;
    }
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 text-xs">
        <div className="w-4 h-4 text-gray-400">{icon}</div>
        <span className="font-semibold text-gray-300">{label}:</span>
        <span className="font-bold text-white ml-auto">{value}</span>
    </div>
);


export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ getWeatherInfo, siteSettings, onOpenForecast }) => {
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
    
    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (weather?.latitude && weather?.longitude) {
            fetchWeather({ lat: weather.latitude, lon: weather.longitude });
        } else if (cityInput) {
            fetchWeather({ city: cityInput });
        }
    };
    
    const handleCityEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingCity(true);
    }

    return (
        <button
            onClick={() => weather && onOpenForecast(weather)}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 h-full shadow-lg border border-white/10 flex flex-col justify-between w-full"
        >
            {/* Header */}
            <div className="flex justify-between items-start flex-shrink-0">
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
                    <button onClick={handleCityEditClick} className="text-sm font-semibold text-white hover:text-orange-400 truncate text-left">
                        {isDetecting ? 'Detecting...' : (weather?.city || cityInput)}
                    </button>
                )}
                <button onClick={handleRefresh} className={`p-1 ${isLoading ? 'animate-spin' : ''}`} disabled={isLoading}>
                    <RefreshIcon />
                </button>
            </div>

            {/* Main Display */}
            <div className="flex-grow flex flex-col items-center justify-center py-1">
                {isLoading || isDetecting ? (
                    <Spinner className="w-8 h-8 text-white" />
                ) : error ? (
                    <p className="text-rose-400 text-xs text-center p-4">{error}</p>
                ) : weather ? (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-16 h-16 text-white my-1"><WeatherIcon icon={weather.current.icon} /></div>
                        <p className="text-5xl font-bold text-white">{Math.round(weather.current.temperatureCelsius)}°</p>
                        <p className="text-gray-300 font-semibold text-sm capitalize">{weather.current.condition}</p>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No weather data.</p>
                )}
            </div>

            {/* Details */}
            {weather && weather.forecast[0] && !isLoading && (
                 <div className="flex-shrink-0 space-y-2 p-2 bg-black/20 rounded-lg">
                    <DetailItem icon={<ArrowUpIcon />} label="High" value={`${Math.round(weather.forecast[0].tempHighCelsius)}°`} />
                    <DetailItem icon={<ArrowDownIcon />} label="Low" value={`${Math.round(weather.forecast[0].tempLowCelsius)}°`} />
                    <DetailItem icon={<WindIcon />} label="Wind" value={`${Math.round(weather.forecast[0].windSpeedKph)} kph`} />
                    <DetailItem icon={<HumidityIcon />} label="Humidity" value={`${weather.forecast[0].humidityPercent}%`} />
                 </div>
            )}
        </button>
    );
};