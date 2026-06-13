import MatchCard from "@/components/MatchCard";

async function getWorldCupMatches() {
  try {
    const res = await fetch('https://worldcup26.ir/get/games', {
      next: { revalidate: 3600 }, // أعدناها لساعة لكي لا نضغط على سيرفرهم بعد الآن
    });

    if (!res.ok) {
      return { games: [], error: true };
    }
    const data = await res.json();
    
    // الحل السحري: سحب البيانات من مفتاح games وتحويلها لمصفوفة
    const gamesArray = data.games ? Object.values(data.games) : [];
    
    return { games: gamesArray, error: false };
  } catch (error) {
    return { games: [], error: true };
  }
}

export default async function Home() {
  const { games, error } = await getWorldCupMatches();
  
  // بيانات افتراضية فخمة للتصميم في حال توقف السيرفر
  const dummyMatches = [
    { homeTeam: { name: "السعودية", flag: "🇸🇦" }, awayTeam: { name: "المكسيك", flag: "🇲🇽" }, date: "2026-06-15T19:00:00Z" },
    { homeTeam: { name: "الأرجنتين", flag: "🇦🇷" }, awayTeam: { name: "إسبانيا", flag: "🇪🇸" }, date: "2026-06-16T22:00:00Z" },
    { homeTeam: { name: "البرازيل", flag: "🇧🇷" }, awayTeam: { name: "فرنسا", flag: "🇫🇷" }, date: "2026-06-17T18:00:00Z" }
  ];

  // إذا السيرفر أرسل بيانات، نعرض أول 6 مباريات، وإلا نعرض الافتراضية
  const displayMatches = games.length > 0 ? games.slice(0, 6) : dummyMatches;
  const matchCount = games.length > 0 ? games.length : 104;

  return (
    <div className="space-y-8 mt-4">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          تحليلات <span className="text-emerald-400">كأس العالم 2026</span>
        </h1>
        <p className="text-slate-400">
          إحصائيات، نتائج حية، وبيانات دقيقة لبطولة العالم
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>لا يمكن جلب البيانات الحية حالياً. يتم عرض المباريات الافتراضية.</p>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-32 flex flex-col justify-center shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute -right-4 -top-4 text-yellow-500/10 text-9xl group-hover:scale-110 transition-transform duration-500">🏆</div>
          <p className="text-slate-400 text-sm font-medium relative z-10">إجمالي مباريات البطولة</p>
          <p className="text-4xl font-bold text-white mt-2 relative z-10">{matchCount}</p>
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

      {/* Matches Grid Section */}
      <div className="pt-8 border-t border-slate-800/50">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">أبرز المواجهات</h2>
          <span className="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">مباشر</span>
        </div>
        
        {/* شبكة عرض البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMatches.map((match: any, index: number) => (
            <MatchCard key={match.id || index} match={match} />
          ))}
        </div>
      </div>

    </div>
  );
}