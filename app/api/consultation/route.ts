import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Google Apps Script 웹 앱 URL (.env.local에 설정)
    const gsUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
    if (!gsUrl) {
      return NextResponse.json({
        success: false,
        message: "Google Script URL is missing.",
      })
    }

    let result: unknown
    try {
      const gsRes = await fetch(gsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        redirect: "follow",
      })

      try {
        result = await gsRes.json()
      } catch {
        result = { success: gsRes.status < 400, message: "Saved (no JSON returned)" }
      }
    } catch (error) {
      console.error(error)
      result = { success: false, message: "Server fetch error: " + String(error) }
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 })
  }
}
