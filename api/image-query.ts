
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, base64Image, mimeType } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured.' });
  }
  if (!prompt || !base64Image || !mimeType) {
    return res.status(400).json({ error: 'Missing required parameters: prompt, base64Image, mimeType.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    const text = response.text;
    res.status(200).json({ text });

  } catch (error) {
    console.error('Server-side error in /api/image-query:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    res.status(500).json({ error: errorMessage });
  }
}