import { NextResponse, type NextRequest } from "next/server"

/* Node 런타임 강제 – 외부 fetch 사용 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * 상담 신청 API
 *  ─ Google Apps Script로 POST
 *  ─ 302 리다이렉트도 따라가서 처리
 *  ─ 어떤 경우에도 JSON만 반환
 */
export async function POST(req: NextRequest) {
  try {
    /* 1) 본문 파싱 */
    let payload: any
    try {
      payload = await req.json()
    } catch {
      return NextResponse.json({ success: false, message: "잘못된 JSON 형식입니다." }, { status: 400 })
    }

    /* 2) 스크립트 URL */
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL
    if (!scriptUrl) {
      // 로컬/테스트 환경
      return NextResponse.json({
        success: true,
        message: "로컬 환경 - 상담 신청이 접수되었습니다.",
        echo: payload,
      })
    }

    /* 3) Google Apps Script 호출 (302 수동 처리) */
    const first = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "manual",
    })

    const finalRes =
      first.status === 302 && first.headers.get("location")
        ? await fetch(first.headers.get("location") as string, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : first

    /* 4) 본문을 텍스트로 받아 JSON 파싱 시도 */
    const raw = await finalRes.text()
    let parsed: any = null
    try {
      parsed = JSON.parse(raw)
    } catch {
      /* Apps Script 가 HTML 문서를 내보내는 경우 */
    }

    /* 5) 클라이언트로 성공 응답 */
    return NextResponse.json({
      success: true,
      message: parsed?.message || "상담 신청이 접수되었습니다.",
      googleStatus: finalRes.status,
      redirected: first.status === 302,
    })
  } catch (err: any) {
    /* 6) 모든 예외를 JSON 형태로 반환 */
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

/* CORS pre-flight 대응 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
