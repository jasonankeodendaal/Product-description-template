
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, context } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured.' });
  }
  if (!prompt || !context) {
    return res.status(400).json({ error: 'Missing required parameters: prompt, context.' });
  }
  
  const ai = new GoogleGenAI({ apiKey });

  // Special handling for date/time extraction
  if (prompt.toLowerCase().includes('extract date and time')) {
    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `From the text below, extract the first mentioned specific date and time. Today is ${new Date().toDateString()}. Text: "${context}"`,
          config: {
              temperature: 0,
              responseMimeType: 'application/json',
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      extractedDateTime: {
                          type: Type.STRING,
                          description: 'The extracted date and time as a single, machine-readable ISO 8601 string (e.g., "2024-08-15T14:30:00"). If only a date is found, use T09:00:00 for the time. If only a time is found, use today\'s date. If nothing is found, this should be null.',
                      },
                      certainty: {
                          type: Type.STRING,
                          enum: ['HIGH', 'MEDIUM', 'LOW'],
                          description: 'How certain you are about the extracted date and time.'
                      }
                  }
              },
          },
      });
      const data = JSON.parse(response.text);
      return res.status(200).json(data);

    } catch (error) {
      console.error('Server-side error in /api/ai-action (datetime):', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
      return res.status(500).json({ error: errorMessage });
    }
  }

  // Default action
  const fullPrompt = `${prompt}\n\n---\n\n${context}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.2,
        },
    });
    
    const text = response.text;
    res.status(200).json({ text });

  } catch (error) {
    console.error('Server-side error in /api/ai-action:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    res.status(500).json({ error: errorMessage });
  }
}
