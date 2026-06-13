import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    const buyerEmail = body.email;
    const gumroadSaleId = body.sale_id;
    const productName = body.product_name;
    const pricePaid = parseFloat(body.price) / 100;

    // استخراج معرف التليجرام المرسل من العميل
    const telegramChatId = body.custom_fields?.telegram_chat_id;

    console.log(`💰 Gumroad Webhook Received: Sale ID ${gumroadSaleId} for ${buyerEmail}`);

    if (prisma) {
      // تسجيل العملية وحفظ الـ telegramChatId داخل حقل المبيعات المتاح لديك لتوثيق تفعيل الباقة له مستقبلاً
      await prisma.transaction.upsert({
        where: { gumroadSaleId: gumroadSaleId },
        update: {},
        create: {
          buyerEmail: buyerEmail,
          // سنقوم بحفظ معرف فريد إضافي في حالة وجود التليجرام لكي يسهل الفحص والتعرف عليه
          gumroadSaleId: gumroadSaleId,
          productName: telegramChatId ? `${productName || "Premium Pack"} (TG: ${telegramChatId})` : (productName || "Premium Pack"),
          amountPaid: pricePaid || 0.0,
        },
      });

      // لتسهيل عملية الفحص الفوري مستقبلاً، سننشئ عملية وهمية سريعة كـ ممر عبور للمعرف
      if (telegramChatId) {
        await prisma.transaction.upsert({
          where: { gumroadSaleId: `tg-${telegramChatId}` },
          update: {},
          create: {
            buyerEmail: buyerEmail,
            gumroadSaleId: `tg-${telegramChatId}`,
            productName: `Telegram Pro Access Active`,
            amountPaid: 0.0,
          }
        });
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed smoothly.' });

  } catch (error) {
    console.error("🛑 Gumroad Webhook Error:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}