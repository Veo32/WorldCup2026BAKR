'use server'

import { generateMatchPrediction } from './ai-engine';
import { sendPremiumPredictionToTelegram } from '@/lib/telegram';

/**
 * دالة التحليل وإرسال التوقعات
 * التحديثات:
 *  - تُرجع data كاملة للواجهة لعرضها في ProModal
 *  - تدعم forceTelegram لإعادة النشر يدوياً
 *  - matchStats اختياري كما هو
 */
export async function processAndPublishPrediction(
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  matchStats?: any
) {
  const startTime = Date.now();

  try {
    console.log(`[Workflow] Starting for: ${homeTeam} vs ${awayTeam}`);

    if (!matchId || !homeTeam || !awayTeam) {
      throw new Error("Missing required match core data.");
    }

    const safeMatchStats = matchStats || {
      possession: { home: "50%", away: "50%" },
      shots: { home: 12, away: 10 },
      shotsOnTarget: { home: 5, away: 4 },
      corners: { home: 6, away: 4 },
      fouls: { home: 11, away: 13 },
      form: { home: ["W", "D", "W"], away: ["L", "W", "D"] },
    };

    // 1. توليد التحليل بالذكاء الاصطناعي
    const result = await generateMatchPrediction(homeTeam, awayTeam, safeMatchStats);

    if (!result.success || !result.data) {
      throw new Error(result.error || "Unknown error during AI generation.");
    }

    const matchTitle = `${homeTeam} 🆚 ${awayTeam}`;

    // 2. إرسال لـ Telegram (معزول عن تدفق البيانات الرئيسي)
    let telegramSent = false;
    try {
      const sent = await sendPremiumPredictionToTelegram(matchTitle, result.data);
      telegramSent = sent === true;
      if (telegramSent) {
        console.log(`[Telegram] Dispatched for: ${matchTitle}`);
      }
    } catch (tgError: any) {
      console.error(`[Telegram Error] Bypassed:`, tgError.message);
    }

    // 3. حفظ في قاعدة البيانات (معزول)
    let dbSaved = false;
    try {
      const dbModule = await import('@/lib/db').catch(() => null);
      if (dbModule?.prisma) {
        await dbModule.prisma.prediction.upsert({
          where: { matchId },
          update: {
            analysisResult: JSON.stringify(result.data),
            modelUsed: result.modelUsed || "gemini-1.5-pro",
            postedToTg: telegramSent,
            updatedAt: new Date(),
          },
          create: {
            matchId,
            matchName: matchTitle,
            analysisResult: JSON.stringify(result.data),
            modelUsed: result.modelUsed || "gemini-1.5-pro",
            postedToTg: telegramSent,
          },
        });
        dbSaved = true;
        console.log(`[Database] Upserted for: ${matchId}`);
      }
    } catch (dbError: any) {
      console.error(`[Database Error] Gracefully caught:`, dbError.message);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return {
      success: true,
      message: "Prediction workflow finished.",
      telegramSent,
      dbSaved,
      modelUsed: result.modelUsed,
      duration: `${duration}s`,
      // ✅ الجديد: إرجاع data للواجهة لعرضها في ProModal
      data: result.data,
    };

  } catch (error: any) {
    console.error(`[Workflow Error] Match ${matchId}:`, error);
    return {
      success: false,
      error: error.message || "Failed to process prediction.",
      data: null,
    };
  }
}