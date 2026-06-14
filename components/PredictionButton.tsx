    'use client';

    import { useState } from 'react';
    import AnalysisModal from './AnalysisModal';

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

    interface PredictionButtonProps {
      match: Match;
    }

    export default function PredictionButton({ match }: PredictionButtonProps) {
      const [isModalOpen, setIsModalOpen] = useState(false);

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
              match={match}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </>
      );
    }
