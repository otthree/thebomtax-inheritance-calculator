import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Google Apps Script 웹 앱 URL (.env.local에 설정)
    const gsUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
    if (!gsUrl) {
      return NextResponse.json({ success: false, message: "Google Script URL is missing." }, { status: 500 })
    }

    // 서버 환경은 CORS 제약이 없으므로 그대로 전달
    const gsRes = await fetch(gsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!gsRes.ok) {
      const text = await gsRes.text()
      return NextResponse.json({ success: false, message: "Google Script Error", detail: text }, { status: 500 })
    }

    const data = await gsRes.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 })
  }
}
