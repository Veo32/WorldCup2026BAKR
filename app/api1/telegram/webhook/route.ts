import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text || '';
    const firstName = message.from?.first_name || 'صديقي';

    if (text === '/start') {
      await sendMessage(chatId, 
        `مرحباً ${firstName}! 👋\n\n` +
        `🏆 <b>بوت تحليلات كأس العالم 2026</b>\n\n` +
        `سيصلك هنا تحليل Pro لكل مباراة فور اشتراكك.\n\n` +
        `اذهب للموقع واضغط على أي مباراة لتفعيل اشتراكك! 🚀`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}