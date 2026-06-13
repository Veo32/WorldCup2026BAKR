import ReportDownloadCard from "@/components/Pdf/ReportDownloadCard";

export default function WeeklyAnalyticsPage() {
  return (
    <div className="space-y-6 py-8">
      <h1 className="text-2xl font-bold text-center text-emerald-400">منظومة أرباح BAKR DASH</h1>
      
      {/* استدعاء كارت التقرير الأسبوعي من مساره الصحيح */}
      <ReportDownloadCard weekId="week-2" title="تحليلات الأسبوع الثاني - كأس العالم" />
    </div>
  );
}