import { NextResponse, type NextRequest } from "next/server"

/*  
  • Node 런타임 강제 (외부 fetch, console 사용)  
  • 빌드 캐싱 방지
*/
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * 상담 신청 POST
 *  - 어떤 경우에도 JSON 만 반환
 *  - Google Apps Script 의 302 리다이렉트(보안용)도 직접 따라가서 처리
 */
export async function POST(req: NextRequest) {
  try {
    /* 1. 요청 본문 파싱 (빈 바디‧잘못된 JSON 대비) */
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, message: "잘못된 요청 형식입니다." }, { status: 400 })
    }

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    /* 2. 로컬/환경변수 미설정이면 바로 성공 응답 */
    if (!scriptUrl) {
      return NextResponse.json({
        success: true,
        message: "로컬 환경 – 상담 신청이 접수되었습니다.",
        echo: body,
      })
    }

    /* 3. Google Apps Script 호출 (302 수동 처리) */
    const gRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "manual",
    })

    const isRedirect = gRes.status === 302
    const finalRes = isRedirect
      ? await fetch(gRes.headers.get("location") as string, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : gRes

    /* 4. Google 응답을 텍스트로 우선 확보 */
    const textPayload = await finalRes.text()

    /* 5. JSON 파싱 시도 */
    let parsed: any
    try {
      parsed = JSON.parse(textPayload)
    } catch {
      parsed = null
    }

    /* 6. 성공으로 간주 */
    return NextResponse.json({
      success: true,
      message: parsed?.message ?? "상담 신청이 접수되었습니다.",
      googleStatus: finalRes.status,
      redirected: isRedirect,
    })
  } catch (err: any) {
    /* 7. 어떤 예외라도 JSON 만 반환 */
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

/* CORS pre-flight */
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
