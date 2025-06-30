import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("=== API 라우트 시작 ===")

    const body = await request.json()
    console.log("클라이언트에서 받은 데이터:", JSON.stringify(body, null, 2))

    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.log("Google Script URL이 설정되지 않음")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다. (로컬 처리)",
        data: body,
      })
    }

    console.log("Google Script URL:", googleScriptUrl)

    // 전송할 데이터 준비
    const dataToSend = {
      name: body.name?.trim() || "",
      phone: body.phone?.trim() || "",
      message: body.message?.trim() || "",
      calculationData: body.calculationData || null,
      timestamp: new Date().toISOString(),
    }

    console.log("Google Script로 전송할 데이터:", JSON.stringify(dataToSend, null, 2))

    // 첫 번째 요청
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
      redirect: "manual", // 리다이렉트를 수동으로 처리
    })

    console.log("Google Script 응답 상태:", response.status)
    console.log("Google Script 응답 헤더:", Object.fromEntries(response.headers.entries()))

    let finalResponse = response

    // 302 리다이렉트 처리
    if (response.status === 302) {
      const redirectUrl = response.headers.get("location")
      console.log("리다이렉트 URL:", redirectUrl)

      if (redirectUrl) {
        console.log("리다이렉트 URL로 재요청 시작")
        finalResponse = await fetch(redirectUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        })
        console.log("리다이렉트 응답 상태:", finalResponse.status)
      }
    }

    const responseText = await finalResponse.text()
    console.log("Google Script 응답 본문:", responseText)

    // JSON 응답인지 확인
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log("파싱된 응답 데이터:", responseData)
    } catch (parseError) {
      console.log("JSON 파싱 실패, HTML 응답으로 추정")
      // HTML 응답이면 성공으로 간주 (Google Apps Script의 특성)
      responseData = {
        success: true,
        message: "상담 신청이 접수되었습니다.",
        rawResponse: responseText.substring(0, 200) + "...",
      }
    }

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      message: responseData.message || "상담 신청이 접수되었습니다.",
      data: responseData.data || dataToSend,
      debug: {
        status: finalResponse.status,
        redirected: response.status === 302,
        responseType: responseData ? "JSON" : "HTML",
      },
    })
  } catch (error) {
    console.error("API 라우트 오류:", error)
    console.error("오류 스택:", error instanceof Error ? error.stack : "스택 없음")

    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
