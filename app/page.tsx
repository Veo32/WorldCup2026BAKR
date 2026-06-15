'use client'
import { useState, useEffect } from 'react';
import MatchCard from "@/components/MatchCard";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [total, setTotal] = useState(104);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    fetch('/api/proxy/games')
      .then(r => r.json())
      .then(data => {
        const arr: any[] = data.games ? Object.values(data.games) : [];

        // Get today's date in Asia/Jerusalem timezone (Palestine)
        const today = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Jerusalem',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

        const todayGames = arr.filter((m: any) => (m.local_date || m.date || '').split(' ')[0] === today);

        let games: any[];
        if (todayGames.length > 0) {
          // عرض مباريات اليوم
          games = todayGames;
          setIsToday(true);
        } else {
          // لا توجد مباريات اليوم — عرض آخر 6 مباريات منتهية
          const finished = arr
            .filter((m: any) => m.finished?.toUpperCase() === 'TRUE')
            .sort((a: any, b: any) => {
              const da = new Date(a.local_date || a.date || '').getTime();
              const db = new Date(b.local_date || b.date || '').getTime();
              return db - da; // الأحدث أولاً
            })
            .slice(0, 6);
          games = finished;
          setIsToday(false);
        }

        setGames(games);
        setTotal(arr.length);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 mt-4">

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          تحليلات <span className="text-emerald-400">كأس العالم 2026</span>
        </h1>
        <p className="text-slate-400">إحصائيات، نتائج حية، وبيانات دقيقة لبطولة العالم</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>لا يمكن جلب البيانات الحية حالياً.</p>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-l from-amber-950/40 to-slate-900 p-5 md:p-6">
        <div className="absolute -left-6 -top-6 text-amber-500/5 text-[160px] select-none pointer-events-none">🏆</div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500 text-black text-xs font-black px-2.5 py-0.5 rounded-full">PRO</span>
              <span className="text-amber-400 text-xs font-medium">تحليل مدعوم بالذكاء الاصطناعي</span>
            </div>
            <h2 className="text-white font-bold text-xl mb-1">حوّل كل مباراة إلى فرصة ذكية</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              تحليل عميق بالـ AI، إحصائيات تفصيلية، وتقرير PDF - يصلك مباشرة على تليجرام قبل صافرة البداية.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { icon: '🤖', label: 'تحليل AI' },
                { icon: '📊', label: 'إحصائيات Pro' },
                { icon: '📡', label: 'إشعار تليجرام' },
                { icon: '📄', label: 'تقرير PDF' },
              ].map((f) => (
                <span key={f.label} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-2 min-w-[180px]">
            <a
              href="https://t.me/WorldCup2026Bakrbot?start=subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-[1.02] shadow-lg shadow-amber-900/30">
              <span>🔥</span>
              <span>اشترك بـ Pro - $4.99</span>
            </a>
            <a
              href="https://t.me/WorldCup2026Bakrbot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-600 text-slate-300 text-sm hover:border-slate-400 hover:text-white transition-all text-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#229ED9]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
              </svg>
              <span>تابع البوت مجاناً</span>
            </a>
            <p className="text-slate-500 text-xs text-center md:text-left">لكل مباراة بشكل منفصل</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-32 flex flex-col justify-center shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute -right-4 -top-4 text-yellow-500/10 text-9xl group-hover:scale-110 transition-transform duration-500">🏆</div>
          <p className="text-slate-400 text-sm font-medium relative z-10">إجمالي مباريات البطولة</p>
          <p className="text-4xl font-bold text-white mt-2 relative z-10">{total}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 h-32 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-transparent opacity-50"></div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">جاري تجهيز ترتيب المجموعات...</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 h-32 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-transparent opacity-50"></div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">جاري تجهيز إحصائيات الهدافين...</p>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800/50">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {loading
                ? 'جاري التحميل...'
                : isToday
                  ? `مباريات اليوم (${games.length})`
                  : `آخر النتائج (${games.length})`}
            </h2>
            {!loading && !isToday && games.length > 0 && (
              <p className="text-slate-500 text-xs mt-1">لا توجد مباريات اليوم - عرض آخر النتائج</p>
            )}
          </div>
          <span className="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">مباشر</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 h-48 animate-pulse">
                <div className="flex justify-between mb-5">
                  <div className="h-3 w-20 bg-slate-700 rounded"/>
                  <div className="h-5 w-16 bg-slate-700 rounded-md"/>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="w-14 h-10 bg-slate-700 rounded"/>
                    <div className="h-3 w-16 bg-slate-700 rounded"/>
                  </div>
                  <div className="w-16 h-8 bg-slate-700 rounded-lg"/>
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="w-14 h-10 bg-slate-700 rounded"/>
                    <div className="h-3 w-16 bg-slate-700 rounded"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-slate-400 mb-2">لا توجد مباريات مجدولة اليوم</p>
            <p className="text-slate-500 text-sm mb-6">اشترك في Pro وستصلك التحليلات تلقائياً قبل كل مباراة</p>
            <a
              href="https://t.me/WorldCup2026Bakrbot?start=subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all">
              🔥 اشترك في Pro الآن
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((match: any, index: number) => (
              <MatchCard key={match.id || index} match={match} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
