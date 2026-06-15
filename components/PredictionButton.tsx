'use client';
import { useState } from 'react';
import AnalysisModal from './AnalysisModal';

interface PredictionButtonProps {
  match: any;
}

export default function PredictionButton({ match }: PredictionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // تطبيع البيانات — الـ API يستخدم _fa بدل _ar
  const normalizedMatch = {
    ...match,
    home_team_name_ar: match.home_team_name_ar || match.home_team_name_en || match.home_team_label || 'فريق 1',
    away_team_name_ar: match.away_team_name_ar || match.away_team_name_en || match.away_team_label || 'فريق 2',
    home_team_name_en: match.home_team_name_en || match.home_team_label || 'Team 1',
    away_team_name_en: match.away_team_name_en || match.away_team_label || 'Team 2',
    home_score: match.home_score ?? 0,
    away_score: match.away_score ?? 0,
    finished: match.finished || 'FALSE',
    local_date: match.local_date || match.date || '',
    group: match.group || '',
    time_elapsed: match.time_elapsed || 'notstarted',
    id: match.id || match._id || String(Math.random()),
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 
                  bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 
                  text-white shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]
                  flex items-center justify-center gap-2"
      >
        <span>🔥</span>
        <span>تحليل Pro للمباراة</span>
      </button>
      {isModalOpen && (
        <AnalysisModal
          match={normalizedMatch}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

