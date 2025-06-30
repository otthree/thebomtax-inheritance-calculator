import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log("상담 신청 데이터:", JSON.stringify(payload, null, 2))

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    // 스크립트 URL이 없으면 로컬 테스트 모드
    if (!scriptUrl) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다. (로컬 테스트)",
      })
    }

    // Google Apps Script에 직접 POST 요청
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow", // 자동으로 리다이렉트 따라가기
    })

    console.log("Google Script 응답 상태:", res.status)
    console.log("Google Script 응답 URL:", res.url)

    // 응답 처리
    if (res.ok) {
      try {
        const data = await res.json()
        console.log("Google Script 응답 데이터:", data)

        return NextResponse.json({
          success: true,
          message: data.message || "상담 신청이 접수되었습니다.",
        })
      } catch (jsonError) {
        // JSON 파싱 실패해도 성공으로 간주 (Google Script가 HTML 응답할 수 있음)
        console.log("JSON 파싱 실패, 하지만 응답은 성공")
        return NextResponse.json({
          success: true,
          message: "상담 신청이 접수되었습니다.",
        })
      }
    }

    // 실패한 경우
    const errorText = await res.text().catch(() => "알 수 없는 오류")
    console.error("Google Script 오류:", errorText)

    throw new Error(`Google Script 응답 코드: ${res.status}`)
  } catch (err) {
    console.error("API 오류:", err)
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}
