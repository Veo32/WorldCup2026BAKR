import { PdfReportCard } from '@/components/Products/PdfReportCard';

export const metadata = {
  title: 'المتجر | تقارير كأس العالم 2026',
  description: 'احصل على تقارير PDF حصرية للتحليل الفني والتوقعات المتقدمة.',
};

export default function StorePage() {
  // بيانات التقارير المتاحة مع روابط الدفع الفعلية
  const reports = [
    {
      title: "التقرير التحليلي الأسبوعي",
      description: "تحليل شامل لجميع مباريات الأسبوع مع توقعات دقيقة لأفضل الفرق واللاعبين.",
      price: 4.99,
      isPopular: true,
      features: [
        "إحصائيات مفصلة لجميع فرق الأسبوع",
        "توقعات الـ Over/Under والأهداف المرجحة",
        "تحليل نقاط الضعف والقوة التكتيكية",
        "جاهز للتحميل الفوري بعد الدفع مباشرة"
      ],
      // تم استبدال الرابط التجريبي برابط Gumroad الفعلي الخاص بك
      stripePaymentUrl: "https://veoquest6.gumroad.com/l/yfhmbt" 
    },
    {
      title: "تقرير دور المجموعات الكامل",
      description: "دليلك الشامل لجميع منتخبات دور المجموعات، فرصة كل فريق في التأهل بالأرقام.",
      price: 9.99,
      isPopular: false,
      features: [
        "تغطية شاملة لـ 48 منتخباً مشاركاً",
        "توقعات الذكاء الاصطناعي للمتأهلين",
        "تاريخ المواجهات السابقة",
        "ملف PDF عالي الدقة (أكثر من 50 صفحة)"
      ],
      stripePaymentUrl: "https://buy.stripe.com/test_..." // سنقوم بتحديثه عند إنشاء منتج آخر
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* ترويسة الصفحة */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            تقارير وتحليلات حصرية (PDF)
          </h1>
          <p className="text-lg text-gray-600">
            احصل على أفضلية تنافسية مع تقاريرنا المدعومة بالذكاء الاصطناعي، جاهزة للتحميل الفوري.
          </p>
        </div>

        {/* شبكة المنتجات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {reports.map((report, index) => (
            <PdfReportCard 
              key={index}
              title={report.title}
              description={report.description}
              price={report.price}
              features={report.features}
              isPopular={report.isPopular}
              stripePaymentUrl={report.stripePaymentUrl}
            />
          ))}
        </div>

      </div>
    </div>
  );
}