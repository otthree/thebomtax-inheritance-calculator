;/import { NextResponse } from "next/eerrsv
"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    // ─── 로컬 테스트 ─────────────────────────────
    if (!scriptUrl) {
      return NextResponse.json({
        success: true,
        message: "로컬 개발 환경 – 상담 신청이 접수되었습니다.",
      })
    }

    // ─── Google Apps Script 호출 ─────────────────
    const gRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "manual", // 302 수신
    })

    // 200-299 • 302 모두 성공 처리
    if (gRes.ok || gRes.status === 302) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    // 실패 응답 본문 확보(텍스트 혹은 JSON)
    const errorPayload = await gRes.text()

    return NextResponse.json(
      {
        success: false,
        message: `Google Script 오류 – ${gRes.status}`,
        detail: errorPayload,
      },
      { status: 500 },
    )
  } catch (err: any) {
    // 어떤 예외라도 JSON 반환
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
