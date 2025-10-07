
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { location, forecastDays } = req.body as { location: { city?: string; lat?: number; lon?: number }, forecastDays?: number };
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }
  if (!location || (!location.city && !(location.lat && location.lon))) {
    return res.status(400).json({ error: 'Missing required location parameter: city or lat/lon.' });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = location.lat && location.lon
        ? `Get the current weather and a ${forecastDays || 1}-day forecast for latitude ${location.lat} and longitude ${location.lon}. Include the city name. The forecast should start from today.`
        : `Get the current weather and a ${forecastDays || 1}-day forecast for ${location.city}. The forecast should start from today.`;
        
    const dailyForecastSchema = {
        type: Type.OBJECT,
        properties: {
            date: { type: Type.STRING, description: 'The date for this forecast day in YYYY-MM-DD format.' },
            tempHighCelsius: { type: Type.NUMBER },
            tempLowCelsius: { type: Type.NUMBER },
            condition: { type: Type.STRING },
            windSpeedKph: { type: Type.NUMBER },
            windDirection: { type: Type.STRING },
            humidityPercent: { type: Type.NUMBER },
            icon: { 
                type: Type.STRING,
                enum: ['SUNNY', 'CLOUDY', 'PARTLY_CLOUDY', 'RAIN', 'SNOW', 'WIND', 'FOG', 'STORM', 'UNKNOWN'],
            },
        }
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            city: { type: Type.STRING },
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
            current: {
                type: Type.OBJECT,
                properties: {
                    temperatureCelsius: { type: Type.NUMBER },
                    feelsLikeCelsius: { type: Type.NUMBER },
                    condition: { type: Type.STRING },
                    icon: { type: Type.STRING, enum: ['SUNNY', 'CLOUDY', 'PARTLY_CLOUDY', 'RAIN', 'SNOW', 'WIND', 'FOG', 'STORM', 'UNKNOWN'] },
                }
            },
            forecast: {
                type: Type.ARRAY,
                items: dailyForecastSchema,
                description: `An array of daily forecast objects for the next ${forecastDays || 1} days, starting with today.`
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });

    // FIX: Added .trim() to prevent JSON parsing errors from leading/trailing whitespace from the AI response.
    const weatherData = JSON.parse(response.text.trim());
    res.status(200).json(weatherData);

  } catch (error) {
    console.error(`Server-side error in /api/weather for location "${JSON.stringify(location)}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred while fetching weather data.';
    res.status(500).json({ error: errorMessage });
  }
}