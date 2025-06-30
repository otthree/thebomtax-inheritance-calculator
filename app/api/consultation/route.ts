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

    if (!googleScriptUrl || googleScriptUrl === "REPLACE_WITH_YOUR_GOOGLE_SCRIPT_URL") {
      console.log("[SERVER] Google Script URL이 설정되지 않음 또는 기본값")
      return NextResponse.json(
        {
          success: false,
          message: "Google Apps Script가 설정되지 않았습니다. 관리자에게 문의하세요.",
          debug: "GOOGLE_SCRIPT_URL_NOT_CONFIGURED",
        },
        { status: 500 },
      )
    }

    // URL 형식 검증
    if (!googleScriptUrl.includes("script.google.com") || !googleScriptUrl.includes("/exec")) {
      console.log("[SERVER] 잘못된 Google Script URL 형식:", googleScriptUrl)
      return NextResponse.json(
        {
          success: false,
          message: "Google Apps Script URL 형식이 올바르지 않습니다.",
          debug: "INVALID_GOOGLE_SCRIPT_URL_FORMAT",
        },
        { status: 500 },
      )
    }

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

    // Google Apps Script 호출
    let scriptRes: Response
    try {
      console.log("[SERVER] Google Apps Script 호출 시작...")

      scriptRes = await fetch(googleScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "NextJS-App/1.0",
        },
        body: JSON.stringify(scriptData),
        redirect: "follow",
      })

      console.log("[SERVER] Google Apps Script 호출 완료, 상태:", scriptRes.status)
    } catch (netErr) {
      console.error("[SERVER] Google Script fetch 오류:", netErr)

      // 네트워크 오류의 구체적인 원인 파악
      let errorMessage = "Google Apps Script 호출 중 오류가 발생했습니다."
      let debugInfo = ""

      if (netErr instanceof Error) {
        if (netErr.message.includes("Failed to fetch")) {
          errorMessage =
            "Google Apps Script에 연결할 수 없습니다. URL이 올바른지 확인하고, 스크립트가 배포되었는지 확인해주세요."
          debugInfo = "FETCH_FAILED - 스크립트가 배포되지 않았거나 URL이 잘못되었을 수 있습니다."
        } else if (netErr.message.includes("CORS")) {
          errorMessage = "CORS 오류가 발생했습니다. Google Apps Script 설정을 확인해주세요."
          debugInfo = "CORS_ERROR"
        } else {
          debugInfo = netErr.message
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          debug: debugInfo,
          url: googleScriptUrl.substring(0, 50) + "...", // URL 일부만 표시 (보안)
        },
        { status: 502 },
      )
    }

    // -------- 응답 처리 --------
    // 302 또는 200 은 성공으로 간주
    if (scriptRes.status === 302 || scriptRes.status === 200) {
      console.log("[SERVER] 상담 신청 성공 (status:", scriptRes.status, ")")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    // 기타 상태는 실패로 간주 ─ 이때만 body 를 읽음
    let rawBody = ""
    try {
      rawBody = await scriptRes.text()
    } catch {
      /* body 가 없어도 무시 */
    }

    console.error("[SERVER] Google Script 오류 상태:", scriptRes.status, rawBody)
    return NextResponse.json(
      {
        success: false,
        message: "상담 신청 처리 중 오류가 발생했습니다.",
        debug: `Google Script returned status ${scriptRes.status}`,
        scriptBody: rawBody.substring(0, 200),
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
