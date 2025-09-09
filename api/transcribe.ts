import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Transcribe the following audio recording accurately." },
            { inlineData: { mimeType, data: base64Audio } }
          ]
        }]
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      console.error('Gemini API Error:', errorBody);
      const errorMessage = errorBody.error?.message || 'Failed to fetch from Gemini API';
      return res.status(apiResponse.status).json({ error: errorMessage });
    }

    const data = await apiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return res.status(500).json({ error: "Received an empty transcription from the API." });
    }

    res.status(200).json({ transcript: text });

  } catch (error) {
    console.error('Server-side error in /api/transcribe:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown server error occurred.' });
  }
}
