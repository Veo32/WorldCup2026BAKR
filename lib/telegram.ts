'use server'

/**
 * Sends the generated AI sports analysis directly to the premium Telegram channel.
 * @param matchTitle - The name of the match (e.g., "Paraguay vs United States")
 * @param aiAnalysis - The JSON data parsed from Gemini engine containing winProbability, bettingAdvice, and keyPlayer
 */
export async function sendPremiumPredictionToTelegram(matchTitle: string, aiAnalysis: any) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHANNEL_ID = process.env.TELEGRAM_PREMIUM_CHANNEL_ID;

  // حماية إضافية: التأكد من أن الرموز موجودة وليست الرموز الافتراضية المؤقتة
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN_HERE" || !CHANNEL_ID) {
    console.error("🛑 Telegram Error: Invalid or missing BOT_TOKEN. Please update your .env file with the real token from BotFather.");
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
    // الرابط الصحيح مع كلمة bot مدمجة
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("🛑 Telegram API Response Error:", errorData);
      return false; // إرجاع false صريحة لإيقاف رسالة "تم الإرسال بنجاح" الوهمية
    }

    console.log(`✅ [Telegram] VIP Notification dispatched successfully for: ${matchTitle}`);
    return true; 

  } catch (error) {
    console.error("🛑 Telegram Network/API Error:", error);
    return false;
  }
}