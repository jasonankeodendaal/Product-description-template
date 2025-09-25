import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Authentication Check
  if (process.env.API_SECRET_KEY) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
          return res.status(401).json({ error: 'Unauthorized' });
      }
  }

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
  
  const fullPrompt = `${prompt}\n\n---\n\n${context}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
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