import React, { useState, useEffect } from 'react';
import { CheckIcon, LockClosedIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  matchName: string;
}

export default function AnalysisModal({ isOpen, onClose, matchId, matchName }: AnalysisModalProps) {
  const [loading, setLoading] = useState(false);

  // دالة التعامل مع الانتقال المباشر لـ Gumroad بحقن رقم وهمي عشوائي لمنع أي تعليق
  const handleProClick = (explicitChatId?: string) => {
    // 1. استخدام الآيدي الممرر أو توليد رقم عشوائي فوري يشبه آيدي التليجرام
    const chatId = explicitChatId || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    console.log("المنظومة الذكية - تم توجيه العميل بالمعرف:", chatId);

    // 2. بناء الرابط الذكي بالرقم الجديد لمنتج Gumroad الفعلي الخاص بك
    const gumroadUrl = `https://veoquest6.gumroad.com/l/yfhmbt?custom_fields[telegram_chat_id]=${chatId}`;
    
    // 3. فتح بوابة الدفع فوراً في تبويب جديد دون انتظار
    window.open(gumroadUrl, "_blank");
  };

  // إدراج سكربت تليجرام الرسمي ديناميكياً لتوليد زر تسجيل الدخول الموثق
  useEffect(() => {
    if (!isOpen) return;

    // تفريغ الحاوية أولاً لمنع تكرار الزر عند فتح المنبثق وإغلاقه
    const container = document.getElementById('telegram-login-container');
    if (container) container.innerHTML = '';

    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    
    // ✅ معرف اسم البوت الفعلي والنشط الخاص بك
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
          // 🌟 عرض العبارة السحرية المحفزة وتمرير الـ ID الفعلي المستخرج من تليجرام إلى دالة الدفع
          alert(data.message || 'جاري توجيهك لصفحة الدفع لترقية الحساب وكشف أسرار المواجهة...');
          handleProClick(user?.id?.toString());
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
          <div className="text-center text-xs text-slate-400 mb-2">
            سجل دخولك بالتليجرام لربط البوت واستلام تحليلك فوراً:
          </div>
          
          {/* حاوية حقن زر تليجرام الرسمي الخارجي */}
          <div id="telegram-login-container" className="flex justify-center min-h-[40px]"></div>

          {/* زر بديل فوري للمرور السريع في حال التصفح الخفي أو المشاكل الأمنية بالمتصفح */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500 block mb-2">أو انتقل مباشرة للدفع والتفعيل السريع برقم وهمي مؤقت:</span>
            <button 
              onClick={() => handleProClick()}
              className="mx-auto flex items-center gap-2 justify-center w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98]"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              الاشتراك الفوري عبر Gumroad 
            </button>
          </div>

          {loading && (
            <div className="text-center text-sm text-emerald-400 animate-pulse mt-2">
              جاري التحقق وإعداد التقرير المتقدم...
            </div>
          )}

          <div className="flex gap-3 mt-4 text-xs text-slate-500 justify-center border-t border-slate-800/60 pt-4">
            <span>🔒 اتصال آمن وموثق سحابياً</span>
          </div>
        </div>
      </div>
    </div>
  );
}