
import { GoogleGenAI, Modality, Type } from "@google/genai";

/**
 * Initialize the GoogleGenAI client.
 */
const getAIClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const optimizeCardContent = async (word: string, definition: string): Promise<{ hook: string; phonetic: string } | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Target Word: "${word}" (Meaning: ${definition}).
      
      Task: 
      1. Provide the IPA Phonetic transcription (e.g., /wɜːd/).
      2. Provide a "Connection Hook" (Mnemonic).
      
      Hook Rules:
      - **DO NOT** include the target word ("${word}") itself in the hook.
      - Use Chinese + English mix.
      - Use etymology, puns, or vivid imagery.
      - Make it a "Riddle".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phonetic: { type: Type.STRING },
            hook: { type: Type.STRING },
          },
          required: ["phonetic", "hook"]
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Optimize Error:", error);
    return null;
  }
};

export const getGeminiInspiration = async (word: string, definition: string): Promise<string> => {
    const result = await optimizeCardContent(word, definition);
    return result ? result.hook : "AI Service Unavailable";
};

export const generateCardDetails = async (word: string): Promise<{ definition: string; connectionHook: string; phonetic: string } | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a flashcard for the GRE word: "${word}".
      
      Requirements:
      1. Definition: Concise Chinese definition (max 15 chars).
      2. Phonetic: IPA format (e.g. /tɛst/).
      3. ConnectionHook: A mnemonic hint. **CRITICAL: DO NOT CONTAIN THE WORD "${word}" IN THE HOOK.**`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            connectionHook: { type: Type.STRING },
          },
          required: ["definition", "phonetic", "connectionHook"]
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Batch Gen Error:", error);
    return null;
  }
};

export const generateMnemonicImage = async (word: string, definition: string): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Draw a simple, minimalist, black and white manga-style sketch to represent the concept: "${definition}". NO TEXT inside the image. White background.`
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};

export const generatePronunciation = async (word: string): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: word }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return data ?? null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
