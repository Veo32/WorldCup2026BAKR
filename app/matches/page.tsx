'use client'
import { useState, useEffect } from 'react';
import MatchCard from '@/components/MatchCard';

type Match = {
  id?: string;
  local_date?: string;
  date?: string;
  finished?: string;
  group?: string;
  home_team_name_ar?: string;
  away_team_name_ar?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_score?: number;
  away_score?: number;
  status?: string;
  time_elapsed?: string;
};

type FilterType = 'all' | 'upcoming' | 'finished' | string;

export default function MatchesPage() {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/proxy/games', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const arr: Match[] = data.games ? Object.values(data.games) : [];
        arr.sort((a, b) => {
          const da = new Date(a.local_date || a.date || '').getTime();
          const db = new Date(b.local_date || b.date || '').getTime();
          return da - db;
        });
        const uniqueGroups = [...new Set(arr.map(m => m.group).filter(Boolean))] as string[];
        setGroups(uniqueGroups.sort());
        setAllMatches(arr);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') { setError(true); setLoading(false); }
      });
    return () => controller.abort();
  }, []);

  const filtered = allMatches.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'finished') return m.finished?.toUpperCase() === 'TRUE';
    if (filter === 'upcoming') return m.finished?.toUpperCase() !== 'TRUE';
    return m.group === filter;
  });

  const finishedCount = allMatches.filter(m => m.finished?.toUpperCase() === 'TRUE').length;
  const upcomingCount = allMatches.filter(m => m.finished?.toUpperCase() !== 'TRUE').length;

  const filterButtons: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'الكل', count: allMatches.length },
    { key: 'upcoming', label: 'القادمة', count: upcomingCount },
    { key: 'finished', label: 'المنتهية', count: finishedCount },
    ...groups.map(g => ({ key: g, label: `المجموعة ${g}` })),
  ];

  return (
    <div className="space-y-8 mt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          جميع <span className="text-emerald-400">المباريات</span>
        </h1>
        <p className="text-slate-400">
          {loading ? 'جاري التحميل...' : `${allMatches.length} مباراة — ${finishedCount} منتهية، ${upcomingCount} قادمة`}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>لا يمكن جلب البيانات الآن. تحقق من اتصالك وأعد المحاولة.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                ${filter === btn.key
                  ? 'bg-emerald-500 border-emerald-500 text-black'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
            >
              <span>{btn.label}</span>
              {btn.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                  ${filter === btn.key ? 'bg-black/20 text-black' : 'bg-slate-700 text-slate-400'}`}>
                  {btn.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

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
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-slate-400 mb-1">لا توجد مباريات في هذا الفلتر</p>
          <button onClick={() => setFilter('all')} className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
            عرض الكل
          </button>
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-xs -mb-2">يُعرض {filtered.length} من {allMatches.length} مباراة</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((match, index) => (
              <MatchCard key={match.id || index} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
