import { GoogleGenAI } from '@google/genai'; // أو المكتبة التي تستخدمها حالياً لـ Gemini

// 1. تجميع المفاتيح المتاحة في مصفوفة (تنظيف القيم الفارغة)
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_BACKUP_1,
  process.env.GEMINI_API_KEY_BACKUP_2
].filter(Boolean) as string[];

// 2. تجميع الموديلات وترتيبها حسب الأولوية
const GEMINI_MODELS = [
  process.env.GEMINI_PRIMARY_MODEL || "gemini-1.5-pro",
  process.env.GEMINI_SECONDARY_MODEL || "gemini-2.5-flash",
  process.env.GEMINI_TERTIARY_MODEL || "gemini-1.5-flash"
];

export async function generateMatchAnalysis(prompt: string): Promise<string> {
  // دوران على الموديلات بالترتيب (Fallback Chain)
  for (const model of GEMINI_MODELS) {
    // دوران على المفاتيح المتاحة لكل موديل قبل الاستسلام للـ Quota
    for (let keyIndex = 0; keyIndex < GEMINI_KEYS.length; keyIndex++) {
      const currentKey = GEMINI_KEYS[keyIndex];
      
      try {
        console.log(`🤖 [AI Engine] Trying Model: ${model} with Key Index: ${keyIndex}`);
        
        // تهيئة الـ Client بالمفتاح الحالي
        const ai = new GoogleGenAI({ apiKey: currentKey });
        
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });

        if (response && response.text) {
          console.log(`✅ [AI Engine] Success using Model: ${model} (Key Index: ${keyIndex})`);
          return response.text;
        }
      } catch (error: any) {
        // رصد أخطاء الكوتا (429) أو انتهاء الصلاحية
        const isQuotaError = error?.status === 429 || error?.message?.includes('Quota');
        
        console.warn(
          `⚠️ [AI Engine Warning] Failed with Model ${model} & Key Index ${keyIndex}. ` +
          `Reason: ${error?.message || 'Unknown Error'}`
        );

        if (isQuotaError && keyIndex < GEMINI_KEYS.length - 1) {
          console.log(`🔄 [Quota Exceeded] Switching to Backup Key [${keyIndex + 1}]...`);
          continue; // تجربة المفتاح التالي لنفس الموديل
        }
      }
    }
    console.log(`⏭️ [Model Exhausted] All keys failed for ${model}. Moving to next model in chain...`);
  }

  throw new Error("🚨 [AI Engine Fatal] All Gemini models and backup keys have been exhausted.");
}