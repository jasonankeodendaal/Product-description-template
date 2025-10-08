

import type { GenerationResult, GroundingChunk } from "../src/types";
import { blobToBase64 } from "../utils/dataUtils";

// Helper to handle fetch errors and parse the JSON response.
const handleFetchErrors = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
    throw new Error(errorData.error || 'An unknown network error occurred.');
  }
  return response.json();
};

const getHeaders = (customApiAuthKey?: string | null): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (customApiAuthKey) {
        headers['Authorization'] = `Bearer ${customApiAuthKey}`;
    }
    return headers;
}

export async function generateProductDescription(
    productInfo: string, 
    promptTemplate: string, 
    tone: string, 
    customApiUrl?: string | null, 
    customApiAuthKey?: string | null,
    onUpdate?: (partialResult: GenerationResult) => void, // Add callback for streaming updates
): Promise<GenerationResult> {
  try {
    const baseUrl = customApiUrl || '';
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: getHeaders(customApiAuthKey),
      body: JSON.stringify({ productInfo, promptTemplate, tone }),
    });
    
    if (!response.ok) {
      // Handle initial error before streaming starts
      const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      throw new Error(errorData.error || 'An unknown network error occurred.');
    }
    
    if (!response.body) {
        throw new Error("The response from the server is empty.");
    }
    
    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponseText = '';
    
    while(true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fullResponseText += decoder.decode(value, { stream: true });
        
        // Provide real-time updates of the text as it arrives.
        // We don't have the sources yet, so we pass an empty array.
        if(onUpdate) {
            onUpdate({ text: fullResponseText, sources: [] });
        }
    }
    
    // Now that the stream is complete, parse the full response for text and sources
    let text = fullResponseText;
    let sources: GroundingChunk[] = [];
    const delimiter = '\n<--SOURCES-->\n';

    if (fullResponseText.includes(delimiter)) {
        const parts = fullResponseText.split(delimiter);
        text = parts[0];
        try {
            sources = JSON.parse(parts[1]);
        } catch (e) {
            console.error("Failed to parse sources from stream:", e);
            // The text is still valid, so we can proceed without sources.
        }
    }

    const finalResult = { text, sources };
    // Provide a final update with the sources included
    if(onUpdate) {
        onUpdate(finalResult);
    }
    
    return finalResult;

  } catch (error) {
    console.error("Error calling /api/generate:", error);
    throw error;
  }
}

export async function transcribeAudio(
    audioBlob: Blob, 
    customApiUrl?: string | null,
    customApiAuthKey?: string | null
): Promise<string> {
  const base64Audio = await blobToBase64(audioBlob);
  try {
    const baseUrl = customApiUrl || '';
    const response = await fetch(`${baseUrl}/api/transcribe`, {
      method: 'POST',
      headers: getHeaders(customApiAuthKey),
      body: JSON.stringify({ base64Audio, mimeType: audioBlob.type }),
    });

    const data = await handleFetchErrors(response);

    if (!data.transcript) {
      throw new Error("Received an empty transcription from the backend.");
    }
    return data.transcript;

  } catch (error) {
    console.error("Error calling /api/transcribe:", error);
    throw error;
  }
}

export async function describeImage(
    imageBlob: Blob,
    prompt: string,
    customApiUrl?: string | null,
    customApiAuthKey?: string | null
): Promise<string> {
    const base64Image = await blobToBase64(imageBlob);
    try {
        const baseUrl = customApiUrl || '';
        const response = await fetch(`${baseUrl}/api/image-query`, {
            method: 'POST',
            headers: getHeaders(customApiAuthKey),
            body: JSON.stringify({ base64Image, mimeType: imageBlob.type, prompt }),
        });
        const data = await handleFetchErrors(response);
        if (!data.text) {
            throw new Error("Received an empty description from the backend.");
        }
        return data.text;
    } catch (error) {
        console.error("Error calling /api/image-query:", error);
        throw error;
    }
}

export async function performAiAction(
    prompt: string,
    context: string,
    customApiUrl?: string | null,
    customApiAuthKey?: string | null
): Promise<any> { // Return type is now any to support different JSON structures
     try {
        const baseUrl = customApiUrl || '';
        const response = await fetch(`${baseUrl}/api/ai-action`, {
            method: 'POST',
            headers: getHeaders(customApiAuthKey),
            body: JSON.stringify({ prompt, context }),
        });
        return await handleFetchErrors(response);
    } catch (error) {
        console.error("Error calling /api/ai-action:", error);
        throw error;
    }
}

export async function getWeatherInfo(
    location: { city?: string; lat?: number; lon?: number },
    customApiUrl?: string | null,
    customApiAuthKey?: string | null
): Promise<any> {
    try {
        const baseUrl = customApiUrl || '';
        const response = await fetch(`${baseUrl}/api/weather`, {
            method: 'POST',
            headers: getHeaders(customApiAuthKey),
            body: JSON.stringify({ location, forecastDays: 7 }), // Always fetch 7-day forecast
        });
        return await handleFetchErrors(response);
    } catch (error) {
        console.error("Error calling /api/weather:", error);
        throw error;
    }
}
