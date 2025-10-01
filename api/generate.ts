
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Switch to streaming API to improve perceived latency
    const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.3,
            tools: [{ googleSearch: {} }],
            // Removed thinkingConfig to re-enable thinking for higher quality output.
        },
    });
    
    // Set headers for a streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let finalResponse;
    for await (const chunk of stream) {
        if(chunk.text) {
          res.write(chunk.text);
        }
        finalResponse = chunk; // Keep the last response to access metadata
    }
    
    const sources = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // To send sources after the text stream, we use a unique delimiter.
    // The client will parse this to separate the text from the metadata.
    if (sources.length > 0) {
        const delimiter = '\n<--SOURCES-->\n';
        res.write(delimiter);
        res.write(JSON.stringify(sources));
    }

    res.end();

  } catch (error) {
    console.error('Server-side error in /api/generate:', error);
    // If headers haven't been sent, we can still send a proper JSON error response.
    if (!res.headersSent) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        const statusCode = (error as any)?.status || 500;
        res.status(statusCode).json({ error: errorMessage });
    } else {
        // If headers are already sent (mid-stream), we just have to end the response.
        res.end();
    }
  }
}
