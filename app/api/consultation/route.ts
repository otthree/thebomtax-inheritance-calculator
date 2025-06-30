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

    // 1차 요청
    let res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "manual", // 302 를 직접 확인하기 위해
    })

    // 302(또는 303) 이면 Location 헤더의 URL 로 GET 재요청
    if (res.status === 302 || res.status === 303) {
      const redirectUrl = res.headers.get("Location")
      if (redirectUrl) {
        console.log("Google Script 302 → GET 요청 URL:", redirectUrl)
        res = await fetch(redirectUrl, { method: "GET" })
      } else {
        // Location 헤더가 없지만 302면 성공으로 간주
        return NextResponse.json({
          success: true,
          message: "상담 신청이 접수되었습니다.",
        })
      }
    }

    // 200 ~ 299 만 성공으로 간주
    if (res.ok) {
      const data = await res.json().catch(() => ({})) // JSON 이 아니면 빈 객체
      return NextResponse.json({
        success: true,
        message: data.message ?? "상담 신청이 접수되었습니다.",
      })
    }

    // 그 외 상태코드는 오류
    throw new Error(`Google Script 응답 코드: ${res.status}`)
  } catch (err) {
    console.error("API 오류:", err)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
