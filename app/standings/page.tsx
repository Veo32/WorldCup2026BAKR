'use client'
import { useState, useEffect } from 'react';

type Match = {
  id?: string;
  local_date?: string;
  finished?: string;
  group?: string;
  home_team_name_ar?: string;
  away_team_name_ar?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_score?: number | string;
  away_score?: number | string;
};

type TeamStat = {
  nameAr: string;
  nameEn: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

type GroupTable = { [teamEn: string]: TeamStat };
type StandingsData = { [group: string]: GroupTable };

const getCountryCode = (teamName: string): string => {
  const codes: Record<string, string> = {
    "South Africa": "za", "Mexico": "mx", "Czech Republic": "cz", "South Korea": "kr",
    "Bosnia and Herzegovina": "ba", "Canada": "ca", "Turkey": "tr", "Australia": "au",
    "Scotland": "gb-sct", "Haiti": "ht", "Paraguay": "py", "United States": "us",
    "Germany": "de", "Japan": "jp", "Morocco": "ma", "Brazil": "br",
    "Spain": "es", "Argentina": "ar", "Saudi Arabia": "sa", "England": "gb-eng",
    "France": "fr", "Portugal": "pt", "Croatia": "hr", "Ecuador": "ec", "Ivory Coast": "ci",
  };
  return codes[teamName] || 'un';
};

function buildStandings(matches: Match[]): StandingsData {
  const standings: StandingsData = {};
  for (const m of matches) {
    if (!m.group) continue;
    const group = m.group;
    if (!standings[group]) standings[group] = {};
    const homeEn = m.home_team_name_en || 'Unknown';
    const awayEn = m.away_team_name_en || 'Unknown';
    const homeAr = m.home_team_name_ar || homeEn;
    const awayAr = m.away_team_name_ar || awayEn;
    if (!standings[group][homeEn]) standings[group][homeEn] = { nameAr: homeAr, nameEn: homeEn, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    if (!standings[group][awayEn]) standings[group][awayEn] = { nameAr: awayAr, nameEn: awayEn, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    if (m.finished?.toUpperCase() !== 'TRUE') continue;
    const hs = Number(m.home_score ?? -1);
    const as_ = Number(m.away_score ?? -1);
    if (hs < 0 || as_ < 0) continue;
    const home = standings[group][homeEn];
    const away = standings[group][awayEn];
    home.played++; away.played++;
    home.gf += hs; home.ga += as_;
    away.gf += as_; away.ga += hs;
    if (hs > as_) { home.won++; home.points += 3; away.lost++; }
    else if (hs < as_) { away.won++; away.points += 3; home.lost++; }
    else { home.drawn++; home.points++; away.drawn++; away.points++; }
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  }
  return standings;
}

function sortGroup(group: GroupTable): TeamStat[] {
  return Object.values(group).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<StandingsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/proxy/games', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const arr: Match[] = data.games ? Object.values(data.games) : [];
        const result = buildStandings(arr);
        setStandings(result);
        setActiveGroup(Object.keys(result).sort()[0] || '');
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') { setError(true); setLoading(false); }
      });
    return () => controller.abort();
  }, []);

  const sortedGroups = Object.keys(standings).sort();

  return (
    <div className="space-y-8 mt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          ترتيب <span className="text-emerald-400">المجموعات</span>
        </h1>
        <p className="text-slate-400">جدول ترتيب المجموعات بناءً على نتائج المباريات المنتهية</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>لا يمكن جلب البيانات الآن. تحقق من اتصالك وأعد المحاولة.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 animate-pulse">
              <div className="h-5 w-32 bg-slate-700 rounded mb-4"/>
              {[1,2,3,4].map(j => (
                <div key={j} className="flex gap-3 mb-3">
                  <div className="w-8 h-6 bg-slate-700 rounded"/>
                  <div className="h-4 flex-1 bg-slate-700 rounded"/>
                  <div className="w-24 h-4 bg-slate-700 rounded"/>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && sortedGroups.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {sortedGroups.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${activeGroup === g ? 'bg-emerald-500 border-emerald-500 text-black font-bold' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'}`}>
                المجموعة {g}
              </button>
            ))}
          </div>

          {activeGroup && standings[activeGroup] && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">المجموعة <span className="text-emerald-400">{activeGroup}</span></h2>
                <span className="text-slate-500 text-xs">
                  {Object.values(standings[activeGroup]).reduce((s, t) => s + t.played, 0) / 2} مباراة مُلعبت
                </span>
              </div>
              <div className="grid grid-cols-[auto_1fr_repeat(7,_minmax(0,_40px))] gap-x-2 px-5 py-2.5 text-slate-500 text-xs font-medium border-b border-slate-800/60">
                <span className="w-6 text-center">#</span>
                <span>الفريق</span>
                <span className="text-center">لع</span>
                <span className="text-center">ف</span>
                <span className="text-center">ت</span>
                <span className="text-center">خ</span>
                <span className="text-center">±</span>
                <span className="text-center">هـ</span>
                <span className="text-center font-bold text-slate-400">ن</span>
              </div>
              {sortGroup(standings[activeGroup]).map((team, idx) => {
                const isQualified = idx < 2;
                return (
                  <div key={team.nameEn}
                    className={`grid grid-cols-[auto_1fr_repeat(7,_minmax(0,_40px))] gap-x-2 px-5 py-3.5 items-center border-b border-slate-800/40 last:border-0 transition-colors
                      ${isQualified ? 'hover:bg-emerald-900/10' : 'hover:bg-slate-800/30'}`}>
                    <span className={`w-6 text-center text-xs font-bold flex items-center justify-center w-5 h-5 rounded-full
                      ${isQualified ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600'}`}>{idx + 1}</span>
                    <div className="flex items-center gap-2.5">
                      <img src={`https://flagcdn.com/h20/${getCountryCode(team.nameEn)}.png`} alt={team.nameAr}
                        className="w-7 h-5 object-cover rounded-sm border border-slate-700/50 flex-shrink-0"/>
                      <span className={`text-sm font-medium truncate ${isQualified ? 'text-white' : 'text-slate-300'}`}>{team.nameAr}</span>
                      {isQualified && team.played > 0 && (
                        <span className="hidden md:inline text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">متأهل</span>
                      )}
                    </div>
                    <span className="text-center text-sm text-slate-400">{team.played}</span>
                    <span className="text-center text-sm text-slate-300">{team.won}</span>
                    <span className="text-center text-sm text-slate-400">{team.drawn}</span>
                    <span className="text-center text-sm text-slate-400">{team.lost}</span>
                    <span className={`text-center text-sm font-medium ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                      {team.gd > 0 ? `+${team.gd}` : team.gd}
                    </span>
                    <span className="text-center text-sm text-slate-300">{team.gf}</span>
                    <span className="text-center text-sm font-bold text-white">{team.points}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/50">
            <h3 className="text-slate-400 text-sm font-medium mb-4">نظرة عامة — جميع المجموعات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedGroups.map(g => (
                <button key={g} onClick={() => setActiveGroup(g)}
                  className={`text-right bg-slate-900 border rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer
                    ${activeGroup === g ? 'border-emerald-500/40' : 'border-slate-800'}`}>
                  <p className="text-emerald-400 text-xs font-bold mb-3">المجموعة {g}</p>
                  <div className="space-y-2">
                    {sortGroup(standings[g]).map((team, idx) => (
                      <div key={team.nameEn} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold w-4 text-center ${idx < 2 ? 'text-emerald-400' : 'text-slate-600'}`}>{idx + 1}</span>
                          <img src={`https://flagcdn.com/h20/${getCountryCode(team.nameEn)}.png`} alt={team.nameAr}
                            className="w-5 h-3.5 object-cover rounded-sm border border-slate-700/40"/>
                          <span className="text-slate-300 text-xs truncate max-w-[100px]">{team.nameAr}</span>
                        </div>
                        <span className="text-white text-xs font-bold">{team.points} ن</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
