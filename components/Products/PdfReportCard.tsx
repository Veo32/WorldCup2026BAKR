import React from 'react';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react'; // تأكد من تثبيت lucide-react

interface PdfReportProps {
  title: string;
  description: string;
  price: number;
  features: string[];
  stripePaymentUrl?: string; // رابط الدفع السريع من Stripe
  isPopular?: boolean;
}

export const PdfReportCard: React.FC<PdfReportProps> = ({
  title,
  description,
  price,
  features,
  stripePaymentUrl = "#",
  isPopular = false,
}) => {
  return (
    <div className={`relative flex flex-col p-6 bg-white rounded-2xl shadow-sm border ${isPopular ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'} transition-all hover:shadow-md`}>
      
      {/* شارة التميز (إذا كان التقرير شائعاً) */}
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-full">
          الأكثر مبيعاً
        </span>
      )}

      {/* رأس البطاقة */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 font-medium">تقرير PDF حصري</p>
        </div>
      </div>

      <p className="text-gray-600 mb-6 flex-grow">{description}</p>

      {/* السعر */}
      <div className="mb-6">
        <span className="text-4xl font-extrabold text-gray-900">${price}</span>
        <span className="text-gray-500"> / للتقرير</span>
      </div>

      {/* المميزات */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
            <CheckCircle className="text-green-500 shrink-0" size={18} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* زر الشراء */}
      <a 
        href={stripePaymentUrl}
        className={`mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold transition-colors ${
          isPopular 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        <span>شراء التقرير الآن</span>
        <ArrowRight size={18} />
      </a>
    </div>
  );
};