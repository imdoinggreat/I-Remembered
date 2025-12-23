
import { GoogleGenAI, Modality, Type } from "@google/genai";

const USER_KEY_STORAGE = 'user_gemini_api_key';

export const getStoredApiKey = (): string | null => {
  // 1. Priority: Build-time environment variable (For your personal deployment)
  if (process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY.length > 0) {
    return process.env.API_KEY;
  }
  // 2. Fallback: User entered key from LocalStorage (For others using the app)
  return localStorage.getItem(USER_KEY_STORAGE);
};

export const setStoredApiKey = (key: string) => {
  if (!key) {
    localStorage.removeItem(USER_KEY_STORAGE);
  } else {
    localStorage.setItem(USER_KEY_STORAGE, key);
  }
};

const getAIClient = (): GoogleGenAI | null => {
  const key = getStoredApiKey();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

// Optimization for Review Mode: Get better Hook AND Phonetic
export const optimizeCardContent = async (word: string, definition: string): Promise<{ hook: string; phonetic: string } | null> => {
  const ai = getAIClient();
  if (!ai) return { hook: "Error: Please set API Key in Settings", phonetic: "N/A" };

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
      - Make it a "Riddle".
      
      Example for "Abate":
      Phonetic: /əˈbeɪt/
      Hook: "鱼饵 (Bait) 被吃掉后，鱼的饥饿感就... (降低了)。"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phonetic: { type: Type.STRING },
            hook: { type: Type.STRING },
          },
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

// Legacy support wrapper
export const getGeminiInspiration = async (word: string, definition: string): Promise<string> => {
    const result = await optimizeCardContent(word, definition);
    return result ? result.hook : "AI Service Unavailable";
};

// Structured Generation for Batch Import
export const generateCardDetails = async (word: string): Promise<{ definition: string; connectionHook: string; phonetic: string } | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a flashcard for the GRE word: "${word}".
      
      Requirements:
      1. Definition: Concise Chinese definition (max 15 chars).
      2. Phonetic: IPA format (e.g. /tɛst/).
      3. ConnectionHook: A mnemonic hint. **CRITICAL: DO NOT CONTAIN THE WORD "${word}" IN THE HOOK.**
         - Use Chinese + English mix.
         - Use roots, puns, or logic.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            connectionHook: { type: Type.STRING },
          },
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
  if (!ai) return null;

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
  if (!ai) return null;

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
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
