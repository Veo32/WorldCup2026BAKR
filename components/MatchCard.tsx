import PredictionButton from './PredictionButton';

export default function MatchCard({ match }: { match: any }) {

  const getCountryCode = (teamName: string) => {
    const codes: Record<string, string> = {
      // مجموعة A
      "United States": "us", "USA": "us",
      "Mexico": "mx",
      "Canada": "ca",
      "Panama": "pa",
      // مجموعة B
      "Argentina": "ar",
      "Chile": "cl",
      "Peru": "pe",
      "Ecuador": "ec",
      // مجموعة C
      "Brazil": "br",
      "Colombia": "co",
      "Paraguay": "py",
      "Uruguay": "uy",
      // مجموعة D
      "France": "fr",
      "Belgium": "be",
      "Netherlands": "nl",
      "Luxembourg": "lu",
      // مجموعة E
      "Spain": "es",
      "Portugal": "pt",
      "Croatia": "hr",
      "Turkey": "tr",
      // مجموعة F
      "England": "gb-eng",
      "Germany": "de",
      "Scotland": "gb-sct",
      "Hungary": "hu",
      // مجموعة G
      "Japan": "jp",
      "South Korea": "kr",
      "Australia": "au",
      "Saudi Arabia": "sa",
      // مجموعة H
      "Morocco": "ma",
      "Senegal": "sn",
      "Ivory Coast": "ci",
      "South Africa": "za",
      // مجموعة I
      "Iran": "ir",
      "Egypt": "eg",
      "Nigeria": "ng",
      "Ghana": "gh",
      // مجموعة J
      "New Zealand": "nz",
      "Indonesia": "id",
      "Uzbekistan": "uz",
      "Cuba": "cu",
      // مجموعات أخرى
      "Czech Republic": "cz",
      "Bosnia and Herzegovina": "ba",
      "Haiti": "ht",
      "Switzerland": "ch",
      "Qatar": "qa",
      "Tunisia": "tn",
      "Sweden": "se",
      "Cape Verde": "cv",
      "Curaçao": "cw", "Curacao": "cw",
      "Venezuela": "ve",
      "Bolivia": "bo",
      "Costa Rica": "cr",
      "Honduras": "hn",
      "Jamaica": "jm",
      "Cameroon": "cm",
      "Mali": "ml",
      "Algeria": "dz",
      "DR Congo": "cd",
      "Tanzania": "tz",
      "Kenya": "ke",
      "Mozambique": "mz",
      "Ukraine": "ua",
      "Romania": "ro",
      "Austria": "at",
      "Poland": "pl",
      "Denmark": "dk",
      "Norway": "no",
      "Serbia": "rs",
      "Slovakia": "sk",
      "Slovenia": "si",
      "Greece": "gr",
      "China": "cn",
      "Iraq": "iq",
      "UAE": "ae", "United Arab Emirates": "ae",
      "Oman": "om",
      "Bahrain": "bh",
      "Kuwait": "kw",
      "Thailand": "th",
      "Vietnam": "vn",
      "Malaysia": "my",
      "Philippines": "ph",
      "India": "in",
      "Pakistan": "pk",
      "Russia": "ru",
    };
    return codes[teamName] || "un";
  };

  const homeTeamEn = match.home_team_name_en || match?.homeTeam?.name || "Team A";
  const awayTeamEn = match.away_team_name_en || match?.awayTeam?.name || "Team B";
  const homeTeamAr = match.home_team_name_ar || homeTeamEn;
  const awayTeamAr = match.away_team_name_ar || awayTeamEn;

  const homeCode = getCountryCode(homeTeamEn);
  const awayCode = getCountryCode(awayTeamEn);

  const homeFlagUrl = `https://flagcdn.com/h40/${homeCode}.png`;
  const awayFlagUrl = `https://flagcdn.com/h40/${awayCode}.png`;

  const rawDate = match.local_date || match.date || "";
  const time = rawDate.includes(' ') ? rawDate.split(' ')[1] : "22:00";

  const group = match.group ? `المجموعة ${match.group}` : "دور المجموعات";

  const isFinished = match.finished === "TRUE";
  const homeScore = match.home_score ?? "-";
  const awayScore = match.away_score ?? "-";

  const status = isFinished
    ? "انتهت"
    : match.time_elapsed === "notstarted"
    ? "لم تبدأ"
    : match.status || "لم تبدأ";

  return (
    <div className="flex flex-col justify-between h-full bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/40 transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] cursor-pointer">

      <div>
        {/* القسم العلوي */}
        <div className="flex justify-between items-center mb-5 text-xs font-medium">
          <span className="text-slate-400">{group}</span>
          <span className={`px-3 py-1.5 rounded-md border ${
            isFinished
              ? 'bg-slate-900/80 text-slate-400 border-slate-700'
              : 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20'
          }`}>
            {status}
          </span>
        </div>

        {/* الفرق والنتيجة */}
        <div className="flex justify-between items-center">

          {/* الفريق الأول */}
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <div className="relative w-14 h-10 shadow-md rounded overflow-hidden border border-slate-700/50 bg-slate-800">
              <img
                src={homeFlagUrl}
                alt={homeTeamAr}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://flagcdn.com/h40/un.png'; }}
              />
            </div>
            <span className="text-slate-200 font-bold text-sm tracking-wide line-clamp-1">{homeTeamAr}</span>
          </div>

          {/* النتيجة أو VS */}
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

          {/* الفريق الثاني */}
          <div className="flex flex-col items-center gap-3 w-1/3 text-center">
            <div className="relative w-14 h-10 shadow-md rounded overflow-hidden border border-slate-700/50 bg-slate-800">
              <img
                src={awayFlagUrl}
                alt={awayTeamAr}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://flagcdn.com/h40/un.png'; }}
              />
            </div>
            <span className="text-slate-200 font-bold text-sm tracking-wide line-clamp-1">{awayTeamAr}</span>
          </div>
        </div>
      </div>

      {/* زر التحليل */}
      <div className="mt-6 border-t border-slate-700/50 pt-4">
        <PredictionButton match={match} />
      </div>

    </div>
  );
}