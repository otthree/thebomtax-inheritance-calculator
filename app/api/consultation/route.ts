import { NextResponse } from "next/server"

/**
 * 상담 신청을 Google Apps Script 로 전달한다.
 * 어떤 상황에서도 JSON 응답을 반환하여
 * 클라이언트가 `response.json()` 을 안전하게 호출할 수 있도록 한다.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 디버깅: 받은 데이터 로그
    console.log("=== API 라우트에서 받은 데이터 ===")
    console.log("전체 body:", JSON.stringify(body, null, 2))
    console.log("이름:", body.name)
    console.log("전화번호:", body.phone)
    console.log("상담내용:", body.message)
    console.log("계산데이터:", body.calculationData ? "있음" : "없음")

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    /* 로컬 / CI 등 스크립트 URL 이 없을 때는 바로 성공 처리 */
    if (!scriptUrl) {
      console.log("Google Script URL이 설정되지 않음 - 로컬 환경으로 처리")
      return NextResponse.json({
        success: true,
        message: "로컬 환경 – 상담 신청이 접수되었습니다.",
        debug: {
          name: body.name,
          phone: body.phone,
          message: body.message,
        },
      })
    }

    console.log("Google Script URL:", scriptUrl)

    /* Google Apps Script 호출 */
    const payload = {
      name: body.name || "",
      phone: body.phone || "",
      message: body.message || "",
      calculationData: body.calculationData || null,
      timestamp: new Date().toISOString(),
    }

    console.log("Google Script로 전송할 데이터:", JSON.stringify(payload, null, 2))

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "manual", // 302 도 직접 확인
    })

    console.log("Google Script 응답 상태:", res.status)
    console.log("Google Script 응답 헤더:", Object.fromEntries(res.headers.entries()))

    // 2xx 또는 302(Found) → 성공 간주
    if (res.ok || res.status === 302) {
      let responseText = ""
      try {
        responseText = await res.text()
        console.log("Google Script 응답 본문:", responseText)
      } catch (e) {
        console.log("응답 본문 읽기 실패:", e)
      }

      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
        debug: {
          status: res.status,
          sentData: payload,
        },
      })
    }

    /* 실패 시: 본문을 그대로 전달하여 디버깅에 활용 */
    const errorText = await res.text()
    console.log("Google Script 오류 응답:", errorText)

    return NextResponse.json(
      {
        success: false,
        message: `Google Script 오류 – ${res.status}`,
        detail: errorText,
        debug: {
          sentData: payload,
          status: res.status,
        },
      },
      { status: 500 },
    )
  } catch (err: any) {
    console.error("API 라우트 오류:", err)
    /* 모든 예외를 JSON 으로 반환 */
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        detail: err?.message ?? String(err),
        debug: {
          error: err?.stack || err?.toString(),
        },
      },
      { status: 500 },
    )
  }
}
