import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const payload = await request.json()
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL

  if (!scriptUrl) {
    return NextResponse.json({
      success: false,
      message: "Google Apps Script URL is not defined.",
    })
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 302(Found)를 직접 확인하기 위해 manual 로 설정
      redirect: "manual",
    })

    // 200 또는 302 모두 정상으로 처리
    if (res.ok || res.status === 302) {
      return NextResponse.json({
        success: true,
        message: "상담 신청이 접수되었습니다.",
      })
    }

    const errorText = await res.text()
    console.error("Google Apps Script Error:", errorText)

    return NextResponse.json({
      success: false,
      message: `상담 신청에 실패했습니다. 오류가 계속되면 관리자에게 문의해주세요. ${res.status} - ${errorText}`,
    })
  } catch (error: any) {
    console.error("Fetch Error:", error)
    return NextResponse.json({
      success: false,
      message: `상담 신청에 실패했습니다. 오류가 계속되면 관리자에게 문의해주세요. ${error.message}`,
    })
  }
}
