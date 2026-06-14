import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 🔐 الرمز السري لحماية الـ API
const RAPIDAPI_SECRET = process.env.RAPIDAPI_SECRET || "BAKR_SECRET_KEY_2026";

// 📊 البيانات التجريبية (Fallback)
const mockPredictions = [
  {
    id: "mock-1",
    matchId: "match-arg-fra",
    matchName: "الأرجنتين ضد فرنسا",
    analysisResult: "تحليل ذكاء اصطناعي: توقعات بفوز الأرجنتين بنسبة 45% بناءً على تكتيكات منتصف الملعب.",
    modelUsed: "gemini-2.5-flash",
    language: "AR",
    isPdfGenerated: true,
    postedToTg: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    matchId: "match-bra-ger",
    matchName: "البرازيل ضد ألمانيا",
    analysisResult: "تحليل ذكاء اصطناعي: تقارب شديد مع أفضلية هجومية للبرازيل بنسبة 52%.",
    modelUsed: "gemini-2.5-flash",
    language: "AR",
    isPdfGenerated: false,
    postedToTg: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 🔑 دالة مساعدة للتحقق من المفتاح
function validateApiKey(request: NextRequest): boolean {
  const apiKey =
    request.headers.get('x-rapidapi-proxy-secret') ||
    request.headers.get('x-bakr-token') ||
    request.nextUrl.searchParams.get('token');
  return apiKey === RAPIDAPI_SECRET;
}

// ✅ GET - جلب التوقعات
export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    // فلترة اختيارية
    const { searchParams } = request.nextUrl;
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '50');
    const postedToTg = searchParams.get('postedToTg');

    try {
      const predictions = await prisma.prediction.findMany({
        where: {
          ...(language && { language }),
          ...(postedToTg !== null && { postedToTg: postedToTg === 'true' }),
        },
        select: {
          id: true,
          matchId: true,
          matchName: true,
          analysisResult: true,
          modelUsed: true,
          language: true,
          isPdfGenerated: true,
          postedToTg: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100),
      });

      if (!predictions || predictions.length === 0) {
        return NextResponse.json(mockPredictions, { status: 200 });
      }

      return NextResponse.json({
        data: predictions,
        total: predictions.length,
        source: 'database',
      }, { status: 200 });

    } catch (dbError) {
      console.warn('DB error, falling back to mock data:', dbError);
      return NextResponse.json({
        data: mockPredictions,
        total: mockPredictions.length,
        source: 'mock',
      }, { status: 200 });
    }

  } catch (error) {
    console.error('GET /api/V1/predictions error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ➕ POST - إضافة توقع جديد
export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.matchId || !body.matchName || !body.analysisResult || !body.modelUsed) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, matchName, analysisResult, modelUsed' },
        { status: 400 }
      );
    }

    const newPrediction = await prisma.prediction.create({
      data: {
        matchId: body.matchId,
        matchName: body.matchName,
        analysisResult: body.analysisResult,
        modelUsed: body.modelUsed,
        language: body.language || 'AR',
        isPdfGenerated: body.isPdfGenerated || false,
        postedToTg: body.postedToTg || false,
      },
    });

    return NextResponse.json(newPrediction, { status: 201 });

  } catch (error) {
    console.error('POST /api/V1/predictions error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ✏️ PUT - تحديث توقع
export async function PUT(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const updatedPrediction = await prisma.prediction.update({
      where: { id: body.id },
      data: {
        ...(body.matchName && { matchName: body.matchName }),
        ...(body.analysisResult && { analysisResult: body.analysisResult }),
        ...(body.modelUsed && { modelUsed: body.modelUsed }),
        ...(body.language && { language: body.language }),
        ...(typeof body.isPdfGenerated === 'boolean' && { isPdfGenerated: body.isPdfGenerated }),
        ...(typeof body.postedToTg === 'boolean' && { postedToTg: body.postedToTg }),
      },
    });

    return NextResponse.json(updatedPrediction, { status: 200 });

  } catch (error) {
    console.error('PUT /api/V1/predictions error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE - حذف توقع
export async function DELETE(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    await prisma.prediction.delete({
      where: { id: body.id },
    });

    return NextResponse.json(
      { message: 'Prediction deleted successfully', id: body.id },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE /api/V1/predictions error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}