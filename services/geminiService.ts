import { GenerationResult } from "../components/OutputPanel";
import { blobToBase64 } from "../utils/dataUtils";

// Helper to handle fetch errors and parse the JSON response.
const handleFetchErrors = async (response: Response) => {
  if (!response.ok) {
    // Try to parse a specific error message from the API, otherwise provide a fallback.
    const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
    throw new Error(errorData.error || 'An unknown network error occurred.');
  }
  return response.json();
};

export async function generateProductDescription(productInfo: string, promptTemplate: string, tone: string): Promise<GenerationResult> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productInfo, promptTemplate, tone }),
    });
    
    const data = await handleFetchErrors(response);
    
    // The serverless function now returns the data in the exact format we need.
    return data as GenerationResult;

  } catch (error) {
    console.error("Error calling /api/generate:", error);
    // Re-throw the error so it can be caught and displayed by the UI.
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const base64Audio = await blobToBase64(audioBlob);
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
