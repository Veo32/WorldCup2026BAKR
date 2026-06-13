'use client';

import { useState } from 'react';
import { FileText, Download, Loader2, CreditCard } from 'lucide-react';

interface ReportCardProps {
  weekId: string; // معرف الأسبوع (مثال: week-1, week-2)
  title?: string;  // عنوان التقرير الأسبوعي المخصص
}

export default function ReportDownloadCard({ weekId, title = "التقرير التحليلي الأسبوعي الشامل" }: ReportCardProps) {
  const [loading, setLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  const handlePaymentAndDownload = async () => {
    setLoading(true);
    try {
      // 1. إرسال طلب إلى الـ API المسؤول عن استدعاء قالب WeeklyReport وحقن البيانات
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekId: weekId,
          paymentIntentId: 'mock_payment_12345', // محاكاة عملية الدفع عبر Stripe
        }),
      });

      if (!response.ok) throw new Error('فشل في جلب التقرير الأسبوعي');

      // 2. تحويل استجابة السيرفر (Stream/Buffer) إلى ملف PDF حقيقي جاهز للتحميل
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Weekly-WorldCup-Analytics-${weekId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // تنظيف الرابط والذاكرة بعد اكتمال التحميل الفوري
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setIsPurchased(true);
    } catch (error) {
      console.error('Error downloading weekly report:', error);
      alert('حدث خطأ أثناء معالجة طلب التقرير الأسبوعي، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-md mx-auto my-6 text-right">
      {/* الهيدر العلوي للكارت مع السعر */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <span className="bg-emerald-500/10 text-emerald-400 font-bold text-sm px-3 py-1 rounded-full">
          $4.99 للتقرير
        </span>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <FileText className="text-emerald-400 h-5 w-5" />
        </div>
      </div>

      {/* الوصف التسويقي للتقرير الأسبوعي */}
      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
        احصل على المستند الشامل والتحليلات السينمائية المتقدمة لكافة مباريات الأسبوع الحالي من بطولة كأس العالم 2026. يتضمن تقارير معمقة مبنية على خوارزميات الذكاء الاصطناعي مع الحفاظ على هوية بصرية مذهلة مصممة للطباعة والقراءة المباشرة.
      </p>

      {/* الميزات ومحتويات ملف الـ PDF التي تم إعدادها في الـ Template */}
      <ul className="text-xs text-slate-400 space-y-2 mb-6 pr-4 border-r border-slate-800">
        <li>🏆 <span className="text-slate-200">تصميم ذهبي فاخر:</span> تنسيق منسق بحواف ثابتة ومظهر أردوازي سينمائي.</li>
        <li>📈 <span className="text-slate-200">تحليلات شاملة لجميع الفرق:</span> تغطية كاملة للمباريات الأسبوعية مع أسماء الفرق المبرزة باللون النعناعي.</li>
        <li>🧠 <span className="text-slate-200">نتائج وتوقعات مدعومة بالذكاء الاصطناعي:</span> نصوص تحليلية شاملة ومفصلة لكل مواجهة.</li>
      </ul>

      {/* أزرار التفاعل (تتغير حالتها الديناميكية بعد الشراء) */}
      {isPurchased ? (
        <button
          onClick={handlePaymentAndDownload}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Download className="h-5 w-5" />
              تحميل التقرير الأسبوعي مجدداً (PDF)
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handlePaymentAndDownload}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              شراء التقرير والتحميل الفوري
            </>
          )}
        </button>
      )}

      {/* إشعار أمان الدفع لرفع نسبة التحويل (Conversion Rate) */}
      <div className="text-center mt-3">
        <span className="text-[10px] text-slate-500">
          الدفع آمن ومحمي بالكامل عبر بوابة Stripe العالمية
        </span>
      </div>
    </div>
  );
}