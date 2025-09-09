import { GoogleGenAI, GroundingChunk } from "@google/genai";
import { GenerationResult } from "../components/OutputPanel";
import { blobToBase64 } from "../utils/dataUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateProductDescription(productInfo: string, promptTemplate: string, tone: string): Promise<GenerationResult> {
  const toneInstruction = `Adopt a ${tone} tone of voice.`;
  const fullPrompt = `${promptTemplate}\n\n${toneInstruction}\n\n---\nHere is the product information to reformat:\n---\n\n${productInfo}`;

  try {
    const response = await ai.models.generateContent({
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
    throw new Error("Failed to generate description. Please check the console for details.");
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const base64Audio = await blobToBase64(audioBlob);
  try {
    const response = await ai.models.generateContent({
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
    throw new Error("Failed to transcribe audio. The model may not support this audio format or the content may be inaudible.");
  }
}
