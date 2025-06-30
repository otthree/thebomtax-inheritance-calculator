import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Google Apps Script 웹 앱 URL (.env.local에 설정)
    const gsUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
    if (!gsUrl) {
      return NextResponse.json({ success: false, message: "Google Script URL is missing." }, { status: 500 })
    }

    // 1) Apps Script 호출
    const gsRes = await fetch(gsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    })

    // 2) 200-399 는 모두 성공으로 처리
    if (gsRes.status >= 400) {
      const text = await gsRes.text()
      return NextResponse.json({ success: false, message: "Google Script Error", detail: text }, { status: 500 })
    }

    // 3) JSON 응답이 없는 경우 방어
    let data: unknown
    try {
      data = await gsRes.json()
    } catch {
      data = { success: true, message: "Saved (no JSON returned)" }
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 })
  }
}
