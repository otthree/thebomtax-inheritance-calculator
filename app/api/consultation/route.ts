import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log("상담 신청 데이터:", payload)

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    // 스크립트 URL이 없으면 로컬 테스트 모드
    if (!scriptUrl) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다. (로컬 테스트)",
      })
    }

    // Google Apps Script에 POST 요청
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Google Apps Script 가 더 이상 302 를 보내지 않으므로 기본 값(follow) 사용
    })

    console.log("Google Script 응답 상태:", res.status)

    // 정상(HTTP 2xx) 은 전부 성공으로 처리
    if (res.ok) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    // 그 외 상태코드는 오류
    throw new Error(`Google Script 응답 코드: ${res.status}`)
  } catch (err) {
    console.error("API 오류:", err)
    // 어떤 상황에서도 JSON 형식으로 돌려준다
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
