import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://worldcup26.ir/get/games', {
      next: { revalidate: 300 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    const gamesArray: any[] = data.games ? Object.values(data.games) : [];

    // فلترة مباريات اليوم
    const today = new Date().toISOString().split('T')[0];
    const todayGames = gamesArray.filter((m: any) => {
      const matchDate = (m.local_date || m.date || '').split(' ')[0];
      return matchDate === today;
    });

    // إذا ما في مباريات اليوم، خذ أقرب 6 مباريات قادمة
    const upcoming = gamesArray
      .filter((m: any) => m.finished !== 'TRUE')
      .slice(0, 6);

    const games = todayGames.length > 0 ? todayGames : upcoming;

    return NextResponse.json({
      games,
      total: gamesArray.length,
      isToday: todayGames.length > 0,
    });
  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json({ games: [], total: 104, isToday: false }, { status: 200 });
  }
}
