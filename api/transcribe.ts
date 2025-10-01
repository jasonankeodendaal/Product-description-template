
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64Audio, mimeType } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY environment variable not found on server.");
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }
  if (!base64Audio || !mimeType) {
    return res.status(400).json({ error: 'Missing required parameters: base64Audio, mimeType.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };
    const textPart = {
      text: "Transcribe the following audio recording accurately.",
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, audioPart] },
    });

    const transcript = response.text;

    if (!transcript) {
      return res.status(500).json({ error: "Received an empty transcription from the API." });
    }

    res.status(200).json({ transcript });

  } catch (error) {
    console.error('Server-side error in /api/transcribe:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    const statusCode = (error as any)?.status || 500;
    res.status(statusCode).json({ error: errorMessage });
  }
}
