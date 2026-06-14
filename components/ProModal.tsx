'use client';

import { useState, useEffect, useRef } from 'react';
import { processAndPublishPrediction } from '@/actions/predictions';

// ─── أنواع البيانات ───────────────────────────────────────────────────────────
interface AnalysisData {
  winProbability: string;
  predictedScore: string;
  tacticalKey: string;
  bettingAdvice: string;
  keyPlayer: string;
}

interface ProModalProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  onClose: () => void;
}

// ─── مكون: شريط تقدم الاحتمالية ─────────────────────────────────────────────
function ProbabilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // تأخير بسيط لتشغيل animation عند الظهور
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-400 w-16 text-left shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white font-bold w-10 text-right shrink-0">{value}%</span>
    </div>
  );
}

// ─── مكون: قسم تحليل واحد ────────────────────────────────────────────────────
function AnalysisSection({
  icon,
  title,
  content,
  accentColor = '#10B981',
}: {
  icon: string;
  title: string;
  content: string;
  accentColor?: string;
}) {
  return (
    <div className="relative bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 overflow-hidden group hover:border-slate-600/50 transition-colors duration-300">
      {/* خط جانبي ملون */}
      <div
        className="absolute right-0 top-0 bottom-0 w-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{icon}</span>
        <h4 className="text-sm font-bold text-slate-300 tracking-wide uppercase">{title}</h4>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed text-right" dir="rtl">
        {content}
      </p>
    </div>
  );
}

