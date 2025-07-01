import { type NextRequest, NextResponse } from "next/server"

/** 모든 에러 상황에서도 JSON만 반환 최종바지 */
const fail = (msg: string, status = 500, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ success: false, message: msg, ...extra }, { status })

// 2xx, 3xx를 모두 “성공”으로 보고 싶은 경우에 사용
const isRedirectOrOk = (res: Response) =>
  (res.status >= 200 && res.status < 300) || (res.status >= 300 && res.status < 400)

/** JSON.stringify 가 BigInt, Infinity, NaN 등을 만나면 throw 난다.
 *  API 전체가 500으로 깨지지 않게 모든 특수값을 문자열이나 null 로 치환한다. */
const safeStringify = (data: unknown) =>
  JSON.stringify(
    data,
    (_k, v) => {
      if (typeof v === "bigint") return v.toString()
      if (typeof v === "number" && !Number.isFinite(v)) return null // NaN, ±Infinity
      return v
    },
    2,
  )

/**
 * 상담 신청 API
 * - 어떤 상황에서도 JSON(Response)만 반환
 * - Google Apps Script 302 리다이렉트를 성공으로 간주 이대현
 */
export async function POST(request: NextRequest) {
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
    let bodyPayload: string
    try {
      bodyPayload = safeStringify({
        name: String(name).trim(),
        phone: String(phone).trim(),
        message: String(message).trim(),
        calculationData,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      return fail("요청 직렬화 오류", 500, { debug: (err as Error).message })
    }
    try {
      scriptRes = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyPayload,
        redirect: "follow",
      })
    } catch (err) {
      return fail("Google Apps Script 호출 실패", 502, { debug: (err as Error).message })
    }

    // 4) Google Apps Script 응답이 2xx 또는 3xx ⇒ 성공 처리
    if (isRedirectOrOk(scriptRes)) {
      return NextResponse.json({ success: true, message: "상담 신청이 접수되었습니다." })
    }

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
    // 예상하지 못한 최상위 런타임 예외도 JSON으로 래핑
    return fail("서버 내부 오류가 발생했습니다.", 500, {
      debug: (err as Error)?.stack ?? String(err),
    })
  }
}
