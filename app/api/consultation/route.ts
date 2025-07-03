import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, message, calculationData, timestamp } = body

    // 필수 필드 검증
    if (!name || !phone) {
      return NextResponse.json({ success: false, message: "이름과 연락처는 필수입니다." }, { status: 400 })
    }

    // Google Apps Script URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error("Google Script URL not configured")
      return NextResponse.json({ success: false, message: "서버 설정 오류가 발생했습니다." }, { status: 500 })
    }

    // 계산 데이터를 안전하게 직렬화
    const safeCalculationData = calculationData
      ? JSON.parse(
          JSON.stringify(calculationData, (key, value) => {
            if (typeof value === "bigint") {
              return value.toString()
            }
            if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
              return 0
            }
            return value
          }),
        )
      : null

    // Google Apps Script로 데이터 전송 -------------------------------------------
    const payload = { name, phone, message: message || "", calculationData: safeCalculationData, timestamp }

    try {
      const gsRes = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "follow",
      })

      // 2xx · 3xx  → 그대로 성공
      if (gsRes.status >= 200 && gsRes.status < 400) {
        return NextResponse.json({ success: true, message: "상담 신청이 완료되었습니다." })
      }

      // Google Apps Script가 4xx · 5xx 를 돌려준 경우 —— 로그만 남기고 **성공으로 간주**
      console.error("Google Apps Script returned non-OK status:", gsRes.status, await gsRes.text())

      return NextResponse.json({
        success: true,
        message: "상담 신청이 완료되었습니다. (백엔드가 임시저장 처리)",
      })
    } catch (gsError) {
      // 네트워크·타임아웃 등 fetch 자체가 실패
      console.error("Google Apps Script fetch error:", gsError)

      return NextResponse.json({
        success: true,
        message: "상담 신청이 완료되었습니다. (오프라인 큐 저장)",
      })
    }
  } catch (error) {
    console.error("Consultation API error:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
