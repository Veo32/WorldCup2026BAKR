'use client';

import { useState, useEffect } from 'react';
import { processAndPublishPrediction } from '@/actions/predictions';

interface Match {
  id: string;
  home_team_name_ar: string;
  away_team_name_ar: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_score: number;
  away_score: number;
  finished: string;
  local_date: string;
  group: string;
  time_elapsed: string;
}

interface AnalysisModalProps {
  match: Match;
  onClose: () => void;
}

interface AiData {
  winProbability: string;
  predictedScore: string;
  tacticalKey: string;
  bettingAdvice: string;
  keyPlayer: string;
}

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        auth: (options: Record<string, unknown>, callback: (user: Record<string, unknown> | false) => void) => void;
      };
    };
  }
}

export default function AnalysisModal({ match, onClose }: AnalysisModalProps) {
  const [telegramUser, setTelegramUser] = useState<Record<string, unknown> | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [aiData, setAiData] = useState<AiData | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // جلب تحليل Gemini حقيقي عند فتح الـ Modal
  useEffect(() => {
    const fetchAI = async () => {
      setAiLoading(true);
      setAiError('');
      try {
        const matchStats = {
          status: match.finished === 'TRUE' ? 'FT' : 'upcoming',
          matchFinished: match.finished === 'TRUE',
          homeScore: match.home_score,
          awayScore: match.away_score,
          group: match.group,
          date: match.local_date,
          possession: { home: '50%', away: '50%' },
          shots: { home: 12, away: 10 },
          shotsOnTarget: { home: 5, away: 4 },
          corners: { home: 6, away: 4 },
          fouls: { home: 11, away: 13 },
          form: { home: ['W', 'D', 'W'], away: ['L', 'W', 'D'] },
        };

        const result = await processAndPublishPrediction(
          match.id || String(Math.random()),
          match.home_team_name_en || match.home_team_name_ar,
          match.away_team_name_en || match.away_team_name_ar,
          matchStats
        );

        if (result.success && result.data) {
          setAiData(result.data as AiData);
        } else {
          setAiError('تعذّر توليد التحليل، حاول مجدداً');
        }
      } catch {
        setAiError('خطأ في الاتصال بالذكاء الاصطناعي');
      } finally {
        setAiLoading(false);
      }
    };

    fetchAI();
  }, [match]);

  useEffect(() => {
    const existing = document.getElementById('telegram-widget-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'telegram-widget-script';
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleTelegramAuth = () => {
    setAuthLoading(true);
    setAuthError('');
    if (window.Telegram?.Login?.auth) {
      window.Telegram.Login.auth(
        { bot_id: '8905270013', request_access: true, lang: 'ar' },
        (user) => {
          setAuthLoading(false);
          if (user) {
            setTelegramUser(user);
            sendAuthToServer(user);
          } else {
            setAuthError('فشل تسجيل الدخول، حاول مجدداً');
          }
        }
      );
    } else {
      setAuthLoading(false);
      window.open('https://t.me/WorldCup2026Bakrbot?start=auth', '_blank');
    }
  };

  const sendAuthToServer = async (user: Record<string, unknown>) => {
    try {
      await fetch('/api/V1/auth-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,
          matchId: match.id,
          matchTitle: `${match.home_team_name_ar} vs ${match.away_team_name_ar}`,
        }),
      });
    } catch { /* silent */ }
  };

  const gumroadUrl = `https://veoquest6.gumroad.com/l/yfhmbt?wanted=true&match_id=${match.id || '0'}`;
  const isFinished = match.finished === 'TRUE';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">المجموعة {match.group} · {isFinished ? 'انتهت' : 'قادمة'}</p>
            <h2 className="text-white font-bold text-lg">
              {match.home_team_name_ar} <span className="text-slate-400 text-sm">vs</span> {match.away_team_name_ar}
            </h2>
            {isFinished && (
              <p className="text-emerald-400 text-sm font-bold mt-0.5">
                النتيجة: {match.home_score} - {match.away_score}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">x</button>
        </div>

        {/* قسم مجاني: ملخص AI */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/30">مجاني</span>
            <span className="text-slate-400 text-sm">ملخص الذكاء الاصطناعي</span>
          </div>

          {aiLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-slate-800/60 rounded-xl p-3 animate-pulse">
                  <div className="h-3 bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-700 rounded w-full" />
                </div>
              ))}
              <p className="text-slate-500 text-xs text-center mt-2">Gemini AI يولّد تحليلاً خاصاً بهذه المباراة...</p>
            </div>
          ) : aiError ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              {aiError}
            </div>
          ) : aiData ? (
            <div className="space-y-3">
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-emerald-400 text-xs font-bold mb-1">احتمالية الفوز</p>
                <p className="text-slate-200 text-sm leading-relaxed">{aiData.winProbability}</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-amber-400 text-xs font-bold mb-1">{isFinished ? 'النتيجة الفعلية' : 'النتيجة المتوقعة'}</p>
                <p className="text-white font-bold text-base">{aiData.predictedScore}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* قسم Pro مقفل */}
        <div className="mx-5 mb-5 relative rounded-2xl overflow-hidden border border-amber-500/30">

          {/* المحتوى المموّه - حقيقي من AI */}
          <div className="p-4 select-none pointer-events-none" style={{ filter: 'blur(5px)' }}>
            {aiData ? (
              <div className="space-y-3">
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <p className="text-purple-400 text-xs font-bold mb-1">التحليل التكتيكي العميق</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{aiData.tacticalKey}</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <p className="text-blue-400 text-xs font-bold mb-1">التوقع المتقدم Pro</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{aiData.bettingAdvice}</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <p className="text-yellow-400 text-xs font-bold mb-1">نجم المباراة</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{aiData.keyPlayer}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {['التحليل التكتيكي', 'التوقع المتقدم', 'نجم المباراة'].map((t, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-xl p-3">
                    <p className="text-slate-400 text-xs font-bold mb-1">{t}</p>
                    <div className="h-3 bg-slate-700 rounded w-full mb-1" />
                    <div className="h-3 bg-slate-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* طبقة القفل */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/75 backdrop-blur-[2px]">
            <div className="text-center px-4 w-full">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-white font-bold text-base mb-1">محتوى Pro حصري</p>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                التحليل التكتيكي + التوقع المتقدم + نجم المباراة — يصلك فوراً على تليجرام
              </p>

              <div className="flex flex-col gap-1.5 mb-4 text-right">
                {['🧠 تحليل تكتيكي عميق بالـ AI', '📡 توقع متقدم Pro حصري', '⭐ نجم المباراة ولماذا', '📢 إشعار فوري على تليجرام'].map((f) => (
                  <p key={f} className="text-xs text-slate-300 bg-slate-800/60 rounded-lg px-3 py-1.5">{f}</p>
                ))}
              </div>

              {telegramUser ? (
                <div className="space-y-2">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-center">
                    <p className="text-emerald-400 text-xs font-medium">
                      مرحباً {String(telegramUser.first_name || 'بك')}! سجّلت دخولك
                    </p>
                  </div>
                  <a href={gumroadUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm text-center hover:from-amber-400 hover:to-orange-400 transition-all">
                    اشترك الآن — $4.99
                  </a>
                </div>
              ) : (
                <div className="space-y-2 w-full">
                  <button onClick={handleTelegramAuth} disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {authLoading ? <span className="animate-spin">⏳</span> : (
                      <>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
                        سجّل دخولك بتليجرام
                      </>
                    )}
                  </button>
                  {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-700" />
                    <span className="text-slate-500 text-xs">أو</span>
                    <div className="flex-1 h-px bg-slate-700" />
                  </div>
                  <a href={gumroadUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm text-center hover:from-amber-400 hover:to-orange-400 transition-all">
                    اشترك مباشرة — $4.99
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
