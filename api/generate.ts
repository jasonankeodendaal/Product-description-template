import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the structure for grounding metadata from the REST API
interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Main handler for the serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.3 },
        tools: [{ googleSearch: {} }],
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      console.error('Gemini API Error:', errorBody);
      const errorMessage = errorBody.error?.message || 'Failed to fetch from Gemini API';
      return res.status(apiResponse.status).json({ error: errorMessage });
    }

    const data = await apiResponse.json();
    
    // Extract text and sources from the REST API response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const sources: GroundingChunk[] = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.status(200).json({ text, sources });

  } catch (error) {
    console.error('Server-side error in /api/generate:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown server error occurred.' });
  }
}
