'use server';

// 1. استيراد صحيح بالاسم (prisma) بين أقواس معقوفة
import { prisma } from '@/lib/db'; 
import { renderToStream } from '@react-pdf/renderer';
import { WeeklyReport } from '@/components/Pdf/WeeklyReport';

export async function generateWeeklyPdf() {
  try {
    // 2. حماية النظام (Safety Check): التأكد من أن قاعدة البيانات متصلة وليست null
    if (!prisma) {
      throw new Error("قاعدة البيانات غير متصلة حالياً (DB-less mode active).");
    }

    // 3. سحب بيانات المباريات وتحليلاتها من قاعدة البيانات
    const predictions = await prisma.prediction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10, // سحب أحدث 10 مباريات للأسبوع الحالي
    });

    if (!predictions || predictions.length === 0) {
      throw new Error("لا توجد تحليلات متاحة لهذا الأسبوع.");
    }

    // 4. توليد الـ PDF كـ Stream (مجرى بيانات) في السيرفر
    const pdfStream = await renderToStream(<WeeklyReport predictions={predictions} />);
    
    return { success: true, message: "تم توليد التقرير بنجاح" };

  } catch (error: any) {
    console.error("خطأ في توليد الـ PDF:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء توليد التقرير." };
  }
}