'use server'

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// استخدام 'any' لتجاوز خطأ التوافق الصارم في TypeScript، الهيكل الفعلي صحيح لـ Gemini
const responseSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    winProbability: { type: SchemaType.STRING },
    predictedScore: { type: SchemaType.STRING }, 
    tacticalKey: { type: SchemaType.STRING },    
    bettingAdvice: { type: SchemaType.STRING },
    keyPlayer: { type: SchemaType.STRING },
  },
  required: ["winProbability", "predictedScore", "tacticalKey", "bettingAdvice", "keyPlayer"],
};

async function callGeminiModel(modelName: string, prompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: modelName, 
    generationConfig: { 
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.35, 
    }
  });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateMatchPrediction(homeTeam: string, awayTeam: string, matchStats: any) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    const prompt = `
      You are an expert football sports analyst. Analyze the upcoming match between ${homeTeam} and ${awayTeam} in the 2026 World Cup.
      Data: ${JSON.stringify(matchStats)}
      
      Instructions for Output:
      1. The values (content) MUST be written in professional, high-quality Arabic suitable for premium VIP subscribers.
      2. CRUCIAL: Absolutely do NOT use the word "رهان" (betting) or any gambling-related terms in the Arabic text. Instead, frame the analysis around "التوقع المتقدم" (advanced prediction), tactics, and sports analytics.
      
      Expected Content Guidelines for each key:
      - winProbability: Win, loss, and draw percentages with a detailed professional analysis in Arabic.
      - predictedScore: Exact expected final score (e.g., 2-1 or 1-0) based on offensive and defensive capabilities.
      - tacticalKey: Deep tactical analysis of how both managers will set up their midfield/defense.
      - bettingAdvice: Exclusive advanced prediction advice (التوقع المتقدم) for Pro subscribers based on tactical playstyle, historical stats, and expected workflow in Arabic.
      - keyPlayer: The expected key star player of the match and the technical reasons why in Arabic.
    `;

    const fallbackModels = [
      process.env.GEMINI_PRIMARY_MODEL || 'gemini-3.1-pro-preview',
      process.env.GEMINI_SECONDARY_MODEL || 'gemini-2.5-pro',
      process.env.GEMINI_TERTIARY_MODEL || 'gemini-3.1-flash-preview',
      process.env.GEMINI_QUATERNARY_MODEL || 'gemini-3.5-flash',
      process.env.GEMINI_QUINARY_MODEL || 'gemini-3-flash-preview',
      process.env.GEMINI_SENARY_MODEL || 'gemini-2.5-flash',
      process.env.GEMINI_SEPTENARY_MODEL || 'gemini-flash-latest'
    ];

    let lastError: any = null;

    for (const modelName of fallbackModels) {
      try {
        console.log(`[AI-Engine] Attempting generation with ${modelName}...`);
        const text = await callGeminiModel(modelName, prompt);
        
        return { success: true, data: JSON.parse(text), modelUsed: modelName };
      } catch (error: any) {
        console.warn(`[AI-Engine Warning] ${modelName} failed or rate-limited:`, error.message || error);
        lastError = error;
      }
    }

    throw new Error(`All 7 Gemini models exhausted or rate-limited. Last error: ${lastError?.message || "Unknown"}`);

  } catch (error: any) {
    console.error("AI Engine Absolute Error:", error);
    return { success: false, error: error.message || "Failed to generate prediction" };
  }
}