
import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../../constants';
import { 
    Spinner, 
    SunIcon, 
    CloudIcon, 
    RainIcon, 
    SnowIcon, 
    WindIcon, 
    RefreshIcon, 
    ArrowDownIcon, 
    ArrowUpIcon, 
    HumidityIcon 
} from '../icons';

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
    getWeatherInfo: (location: { city?: string; lat?: number; lon?: number }, customApiUrl?: string | null, customApiAuthKey?: string | null) => Promise<WeatherData>;
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
    <div className="flex items-center justify-between text-[10px] sm:text-xs leading-tight">
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 text-gray-400 flex-shrink-0">{icon}</div>
            <span className="font-semibold text-gray-300">{label}:</span>
        </div>
        <span className="font-bold text-white">{value}</span>
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
            const data = await getWeatherInfo(location, siteSettings.customApiEndpoint, siteSettings.customApiAuthKey);
            setWeather(data);
            if (data.city) {
                setCityInput(data.city);
                localStorage.setItem('weather_last_city', data.city);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not fetch weather.');
            setWeather(null);
        } finally {
            setIsLoading(false);
        }
    }, [getWeatherInfo, siteSettings]);
    
    useEffect(() => {
        setIsDetecting(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported.");
            setIsLoading(false);
            setIsDetecting(false);
            const lastCity = localStorage.getItem('weather_last_city');
            if (lastCity) {
                fetchWeather({ city: lastCity });
            }
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather({ lat: latitude, lon: longitude });
                setIsDetecting(false);
            },
            (geoError) => {
                console.warn("Geolocation error:", geoError.message);
                setError("Couldn't detect location. Enter a city.");
                setIsLoading(false);
                setIsDetecting(false);
                const lastCity = localStorage.getItem('weather_last_city');
                 if (lastCity) {
                    setCityInput(lastCity);
                }
            },
            { timeout: 15000, enableHighAccuracy: true }
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
            disabled={!weather}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-1 sm:p-2 h-full shadow-lg border border-white/10 flex flex-col justify-between w-full"
        >
            {/* Header */}
            <div className="flex justify-between items-start flex-shrink-0">
                {isEditingCity ? (
                    <form onSubmit={handleCitySubmit} className="flex-grow">
                        <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-orange-500 text-white text-xs sm:text-sm font-semibold focus:outline-none"
                            autoFocus
                            onBlur={handleCitySubmit}
                        />
                    </form>
                ) : (
                    <button onClick={handleCityEditClick} className="text-xs sm:text-sm font-semibold text-white hover:text-orange-400 truncate text-left">
                        {isDetecting ? 'Detecting...' : (weather?.city || cityInput || 'Set City')}
                    </button>
                )}
                <button onClick={handleRefresh} className={`p-1 ${isLoading ? 'animate-spin' : ''}`} disabled={isLoading}>
                    <RefreshIcon />
                </button>
            </div>

            {/* Main Display */}
            <div className="flex-grow flex flex-col items-center justify-center py-1 overflow-hidden">
                {isLoading || isDetecting ? (
                    <Spinner className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                ) : error && !weather ? (
                    <p className="text-rose-400 text-xs text-center p-1">{error}</p>
                ) : weather ? (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 text-white my-0.5"><WeatherIcon icon={weather.current.icon} /></div>
                        <p className="text-xl sm:text-3xl font-bold text-white">{Math.round(weather.current.temperatureCelsius)}°</p>
                        <p className="text-gray-300 font-semibold text-[11px] sm:text-xs capitalize truncate">{weather.current.condition}</p>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No weather data.</p>
                )}
            </div>

            {/* Details */}
            {weather && weather.forecast[0] && !isLoading && (
                 <div className="flex-shrink-0 space-y-0.5 p-1.5 bg-black/20 rounded-lg">
                    <DetailItem icon={<ArrowUpIcon />} label="High" value={`${Math.round(weather.forecast[0].tempHighCelsius)}°`} />
                    <DetailItem icon={<ArrowDownIcon />} label="Low" value={`${Math.round(weather.forecast[0].tempLowCelsius)}°`} />
                    <DetailItem icon={<WindIcon />} label="Wind" value={`${Math.round(weather.forecast[0].windSpeedKph)}kph`} />
                    <DetailItem icon={<HumidityIcon />} label="Humid" value={`${weather.forecast[0].humidityPercent}%`} />
                 </div>
            )}
        </button>
    );
};
