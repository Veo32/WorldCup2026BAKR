'use server'

/**
 * Sends the generated AI sports analysis directly to a user or the premium Telegram channel.
 * @param matchTitle - The name of the match (e.g., "Paraguay vs United States")
 * @param aiAnalysis - The JSON data parsed from Gemini engine containing winProbability, bettingAdvice, and keyPlayer
 * @param targetChatId - Optional: Send to a specific user Chat ID. If omitted, defaults to PREMIUM_CHANNEL_ID.
 */
export async function sendPremiumPredictionToTelegram(matchTitle: string, aiAnalysis: any, targetChatId?: string | number) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHANNEL_ID = process.env.TELEGRAM_PREMIUM_CHANNEL_ID;

  // حماية إضافية: التأكد من أن الرموز موجودة وليست الرموز الافتراضية المؤقتة
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN_HERE") {
    console.error("🛑 Telegram Error: Invalid or missing BOT_TOKEN. Please update your .env file with the real token from BotFather.");
    return false;
  }

  // تحديد الوجهة: إما للمستخدم مباشرة أو للقناة كخيار افتراضي
  const finalChatId = targetChatId || CHANNEL_ID;

  if (!finalChatId) {
    console.error("🛑 Telegram Error: No target chat_id or channel_id provided.");
    return false;
  }

  const message = `
🌟 **تحليل BAKR DASH الحصري (Pro)** 🌟
⚽ **المباراة:** ${matchTitle}

📊 **احتماليات الفوز:**
${aiAnalysis.winProbability || 'جاري الحساب...'}

💡 **نصيحة التوقع المتقدم:**
${aiAnalysis.bettingAdvice || 'جاري التحليل...'}

🔥 **نجم المباراة المتوقع:** ${aiAnalysis.keyPlayer || 'جاري الاختيار...'}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: finalChatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("🛑 Telegram API Response Error:", errorData);
      return false;
    }

    console.log(`✅ [Telegram] Message dispatched successfully to: ${finalChatId} for ${matchTitle}`);
    return true; 

  } catch (error) {
    console.error("🛑 Telegram Network/API Error:", error);
    return false;
  }
}