import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // JSON 직렬화 안전성 검사
    let safeCalculationData
    try {
      safeCalculationData = JSON.parse(
        JSON.stringify(body.calculationData, (key, value) => {
          if (typeof value === "bigint") return value.toString()
          if (typeof value === "number" && !isFinite(value)) return null
          return value
        }),
      )
    } catch (serializationError) {
      console.error("JSON serialization failed:", serializationError)
      return NextResponse.json(
        {
          success: false,
          message: "데이터 처리 중 오류가 발생했습니다.",
        },
        { status: 400 },
      )
    }

    const payload = {
      name: body.name,
      phone: body.phone,
      message: body.message,
      calculationData: safeCalculationData,
      timestamp: new Date().toISOString(),
    }

    console.log("Sending to Google Apps Script:", {
      url: process.env.GOOGLE_SCRIPT_URL,
      payloadKeys: Object.keys(payload),
    })

    const response = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    })

    console.log("Google Apps Script response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    // 2xx 또는 3xx 상태 코드를 성공으로 처리
    if (response.status >= 200 && response.status < 400) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 완료되었습니다.",
      })
    } else {
      console.error("Google Apps Script error:", response.status, response.statusText)
      return NextResponse.json(
        {
          success: false,
          message: "상담 신청 처리 중 오류가 발생했습니다.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Consultation API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}
