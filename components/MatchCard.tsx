import PredictionButton from './PredictionButton';

export default function MatchCard({ match }: { match: any }) {
  // دالة ذكية لإعطاء الرمز الدولي المكون من حرفين لكل دولة لجلب علمها كصورة
  const getCountryCode = (teamName: string) => {
    const codes: any = {
      "South Africa": "za", "Mexico": "mx", "Czech Republic": "cz", "South Korea": "kr",
      "Bosnia and Herzegovina": "ba", "Canada": "ca", "Turkey": "tr", "Australia": "au",
      "Scotland": "gb-sct", "Haiti": "ht", "Paraguay": "py", "United States": "us",
      "Germany": "de", "Japan": "jp", "Morocco": "ma", "Brazil": "br", 
      "Spain": "es", "Argentina": "ar", "Saudi Arabia": "sa", "England": "gb-eng", 
      "France": "fr", "Portugal": "pt", "Croatia": "hr", "Ecuador": "ec", "Ivory Coast": "ci"
    };
    return codes[teamName] || "un"; // un تعني علم غير معروف (علم الأمم المتحدة كاحتياط)
  };

  // استخراج أسماء الفرق الإنجليزية (لجلب الأعلام)
  const homeTeamEn = match.home_team_name_en || match?.homeTeam?.name || "فريق A";
  const awayTeamEn = match.away_team_name_en || match?.awayTeam?.name || "فريق B";
  
  // استخراج الأسماء العربية (لعرضها للمستخدم وإرسالها للذكاء الاصطناعي)
  const homeTeamAr = match.home_team_name_ar || homeTeamEn;
  const awayTeamAr = match.away_team_name_ar || awayTeamEn;
  
  // تحويل الأسماء إلى رموز الدول
  const homeCode = getCountryCode(homeTeamEn);
  const awayCode = getCountryCode(awayTeamEn);
  
  // روابط صور الأعلام بجودة عالية (40 بكسل ارتفاع)
  const homeFlagUrl = `https://flagcdn.com/h40/${homeCode}.png`;
  const awayFlagUrl = `https://flagcdn.com/h40/${awayCode}.png`;

  // معالجة التوقيت ليظهر الساعة فقط
  const rawDate = match.local_date || match.date || "";
  const time = rawDate.includes(' ') ? rawDate.split(' ')[1] : "22:00"; 
  
  // معالجة اسم المجموعة
  const group = match.group ? `المجموعة ${match.group}` : "دور المجموعات";
  
  // تحديد حالة المباراة والنتيجة
  const isFinished = match.finished === "TRUE";
  const homeScore = match.home_score ?? "-";
  const awayScore = match.away_score ?? "-";
  
  // تحديد النص الظاهر في أعلى البطاقة (انتهت / مباشر / لم تبدأ)
  const status = isFinished ? "انتهت" : (match.time_elapsed === "notstarted" ? "لم تبدأ" : (match.status || "لم تبدأ"));

  return (
    <div className="flex flex-col justify-between h-full bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/40 transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] cursor-pointer">
      
      <div>
        {/* القسم العلوي: المجموعة وحالة المباراة */}
        <div className="flex justify-between items-center mb-5 text-xs font-medium">
          <span className="text-slate-400">{group}</span>
          <span className={`px-3 py-1.5 rounded-md border ${isFinished ? 'bg-slate-900/80 text-slate-400 border-slate-700' : 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20'}`}>
            {status}
          </span>
        </div>
        
        {/* القسم الأوسط: الفرق والنتيجة/التوقيت */}
        <div className="flex justify-between items-center">
          
          {/* الفريق الأول (صاحب الأرض) */}
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <div className="relative w-14 h-10 shadow-md rounded overflow-hidden border border-slate-700/50 bg-slate-800">
              {/* استخدام img القياسي هنا لتجنب أخطاء تحسين الصور في المواقع الخارجية */}
              <img src={homeFlagUrl} alt={homeTeamAr} className="w-full h-full object-cover" />
            </div>
            <span className="text-slate-200 font-bold text-sm tracking-wide line-clamp-1">{homeTeamAr}</span>
          </div>

          {/* المنتصف: النتيجة أو كلمة VS والتوقيت */}
          <div className="flex flex-col items-center justify-center w-1/3">
            {isFinished || (homeScore !== "-" && awayScore !== "-") ? (
              <div className="flex items-center gap-2 text-2xl font-black text-white bg-slate-900/40 px-3 py-1 rounded-lg border border-slate-800">
                <span>{homeScore}</span>
                <span className="text-slate-600">-</span>
                <span>{awayScore}</span>
              </div>
            ) : (
              <span className="text-2xl font-black text-slate-600 group-hover:text-yellow-500 transition-colors duration-500">
                VS
              </span>
            )}
            <span className="text-slate-400 text-xs mt-2 bg-slate-900/50 px-3 py-1 rounded-full">{time}</span>
          </div>

          {/* الفريق الثاني (الضيف) */}
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <div className="relative w-14 h-10 shadow-md rounded overflow-hidden border border-slate-700/50 bg-slate-800">
              <img src={awayFlagUrl} alt={awayTeamAr} className="w-full h-full object-cover" />
            </div>
            <span className="text-slate-200 font-bold text-sm tracking-wide line-clamp-1">{awayTeamAr}</span>
          </div>
        </div>
      </div>

      {/* منطقة أزرار التحكم - أسفل البطاقة */}
      <div className="mt-6 border-t border-slate-700/50 pt-4">
       <PredictionButton match={match} />
      </div>

    </div>
  );
}