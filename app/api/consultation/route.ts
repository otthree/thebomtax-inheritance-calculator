import { type NextRequest, NextResponse } from "next/server"

/**
 * 상담 신청 API
 * - 어떤 상황에서도 JSON(Response)만 반환
 * - Google Apps Script 302 리다이렉트를 성공으로 간주
 */
export async function POST(request: NextRequest) {
  // 공통 실패 응답 헬퍼 –– 절대 throw 하지 않음
  const fail = (msg: string, status = 500, extra: Record<string, unknown> = {}) =>
    NextResponse.json({ success: false, message: msg, ...extra }, { status })

  try {
    const body = await request.json().catch(() => ({}))
    const { name, phone, message = "", calculationData = null } = body

    // 1) 필수값 확인
    if (!name || !phone) return fail("이름과 연락처는 필수입니다.", 400)

    // 2) Google Script URL 확인
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    if (!googleScriptUrl)
      return fail("Google Apps Script가 설정되지 않았습니다.", 500, {
        debug: "GOOGLE_SCRIPT_URL_NOT_CONFIGURED",
      })

    // 3) Google Script 호출
    let scriptRes: Response
    try {
      scriptRes = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(name).trim(),
          phone: String(phone).trim(),
          message: String(message).trim(),
          calculationData,
          timestamp: new Date().toISOString(),
        }),
        redirect: "follow",
      })
    } catch (err) {
      return fail("Google Apps Script 호출 실패", 502, { debug: (err as Error).message })
    }

    // 4) 302 또는 200 → 성공
    if (scriptRes.status === 302 || scriptRes.status === 200)
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })

    // 5) 그 밖의 상태 → 실패 (본문이 없어도 catch 안 남)
    let raw = ""
    try {
      raw = await scriptRes.text()
    } catch {
      /* body 가 없어도 계속 진행 */
    }
    return fail("상담 신청 처리 중 오류가 발생했습니다.", 500, {
      debug: `Google Script status ${scriptRes.status}`,
      scriptBody: raw.slice(0, 200),
    })
  } catch (err) {
    // 최상위 예외도 JSON으로 래핑
    return fail("서버 내부 오류가 발생했습니다.", 500, {
      debug: (err as Error).message,
    })
  }
}
