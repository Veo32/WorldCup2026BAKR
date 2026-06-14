import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { prisma } from '../../lib/db'; 
import { sendPremiumPredictionToTelegram } from '../../lib/telegram'; 

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
// 🔗 رابط منتج Gumroad الأساسي الخاص بك
const GUMROAD_PRODUCT_URL = process.env.GUMROAD_PRODUCT_URL || "https://bakr.gumroad.com/l/pro-analysis"; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { user, matchId } = req.body;

    if (!user) {
      return res.status(400).json({ success: false, error: 'بيانات المستخدم مفقودة.' });
    }

    // 1. التحقق الأمني الرسمي من تليجرام
    if (!verifyTelegramAuth(user)) {
      return res.status(400).json({ success: false, error: 'فشل التحقق الأمني من البيانات الشخصية.' });
    }

    const telegramChatId = String(user.id);

    // 2. الفحص الديناميكي: هل توجد عملية شراء ناجحة مسجلة لهذا الـ Chat ID في جدول الـ Transaction؟
    // ملحوظة: سنبحث في الحقول النصية أو نتحقق من وجود المعرف
    let hasPaid = false;

    if (prisma) {
      // سنبحث في جدول العمليات الحالي لديك لمعرفة ما إذا كان هذا المستخدم قد اشترى سابقاً
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          OR: [
            { gumroadSaleId: `tg-${telegramChatId}` }, // تنسيق معرف مخصص سنستخدمه عند الدفع
            { productName: { contains: telegramChatId } } // أو كجزء من اسم المنتج كحل مؤقت بدون تعديل جداول
          ]
        }
      });

      if (existingTransaction) {
        hasPaid = true;
      }
    }

    // إذا كان المستخدم قد دفع بالفعل ومسجل في الداتا بيز
    if (hasPaid) {
      let matchTitle = "Match Analysis";
      let aiAnalysis = {
        winProbability: "جاري حساب الاحتمالات...",
        bettingAdvice: "توقع مخصص للمشتركين.",
        keyPlayer: "معلومات اللاعبين"
      };

      if (prisma) {
        const prediction = await prisma.prediction.findUnique({
          where: { matchId: matchId }
        });
        if (prediction) {
          matchTitle = prediction.matchName;
          aiAnalysis = {
            winProbability: "تحليل احترافي متكامل متوفر",
            bettingAdvice: prediction.analysisResult,
            keyPlayer: "متاح داخل التقرير الكامل"
          };
        }
      }

      const sent = await sendPremiumPredictionToTelegram(matchTitle, aiAnalysis, telegramChatId);
      
      if (sent) {
        return res.status(200).json({ success: true, message: 'تم إرسال التحليل الاحترافي إلى حسابك بنجاح.' });
      } else {
        return res.status(500).json({ success: false, error: 'فشل إرسال التحليل. تأكد من عمل Start للبوت.' });
      }
    } else {
      
      // 3. إذا لم يقم بالشراء، نوجهه لصفحة الدفع على Gumroad ممررين الـ Chat ID كـ معامل مخصص
      const gumroadCheckoutUrl = `${GUMROAD_PRODUCT_URL}?custom_fields[telegram_chat_id]=${telegramChatId}`;
      
      // 🌟 العبارة السحرية التحفيزية
      const magicMessage = "باقي خطوة واحدة تفصلك عن كشف أسرار المواجهة! انضم إلى باقة الـ Pro الآن واحصل على التحليلات التكتيكية العميقة والتوقعات الحية مباشرة على حسابك في تليجرام فور إتمام الدفع. لا تدع الفرصة تفوتك!";

      return res.status(200).json({ 
        redirectToPayment: true, 
        stripeUrl: gumroadCheckoutUrl, 
        message: magicMessage
      });
    }

  } catch (error) {
    console.error("🛑 Serverless Auth Route Error:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

function verifyTelegramAuth(authData: any) {
  const { hash, ...dataToCheck } = authData;
  
  const dataCheckString = Object.keys(dataToCheck)
    .sort()
    .map((key) => `${key}=${dataToCheck[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}