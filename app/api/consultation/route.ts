import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Google Apps Script URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error("GOOGLE_SCRIPT_URL 환경 변수가 설정되지 않았습니다.")
      return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 })
    }

    console.log("상담 신청 데이터:", body)

    // Google Apps Script로 데이터 전송
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    })

    console.log("Google Apps Script 응답 상태:", response.status)
    console.log("Google Apps Script 응답 헤더:", Object.fromEntries(response.headers.entries()))

    // 2xx, 3xx 상태 코드를 성공으로 처리
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      console.log("✅ 상담 신청 성공")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 완료되었습니다.",
      })
    }

    // 오류 응답 처리
    let errorMessage = "상담 신청 중 오류가 발생했습니다."
    try {
      const errorText = await response.text()
      console.error("Google Apps Script 오류 응답:", errorText)

      // JSON 응답인지 확인
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
      } catch {
        // JSON이 아닌 경우 기본 메시지 사용
      }
    } catch (parseError) {
      console.error("오류 응답 파싱 실패:", parseError)
    }

    return NextResponse.json({ error: errorMessage }, { status: response.status })
  } catch (error) {
    console.error("❌ 상담 신청 API 오류:", error)
    return NextResponse.json({ error: "상담 신청 중 오류가 발생했습니다." }, { status: 500 })
  }
}
