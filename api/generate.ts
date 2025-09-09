import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Main handler for the serverless function
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

  const { productInfo, promptTemplate, tone } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY environment variable not found on server.");
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }
  if (!productInfo || !promptTemplate || !tone) {
    return res.status(400).json({ error: 'Missing required parameters: productInfo, promptTemplate, tone.' });
  }

  const toneInstruction = `Adopt a ${tone} tone of voice.`;
  const fullPrompt = `${promptTemplate}\n\n${toneInstruction}\n\n---\nHere is the product information to reformat:\n---\n\n${productInfo}`;
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.3,
            tools: [{ googleSearch: {} }],
        },
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.status(200).json({ text, sources });

  } catch (error) {
    console.error('Server-side error in /api/generate:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    // Check for specific API-related error structures if the SDK provides them
    const statusCode = (error as any)?.status || 500;
    res.status(statusCode).json({ error: errorMessage });
  }
}
