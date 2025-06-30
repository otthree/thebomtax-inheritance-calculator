import { NextResponse } from "next/server"

/**
 * 상담 신청을 Google Apps Script 로 전달한다. 이대현
 * 어떤 상황에서도 JSON 응답을 반환하여
 * 클라이언트가 `response.json()` 을 안전하게 호출할 수 있도록 한다.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    /* 로컬 / CI 등 스크립트 URL 이 없을 때는 바로 성공 처리 */
    if (!scriptUrl) {
      return NextResponse.json({
        success: true,
        message: "로컬 환경 – 상담 신청이 접수되었습니다.",
      })
    }

    /* Google Apps Script 호출 */
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "manual", // 302 도 직접 확인
    })

    // 2xx 또는 302(Found) → 성공 간주
    if (res.ok || res.status === 302) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    /* 실패 시: 본문을 그대로 전달하여 디버깅에 활용 */
    const errorText = await res.text()

    return NextResponse.json(
      {
        success: false,
        message: `Google Script 오류 – ${res.status}`,
        detail: errorText,
      },
      { status: 500 },
    )
  } catch (err: any) {
    /* 모든 예외를 JSON 으로 반환 */
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        detail: err?.message ?? String(err),
      },
      { status: 500 },
    )
  }
}
