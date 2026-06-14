import { NextRequest, NextResponse } from "next/server";


// 🔐 الرمز السري لحماية الـ API
const RAPIDAPI_SECRET = process.env.RAPIDAPI_SECRET || "BAKR_SECRET_KEY_2026";

// 📊 البيانات التجريبية (Fallback)
const mockPredictions = [
  {
    id: "mock-1",
    matchId: "match-arg-fra",
    matchName: "الأرجنتين ضد فرنسا",
    analysisResult: "تحليل ذكاء اصطناعي فائق: توقعات بفوز الأرجنتين بنسبة 45%.",
    modelUsed: "Advanced ML Model v2",
    language: "AR",
    isPdfGenerated: true,
    postedToTg: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-2",
    matchId: "match-bra-ger",
    matchName: "البرازيل ضد ألمانيا",
    analysisResult: "تحليل ذكاء اصطناعي فائق: تقارب شديد مع أفضلية هجومية للبرازيل بنسبة 52%.",
    modelUsed: "Advanced ML Model v2",
    language: "AR",
    isPdfGenerated: false,
    postedToTg: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * 🔍 GET - جلب جميع التوقعات
 */
export async function GET(request: NextRequest) {
  try {
    // 1️⃣ التحقق من مفتاح API الأمني
    const apiKey =
      request.headers.get("x-rapidapi-proxy-secret") ||
      request.headers.get("x-bakr-token");

    if (apiKey !== RAPIDAPI_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing API key." },
        { status: 401 }
      );
    }

    // 2️⃣ محاولة جلب من قاعدة البيانات
    try {
      const predictions = await prisma.prediction.findMany({
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
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      // 3️⃣ إذا كانت النتائج فارغة، أرجع البيانات التجريبية
      if (!predictions || predictions.length === 0) {
        console.log("Database is empty, returning mock data");
        return NextResponse.json(mockPredictions, { status: 200 });
      }

      return NextResponse.json(predictions, { status: 200 });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json(mockPredictions, { status: 200 });
    }
  } catch (error) {
    console.error("GET /api/V1/predictions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * 📝 POST - إضافة توقع جديد
 */
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ التحقق من مفتاح API الأمني
    const apiKey =
      request.headers.get("x-rapidapi-proxy-secret") ||
      request.headers.get("x-bakr-token");

    if (apiKey !== RAPIDAPI_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing API key." },
        { status: 401 }
      );
    }

    // 2️⃣ الحصول على بيانات الـ request
    const body = await request.json();

    // 3️⃣ التحقق من الحقول المطلوبة
    if (!body.matchId || !body.matchName || !body.analysisResult) {
      return NextResponse.json(
        { error: "Missing required fields: matchId, matchName, analysisResult" },
        { status: 400 }
      );
    }

    // 4️⃣ إنشاء التوقع الجديد
    const newPrediction = await prisma.prediction.create({
      data: {
        matchId: body.matchId,
        matchName: body.matchName,
        analysisResult: body.analysisResult,
        modelUsed: body.modelUsed || "Advanced ML Model v2",
        language: body.language || "EN",
        isPdfGenerated: body.isPdfGenerated || false,
        postedToTg: body.postedToTg || false,
      },
    });

    return NextResponse.json(newPrediction, { status: 201 });
  } catch (error) {
    console.error("POST /api/V1/predictions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * ✏️ PUT - تحديث توقع موجود
 */
export async function PUT(request: NextRequest) {
  try {
    const apiKey =
      request.headers.get("x-rapidapi-proxy-secret") ||
      request.headers.get("x-bakr-token");

    if (apiKey !== RAPIDAPI_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing API key." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
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
        ...(typeof body.isPdfGenerated === "boolean" && {
          isPdfGenerated: body.isPdfGenerated,
        }),
        ...(typeof body.postedToTg === "boolean" && {
          postedToTg: body.postedToTg,
        }),
      },
    });

    return NextResponse.json(updatedPrediction, { status: 200 });
  } catch (error) {
    console.error("PUT /api/V1/predictions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * 🗑️ DELETE - حذف توقع
 */
export async function DELETE(request: NextRequest) {
  try {
    const apiKey =
      request.headers.get("x-rapidapi-proxy-secret") ||
      request.headers.get("x-bakr-token");

    if (apiKey !== RAPIDAPI_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing API key." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    await prisma.prediction.delete({
      where: { id: body.id },
    });

    return NextResponse.json(
      { message: "Prediction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/V1/predictions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}