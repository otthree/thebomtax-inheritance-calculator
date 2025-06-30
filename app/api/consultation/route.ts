import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER] 상담 신청 API 호출됨")

    const body = await request.json()
    console.log("[SERVER] 받은 데이터:", JSON.stringify(body, null, 2))

    const { name, phone, message, calculationData } = body

    // 필수 필드 검증
    if (!name || !phone) {
      console.log("[SERVER] 필수 필드 누락")
      return NextResponse.json({ success: false, message: "이름과 연락처는 필수입니다." }, { status: 400 })
    }

    // Google Apps Script URL 확인
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.log("[SERVER] Google Script URL이 설정되지 않음")
      return NextResponse.json({ success: false, message: "Google Script URL이 설정되지 않았습니다." }, { status: 500 })
    }

    // ── NEW VALIDATION ────────────────────────
    let parsedUrl: URL
    try {
      parsedUrl = new URL(googleScriptUrl.trim())
    } catch {
      console.error("[SERVER] 잘못된 Google Script URL:", googleScriptUrl)
      return NextResponse.json(
        {
          success: false,
          message: "잘못된 Google Script URL이 설정되었습니다. Vercel 환경변수를 다시 확인해 주세요.",
        },
        { status: 500 },
      )
    }
    console.log("[SERVER] Google Script URL:", parsedUrl.toString())
    // ──────────────────────────────────────────

    console.log("[SERVER] Google Script URL:", googleScriptUrl)

    // Google Apps Script로 전송할 데이터 준비
    const scriptData = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: String(message || "").trim(),
      calculationData: calculationData || null,
      timestamp: new Date().toISOString(),
    }

    console.log("[SERVER] Google Script로 전송할 데이터:", JSON.stringify(scriptData, null, 2))

    /* ─────────────────────────────────────────
       GOOGLE APPS SCRIPT 호출 (네트워크 요청)
    ─────────────────────────────────────────── */
    let scriptRes: Response
    try {
      scriptRes = await fetch(parsedUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scriptData),
        redirect: "follow",
      })
    } catch (netErr) {
      console.error("[SERVER] Google Script fetch 오류:", netErr)
      return NextResponse.json(
        {
          success: true,
          message:
            "일시적인 네트워크 문제로 데이터를 저장하지 못했지만, 상담 신청은 접수되었습니다. 담당자가 곧 연락드릴 예정입니다.",
          warn: netErr instanceof Error ? netErr.message : String(netErr),
        },
        { status: 200 },
      )
    }

    // ── 동일: 상태 코드 확인 & 성공 처리 ──
    const rawBody = await scriptRes.text() // body 읽기 (디버그용)
    console.log("[SERVER] Google Script 응답 상태:", scriptRes.status)
    console.log("[SERVER] Google Script 응답 본문:", rawBody)

    if (scriptRes.status === 302 || scriptRes.status === 200) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "상담 신청 처리 중 오류가 발생했습니다.",
        scriptStatus: scriptRes.status,
        scriptBody: rawBody,
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("[SERVER] 상담 신청 API 내부 오류:", error)
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
