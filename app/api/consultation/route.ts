import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER] 상담 신청 API 호출됨")

    const body = await request.json()
    console.log("[SERVER] 받은 데이터:", JSON.stringify(body, null, 2))

    const { name, phone, message, calculationData } = body

    // 필수 필드 검증
    if (!name || !phone) {
      console.log("[SERVER] 필수 필드 누락")
      return NextResponse.json({ success: false, message: "이름과 연락처는 필수입니다." }, { status: 400 })
    }

    // Google Apps Script URL 확인
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.log("[SERVER] Google Script URL이 설정되지 않음")
      return NextResponse.json({ success: false, message: "Google Script URL이 설정되지 않았습니다." }, { status: 500 })
    }

    console.log("[SERVER] Google Script URL:", googleScriptUrl)

    // Google Apps Script로 전송할 데이터 준비
    const scriptData = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: String(message || "").trim(),
      calculationData: calculationData || null,
      timestamp: new Date().toISOString(),
    }

    console.log("[SERVER] Google Script로 전송할 데이터:", JSON.stringify(scriptData, null, 2))

    // Google Apps Script 호출
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scriptData),
      redirect: "follow",
    })

    console.log("[SERVER] Google Script 응답 상태:", response.status)
    console.log("[SERVER] Google Script 응답 헤더:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[SERVER] Google Script 응답 본문:", responseText)

    // 302 리다이렉트나 성공 응답 모두 성공으로 처리
    if (response.status === 302 || response.status === 200) {
      console.log("[SERVER] 상담 신청 성공")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    } else {
      console.log("[SERVER] Google Script 오류:", response.status)
      return NextResponse.json({ success: false, message: "상담 신청 처리 중 오류가 발생했습니다." }, { status: 500 })
    }
  } catch (error) {
    console.error("[SERVER] 상담 신청 API 오류:", error)
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
