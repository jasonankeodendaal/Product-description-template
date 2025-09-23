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

  const { city } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }
  if (!city) {
    return res.status(400).json({ error: 'Missing required parameter: city.' });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Get the current weather for ${city}.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    city: { type: Type.STRING },
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
    console.error(`Server-side error in /api/weather for city "${city}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred while fetching weather data.';
    res.status(500).json({ error: errorMessage });
  }
}