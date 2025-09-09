import { GenerationResult } from "../components/OutputPanel";
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
    customApiAuthKey?: string | null
): Promise<GenerationResult> {
  try {
    const baseUrl = customApiUrl || '';
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: getHeaders(customApiAuthKey),
      body: JSON.stringify({ productInfo, promptTemplate, tone }),
    });
    
    const data = await handleFetchErrors(response);
    return data as GenerationResult;

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
