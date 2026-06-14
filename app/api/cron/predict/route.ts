import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processAndPublishPrediction } from '@/actions/predictions'; // الدالة المسؤولية عن النشر النهائي للتيليجرام

export const dynamic = 'force-dynamic'; // ميزة: منع Next.js من عمل الكاش للـ API وتجبره على قراءة الـ DB حياً في كل دورة

export async function GET(request: Request) {
  try {
    // 1. تأمين الـ Endpoint لمنع أي استهلاك عشوائي للـ Quota أو الطلبات الضارة
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    // التحقق من مفتاح الأمان عبر الرابط أو عبر الهيدر الخاص بـ Vercel المجدول تلقائياً
    if (
      secretParam !== cronSecret && 
      authHeader !== `Bearer ${cronSecret}`
    ) {
      console.warn(`🔒 [Cron Security] Unauthorized access attempt blocked.`);
      return new NextResponse('Unauthorized Access', { status: 401 });
    }

    // 2. حساب النطاق الزمني الذكي (المباريات التي تبدأ خلال الـ 3 ساعات القادمة)
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    console.log(`[Cron Job] Checking for matches between ${now.toISOString()} and ${threeHoursFromNow.toISOString()}`);

    // بيئة بدون قاعدة بيانات (DB-less Fallback) لحماية السيرفر من الانهيار إذا كانت الـ DB معطلة يدوياً
    if (!prisma) {
      console.log("ℹ️ [Cron Notice] Prisma is disabled or null. Skipping auto-check.");
      return NextResponse.json({ success: false, message: "Database is not initialized or explicitly disabled." });
    }

    // 3. استعلام قاعدة البيانات لاصطياد المباراة القادمة والتي لم يتم تحليلها بعد
    const upcomingMatch = await prisma.match.findFirst({
      where: {
        matchTime: {
          gte: now,
          lte: threeHoursFromNow,
        },
        predictionPublished: false, 
      },
      orderBy: {
        matchTime: 'asc', // جلب المباراة الأقرب زمنياً أولاً لضمان الترتيب التصاعدي
      }
    });

    if (!upcomingMatch) {
      console.log("[Cron Job] No upcoming matches found in the 3-hour window, or all matches are already analyzed.");
      return NextResponse.json({ success: true, message: "No pending matches found." });
    }

    console.log(`[Cron Job] Found match to process: ${upcomingMatch.homeTeam} vs ${upcomingMatch.awayTeam}`);

    // 4. ميزة حماية متقدمة: التحديث الفوري المبدئي لمنع استدعاء الـ AI Engine مرتين للمباراة ذاتها
    // في حال حدوث تداخل أو Double-trigger للـ API
    const lockCheck = await prisma.match.findUnique({
      where: { id: upcomingMatch.id }
    });

    if (lockCheck?.predictionPublished) {
      console.log("[Cron Job Warning] Match already picked up by another process thread. Skipping.");
      return NextResponse.json({ success: true, message: "Match already processed concurrently." });
    }

    // 5. تشغيل الـ Workflow التلقائي للمباراة المصطادة وضخ التحليل للتيليجرام مباشرة
    const result = await processAndPublishPrediction(
      upcomingMatch.id.toString(), 
      upcomingMatch.homeTeam, 
      upcomingMatch.awayTeam
    );

    // 6. تأكيد وإغلاق حالة المباراة لمنع تكرار تحليلها في الدورة القادمة نهائياً
    await prisma.match.update({
      where: { id: upcomingMatch.id },
      data: { predictionPublished: true }
    });

    console.log(`✅ [Cron Job Success] Prediction published for: ${upcomingMatch.homeTeam} vs ${upcomingMatch.awayTeam}`);

    return NextResponse.json({ 
      success: true, 
      processedMatch: `${upcomingMatch.homeTeam} vs ${upcomingMatch.awayTeam}`,
      details: result 
    });

  } catch (error: any) {
    console.error("[Cron Job Absolute Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}