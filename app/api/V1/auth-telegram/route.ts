import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id: telegramId,
      first_name,
      last_name,
      username,
      photo_url,
      matchId,
      matchTitle,
    } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegram ID' }, { status: 400 });
    }

    let user;
    try {
      user = await prisma!.user.upsert({
        where: { telegramId: String(telegramId) },
        update: {
          firstName: first_name || '',
          lastName: last_name || '',
          username: username || '',
          photoUrl: photo_url || '',
          lastSeen: new Date(),
        },
        create: {
          telegramId: String(telegramId),
          firstName: first_name || '',
          lastName: last_name || '',
          username: username || '',
          photoUrl: photo_url || '',
          isPremium: false,
          lastSeen: new Date(),
        },
      });
    } catch {
      user = { telegramId: String(telegramId), isPremium: false };
    }

    if (user.isPremium) {
      const message = matchTitle
        ? `🔥 *تحليل Pro جاهز!*\n\n📊 *${matchTitle}*\n\nسيصلك التحليل الكامل خلال ثوانٍ...`
        : '🔥 تحليلك Pro جاهز! ستصلك الرسالة الآن.';

      await sendTelegramMessage(String(telegramId), message);

      return NextResponse.json({
        success: true,
        isPremium: true,
        message: 'Analysis sent to your Telegram!',
      });
    }

    const gumroadUrl = `https://veoquest6.gumroad.com/l/yfhmbt?wanted=true&telegram_id=${telegramId}&match_id=${matchId || ''}`;

    try {
      await sendTelegramMessage(
        String(telegramId),
        `👋 مرحباً ${first_name || 'بك'}!\n\nللحصول على التحليل Pro، اشترك عبر الرابط:\n${gumroadUrl}`
      );
    } catch {
      // قد يفشل إذا المستخدم لم يبدأ البوت بعد
    }

    return NextResponse.json({
      success: true,
      isPremium: false,
      gumroadUrl,
      telegramId: String(telegramId),
    });

  } catch (error) {
    console.error('auth-telegram error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('No bot token');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telegram API error: ${JSON.stringify(err)}`);
  }

  return res.json();
}