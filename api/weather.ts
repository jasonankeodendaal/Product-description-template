import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Authentication Check
  if (process.env.API_SECRET_KEY) {
      const authHeader = req.headers.authorization;
      const expectedAuthKey = `Bearer ${process.env.API_SECRET_KEY}`;
      if (authHeader !== expectedAuthKey) {
          return res.status(401).json({ error: 'Unauthorized' });
      }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { location } = req.body as { location: { city?: string; lat?: number; lon?: number } };
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
        ? `Get the current weather for latitude ${location.lat} and longitude ${location.lon}. Also include the city name.`
        : `Get the current weather for ${location.city}.`;
        
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    city: { type: Type.STRING },
                    latitude: { type: Type.NUMBER },
                    longitude: { type: Type.NUMBER },
                    temperatureCelsius: { type: Type.NUMBER },
                    condition: { type: Type.STRING },
                    icon: { 
                        type: Type.STRING,
                        enum: ['SUNNY', 'CLOUDY', 'PARTLY_CLOUDY', 'RAIN', 'SNOW', 'WIND', 'FOG', 'STORM', 'UNKNOWN'],
                    },
                }
            }
        },
    });

    const weatherData = JSON.parse(response.text);
    res.status(200).json(weatherData);

  } catch (error) {
    console.error(`Server-side error in /api/weather for location "${JSON.stringify(location)}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred while fetching weather data.';
    res.status(500).json({ error: errorMessage });
  }
}