// ─── المكون الرئيسي: ProModal ─────────────────────────────────────────────────
export default function ProModal({ matchId, homeTeam, awayTeam, onClose }: ProModalProps) {
  // حالات المكون
  const [phase, setPhase] = useState<'idle' | 'loading' | 'result' | 'publishing' | 'published' | 'error'>('idle');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [modelUsed, setModelUsed] = useState('');
  const [duration, setDuration] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [telegramSent, setTelegramSent] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // إغلاق عند الضغط خارج النافذة
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // منع scroll الخلفية عند فتح المودال
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // إغلاق بـ Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // ─── توليد التحليل ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setPhase('loading');
    setErrorMsg('');

    try {
      const result = await processAndPublishPrediction(matchId, homeTeam, awayTeam, undefined);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'فشل توليد التحليل');
      }

      setAnalysisData(result.data as AnalysisData);
      setModelUsed(result.modelUsed || '');
      setDuration(result.duration || '');
      setTelegramSent(result.telegramSent || false);
      setPhase('result');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
      setPhase('error');
    }
  };

  // ─── نشر Telegram يدوياً (لو أراد المستخدم إعادة النشر) ────────────────────
  const handlePublishTelegram = async () => {
    if (!analysisData) return;
    setPhase('publishing');
    try {
      // استدعاء مع إعادة النشر فقط — يمكن تحسينه لاحقاً بـ action مستقل
      await processAndPublishPrediction(matchId, homeTeam, awayTeam, { forceTelegram: true });
      setTelegramSent(true);
      setPhase('published');
      setTimeout(() => setPhase('result'), 2000);
    } catch {
      setPhase('result');
    }
  };

  // ─── استخراج نسب الفوز من النص (بسيط) ────────────────────────────────────
  const extractProbabilities = (text: string) => {
    // محاولة استخراج أرقام من النص مثل 55% أو 55 بالمئة
    const matches = text.match(/(\d{1,3})%|(\d{1,3})\s*بالمئة/g) || [];
    const nums = matches.map(m => parseInt(m.replace('%', '').replace('بالمئة', '').trim()));

    if (nums.length >= 3) return { home: nums[0], draw: nums[1], away: nums[2] };
    if (nums.length === 2) return { home: nums[0], draw: 100 - nums[0] - nums[1], away: nums[1] };
    // قيم افتراضية إذا لم يُعثر على أرقام
    return { home: 45, draw: 25, away: 30 };
  };

  const probs = analysisData ? extractProbabilities(analysisData.winProbability) : null;

  // ─── الواجهة ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/60 shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.08), 0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* ─── هيدر النافذة ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700/50"
          style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            {/* شارة PRO */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-widest"
              style={{ background: 'linear-gradient(90deg, #d4af37, #f5d47a)', color: '#0f172a' }}
            >
              PRO
            </span>
            <div dir="rtl">
              <p className="text-white font-bold text-sm">{homeTeam} ضد {awayTeam}</p>
              <p className="text-slate-500 text-xs">تحليل ذكاء اصطناعي متقدم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* ─── المحتوى ──────────────────────────────────────────────────── */}
        <div className="p-6">

          {/* === حالة: الشاشة الابتدائية === */}
          {phase === 'idle' && (
            <div className="text-center py-8" dir="rtl">
              {/* أيقونة مركزية */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                🤖
              </div>

              <h3 className="text-white text-xl font-bold mb-3">تحليل Pro بالذكاء الاصطناعي</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
                سيتم توليد تحليل شامل يتضمن: احتماليات الفوز، التوقع التكتيكي، نجم المباراة،
                والتوقع المتقدم — ثم إرساله تلقائياً لقناة Telegram VIP.
              </p>

              {/* ما يتضمنه التحليل */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-right">
                {[
                  { icon: '📊', text: 'احتماليات الفوز المفصّلة' },
                  { icon: '⚽', text: 'التوقع الدقيق للنتيجة' },
                  { icon: '🧠', text: 'التحليل التكتيكي العميق' },
                  { icon: '🌟', text: 'نجم المباراة المتوقع' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 border border-slate-700/30">
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* زر التوليد */}
              <button
                onClick={handleGenerate}
                className="relative w-full py-4 rounded-xl font-black text-base tracking-wide overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
                  color: '#0f172a',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                }}
              >
                <span className="relative z-10">🚀 توليد التحليل ونشره الآن</span>
              </button>

              {/* إشعار Telegram */}
              <p className="text-slate-600 text-xs mt-3">
                سيُرسل التحليل تلقائياً لقناة Telegram VIP عند التوليد
              </p>
            </div>
          )}

          {/* === حالة: التحميل === */}
          {phase === 'loading' && (
            <div className="text-center py-12" dir="rtl">
              {/* دائرة تحميل مخصصة */}
              <div className="w-20 h-20 mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    borderTopColor: '#10B981',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div className="absolute inset-3 rounded-full flex items-center justify-center text-2xl">🧠</div>
              </div>

              <h3 className="text-white text-lg font-bold mb-2">الذكاء الاصطناعي يحلل...</h3>

              {/* خطوات التحليل */}
              <div className="space-y-2 max-w-xs mx-auto mt-6">
                {[
                  'تحليل إحصائيات الفريقين',
                  'حساب الاحتماليات التكتيكية',
                  'توليد التوقع المتقدم',
                  'تجهيز الإرسال لـ Telegram',
                ].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 text-sm text-slate-400"
                    style={{ animation: `fadeIn 0.5s ease ${i * 0.2}s both` }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: '#10B981',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                    {step}
                  </div>
                ))}
              </div>

              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
              `}</style>
            </div>
          )}

          {/* === حالة: الخطأ === */}
          {phase === 'error' && (
            <div className="text-center py-10" dir="rtl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl bg-red-500/10 border border-red-500/20">
                ❌
              </div>
              <h3 className="text-red-400 font-bold text-lg mb-2">فشل التوليد</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">{errorMsg}</p>
              <button
                onClick={handleGenerate}
                className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-800 text-white border border-slate-700 hover:border-emerald-500/40 transition-all"
              >
                🔄 إعادة المحاولة
              </button>
            </div>
          )}

          {/* === حالة: النتيجة === */}
          {(phase === 'result' || phase === 'publishing' || phase === 'published') && analysisData && (
            <div dir="rtl" className="space-y-5">

              {/* ─── بانر النجاح ─────────────────────────────────────── */}
              <div className="flex items-center justify-between p-3 rounded-xl text-sm"
                style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>✅</span>
                  <span className="font-medium">تم التوليد بنجاح</span>
                  {duration && <span className="text-emerald-600 text-xs">في {duration}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {telegramSent ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <span>📨</span> نُشر في Telegram
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">لم يُرسل لـ Telegram</span>
                  )}
                  {modelUsed && (
                    <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">
                      {modelUsed.split('-').slice(0, 2).join('-')}
                    </span>
                  )}
                </div>
              </div>

              {/* ─── شريط احتماليات الفوز ────────────────────────────── */}
              {probs && (
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📊</span>
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide">احتماليات الفوز</h4>
                  </div>
                  <div className="space-y-3">
                    <ProbabilityBar label={homeTeam.split(' ')[0]} value={probs.home} color="#10B981" />
                    <ProbabilityBar label="تعادل" value={Math.max(0, probs.draw)} color="#F59E0B" />
                    <ProbabilityBar label={awayTeam.split(' ')[0]} value={probs.away} color="#3B82F6" />
                  </div>
                </div>
              )}

              {/* ─── النتيجة المتوقعة (بطاقة مميزة) ────────────────── */}
              <div className="relative rounded-xl p-5 text-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <p className="text-xs text-yellow-600 uppercase tracking-widest mb-3 font-bold">النتيجة المتوقعة</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-white font-bold text-sm">{homeTeam}</span>
                  <span className="text-3xl font-black"
                    style={{ color: '#d4af37', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}
                  >
                    {analysisData.predictedScore}
                  </span>
                  <span className="text-white font-bold text-sm">{awayTeam}</span>
                </div>
              </div>

              {/* ─── أقسام التحليل ───────────────────────────────────── */}
              <AnalysisSection
                icon="🧠"
                title="التحليل التكتيكي"
                content={analysisData.tacticalKey}
                accentColor="#8B5CF6"
              />

              <AnalysisSection
                icon="💡"
                title="التوقع المتقدم (حصري Pro)"
                content={analysisData.bettingAdvice}
                accentColor="#d4af37"
              />

              <AnalysisSection
                icon="🌟"
                title="نجم المباراة المتوقع"
                content={analysisData.keyPlayer}
                accentColor="#10B981"
              />

              {/* ─── زر إعادة النشر لـ Telegram ─────────────────────── */}
              {!telegramSent && phase === 'result' && (
                <button
                  onClick={handlePublishTelegram}
                  disabled={phase === 'publishing'}
                  className="w-full py-3 rounded-xl text-sm font-bold border transition-all duration-300"
                  style={{
                    background: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.25)',
                    color: '#60A5FA',
                  }}
                >
                  📨 نشر في قناة Telegram
                </button>
              )}

              {phase === 'publishing' && (
                <div className="w-full py-3 rounded-xl text-sm text-center text-slate-500 border border-slate-700/50">
                  جاري الإرسال...
                </div>
              )}

              {phase === 'published' && (
                <div className="w-full py-3 rounded-xl text-sm text-center font-bold"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
                >
                  ✅ تم النشر في Telegram بنجاح
                </div>
              )}

              {/* ─── زر توليد جديد ───────────────────────────────────── */}
              <button
                onClick={handleGenerate}
                className="w-full py-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                🔄 إعادة التوليد بنموذج مختلف
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
