import { GoogleGenAI, GroundingChunk } from "@google/genai";
import { GenerationResult } from "../components/OutputPanel";
import { blobToBase64 } from "../utils/dataUtils";

// Lazy initialization of the GoogleGenAI instance
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        // This will throw a specific, user-friendly error if the API key is missing.
        // This is the most common issue on deployment.
        if (!process.env.API_KEY) {
             throw new Error("API Key not found. Please ensure the API_KEY environment variable is configured in your deployment settings.");
        }
        try {
            ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } catch (e) {
            // Catch other potential initialization errors from the library
            console.error("GoogleGenAI initialization failed:", e);
            throw new Error("Failed to initialize the AI Client. Please check the console for more details.");
        }
    }
    return ai;
};


export async function generateProductDescription(productInfo: string, promptTemplate: string, tone: string): Promise<GenerationResult> {
  const toneInstruction = `Adopt a ${tone} tone of voice.`;
  const fullPrompt = `${promptTemplate}\n\n${toneInstruction}\n\n---\nHere is the product information to reformat:\n---\n\n${productInfo}`;

  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        temperature: 0.3, // Slightly increased for tonal variation
        tools: [{googleSearch: {}}],
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from the API.");
    }
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

    return { text, sources };

  } catch (error) {
    console.error("Error generating product description:", error);
    // Re-throw the error so it can be caught and displayed by the calling component (App.tsx)
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const base64Audio = await blobToBase64(audioBlob);
  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: "Transcribe the following audio recording accurately." },
          {
            inlineData: {
              mimeType: audioBlob.type,
              data: base64Audio,
            },
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty transcription from the API.");
    }
    return text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    // Re-throw for the UI
    throw error;
  }
}