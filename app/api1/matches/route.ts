import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://worldcup26.ir/get/games', {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) throw new Error('API failed');
    
    const data = await res.json();
    const gamesArray: any[] = data.games ? Object.values(data.games) : [];
    
    // فلترة مباريات اليوم بالتوقيت المحلي
    const today = new Date().toISOString().split('T')[0]; // "2026-06-13"
    
    const todayGames = gamesArray.filter((m: any) => {
      const matchDate = (m.local_date || m.date || '').split(' ')[0];
      return matchDate === today;
    });

    // إذا ما في مباريات اليوم، خذ أقرب 6 مباريات لم تبدأ بعد
    const upcoming = gamesArray
      .filter((m: any) => m.finished !== 'TRUE')
      .slice(0, 6);

    const games = todayGames.length > 0 ? todayGames : upcoming;

    return NextResponse.json({ games, total: gamesArray.length });
  } catch (error) {
    return NextResponse.json({ games: [], total: 104 }, { status: 200 });
  }
}