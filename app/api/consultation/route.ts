import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("상담 신청 데이터:", body)

    // Google Apps Script URL
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.log("Google Script URL이 설정되지 않음 - 로컬 테스트 모드")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다. (로컬 테스트)",
      })
    }

    // Google Apps Script 호출
    console.log("Google Script 호출 시작...")
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Google Script 응답 상태:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Google Script 응답:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({
      success: false,
      message: "서버 오류가 발생했습니다: " + String(error),
    })
  }
}
