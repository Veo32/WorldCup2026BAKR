import React, { useState, useEffect } from 'react';
import { CheckIcon, LockClosedIcon } from '@heroicons/react/20/solid';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  matchName: string;
}

export default function AnalysisModal({ isOpen, onClose, matchId, matchName }: AnalysisModalProps) {
  const [loading, setLoading] = useState(false);

  // إدراج سكربت تليجرام الرسمي ديناميكياً لتوليد زر تسجيل الدخول الموثق
  useEffect(() => {
    if (!isOpen) return;

    // تفريغ الحاوية أولاً لمنع تكرار الزر عند فتح المنبثق وإغلاقه
    const container = document.getElementById('telegram-login-container');
    if (container) container.innerHTML = '';

    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    
    // ✅ تم تحديث المعرف النهائي لاسم البوت الفعلي والنشط الخاص بك
    script.setAttribute('data-telegram-login', 'bakrnew007_bot'); 
    
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write'); // صلاحية هامة تتيح للبوت مراسلة العميل بالخلفية فوراً
    script.setAttribute('data-onauth', 'onTelegramAuth(user)'); // الدالة التي ستُستدعى بعد نجاح الربط بالوجت
    script.async = true;

    container?.appendChild(script);

    // تعريف الدالة في نطاق window ليتمكن السكربت الخارجي من تشغيلها ببساطة
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      try {
        // إرسال بيانات التليجرام إلى مسار السيرفر على الجِذر للتحقق والربط
        const response = await fetch('/api/V1/auth-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, matchId })
        });

        const data = await response.json();
        if (data.success) {
          // إذا كان الحساب يمتلك باقة Pro نشطة في قاعدة البيانات
          alert('تم ربط حسابك وتوليد التحليل بنجاح! تفقد حسابك على تليجرام الآن.');
          onClose();
        } else if (data.redirectToPayment) {
          // 🌟 عرض العبارة السحرية المحفزة القادمة من السيرفر قبل الانتقال لبوابة الدفع Gumroad
          alert(data.message || 'جاري توجيهك لصفحة الدفع لترقية الحساب وكشف أسرار المواجهة...');
          window.location.href = data.stripeUrl; // يحتوي المتغير على رابط منتج Gumroad مع الـ Chat ID المخصص
        }
      } catch (error) {
        console.error('Error during auth:', error);
        alert('حدث خطأ أثناء عملية التحقق، يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-800 p-6 text-right" style={{ direction: 'rtl' }}>
        
        {/* زر الإغلاق */}
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white transition">
          ✕
        </button>

        {/* الهيدر وقيمة الـ Pro المضافة */}
        <div className="text-center mt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
            <LockClosedIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">توليد تحليل الـ Pro الذكي</h3>
          <p className="text-sm text-slate-400 mb-4">لمواجهة: <span className="text-emerald-400 font-semibold">{matchName}</span></p>
        </div>

        {/* مميزات الباقة لرفع معدلات التحويل */}
        <div className="space-y-3 my-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <span>تحليل عميق ومعالجة تكتيكية متقدمة عبر نماذج الذكاء الاصطناعي الفائقة.</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <span>توقعات حصرية مبنية على إحصائيات حية متكاملة لبطولة كأس العالم.</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><b>إرسال فوري ومباشر إلى تليجرام الخاص بك</b> كرسالة منسقة وجاهزة للقراءة بنقرة واحدة.</span>
          </div>
        </div>

        {/* منطقة تفعيل الوجت والـ الأزرار الإجرائية */}
        <div className="mt-8 space-y-4">
          <div className="text-center text-xs text-slate-500 mb-2">
            سجل دخولك بالتليجرام لمرة واحدة لربط البوت واستلام تحليلك فوراً:
          </div>
          
          {/* حاوية حقن زر تليجرام الرسمي الخارجي */}
          <div id="telegram-login-container" className="flex justify-center min-h-[40px]"></div>

          {loading && (
            <div className="text-center text-sm text-emerald-400 animate-pulse mt-2">
              جاري التحقق وإعداد التقرير المتقدم...
            </div>
          )}

          <div className="flex gap-3 mt-4 text-xs text-slate-500 justify-center border-t border-slate-800/60 pt-4">
            <span>🔒 اتصال آمن وموثق رسمياً عبر تليجرام</span>
          </div>
        </div>
      </div>
    </div>
  );
}