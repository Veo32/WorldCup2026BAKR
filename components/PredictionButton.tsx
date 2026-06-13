'use client'

import { useState } from 'react';
import { processAndPublishPrediction } from '@/actions/predictions'; // تأكد من صحة المسار

interface PredictionButtonProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
}

export default function PredictionButton({ matchId, homeTeam, awayTeam }: PredictionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('توليد تحليل Pro ونشره 🚀');

  const handlePrediction = async () => {
    try {
      setIsLoading(true);
      setStatusText('الذكاء الاصطناعي يحلل...');
      
      // استدعاء السيرفر لمعالجة البيانات وإرسالها للتليجرام
      const result = await processAndPublishPrediction(matchId, homeTeam, awayTeam);
      
      if (result.success) {
        setStatusText('تم النشر بنجاح ✅');
        // إعادة تعيين النص بعد 3 ثوانٍ
        setTimeout(() => setStatusText('توليد تحليل Pro ونشره 🚀'), 3000);
      }
    } catch (error) {
      console.error(error);
      setStatusText('حدث خطأ ❌');
      setTimeout(() => setStatusText('توليد تحليل Pro ونشره 🚀'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePrediction}
      disabled={isLoading}
      className={`
        relative w-full py-2 px-4 rounded-lg font-bold text-sm transition-all duration-300
        ${isLoading 
          ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700' 
          : 'bg-gradient-to-r from-gray-900 to-black text-[#00FF87] border border-[#00FF87]/30 hover:border-[#00FF87] hover:shadow-[0_0_15px_rgba(0,255,135,0.2)]'
        }
      `}
    >
      {/* لمسة ذهبية بسيطة كخلفية متوهجة (Luxury Touch) */}
      {!isLoading && (
        <span className="absolute -top-[1px] -left-[1px] -right-[1px] -bottom-[1px] rounded-lg bg-gradient-to-r from-[#FFD700]/20 to-transparent z-[-1] blur-[2px] opacity-50" />
      )}
      
      {statusText}
    </button>
  );
}