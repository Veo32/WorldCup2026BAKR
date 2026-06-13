import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. تجميع المفاتيح المتاحة في مصفوفة
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_BACKUP_1,
  process.env.GEMINI_API_KEY_BACKUP_2
].filter(Boolean) as string[];

// 2. تجميع الموديلات وترتيبها حسب الأولوية
const GEMINI_MODELS = [
  process.env.GEMINI_PRIMARY_MODEL || "gemini-1.5-flash",
  process.env.GEMINI_SECONDARY_MODEL || "gemini-1.5-pro",
  process.env.GEMINI_TERTIARY_MODEL || "gemini-flash-latest"
];

export async function generateMatchAnalysis(prompt: string): Promise<string> {
  // دوران على الموديلات بالترتيب (Fallback Chain)
  for (const modelName of GEMINI_MODELS) {
    // دوران على المفاتيح المتاحة لكل موديل
    for (let keyIndex = 0; keyIndex < GEMINI_KEYS.length; keyIndex++) {
      const currentKey = GEMINI_KEYS[keyIndex];
      
      try {
        console.log(`🤖 [AI Engine] Trying Model: ${modelName} with Key Index: ${keyIndex}`);
        
        // تهيئة الـ Client باستخدام المكتبة الرسمية
        const genAI = new GoogleGenerativeAI(currentKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // تنفيذ الطلب
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
          console.log(`✅ [AI Engine] Success using Model: ${modelName} (Key Index: ${keyIndex})`);
          return text;
        }
      } catch (error: any) {
        // رصد أخطاء الكوتا (429) أو أخطاء الاستخدام
        const errorMessage = error?.message || '';
        const isQuotaError = errorMessage.includes('429') || errorMessage.includes('Quota');
        
        console.warn(
          `⚠️ [AI Engine Warning] Failed with Model ${modelName} & Key Index ${keyIndex}. ` +
          `Reason: ${errorMessage}`
        );

        // إذا كان خطأ كوتا، نجرب المفتاح التالي لنفس الموديل
        if (isQuotaError && keyIndex < GEMINI_KEYS.length - 1) {
          console.log(`🔄 [Quota Exceeded] Switching to Backup Key [${keyIndex + 1}]...`);
          continue; 
        }
      }
    }
    console.log(`⏭️ [Model Exhausted] All keys failed for ${modelName}. Moving to next model...`);
  }

  throw new Error("🚨 [AI Engine Fatal] All Gemini models and backup keys have been exhausted.");
}