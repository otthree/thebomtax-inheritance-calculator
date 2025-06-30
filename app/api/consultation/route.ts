import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const gsUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
    if (!gsUrl) {
      return NextResponse.json({ success: false, message: "Google Script URL is missing." })
    }

    // Apps Script 호출
    let gsResult: any = { success: false, message: "Unknown error" }
    try {
      const gsRes = await fetch(gsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        redirect: "follow",
      })

      // Apps Script 응답을 JSON 시도 → 실패 시 text 로 대체
      const isJson = gsRes.headers.get("content-type")?.includes("application/json")
      gsResult = isJson ? await gsRes.json() : { success: gsRes.ok, message: await gsRes.text() }
    } catch (err) {
      gsResult = { success: false, message: "Fetch to Google Script failed: " + String(err) }
    }

    return NextResponse.json(gsResult)
  } catch (err) {
    console.error("API Route Error:", err)
    return NextResponse.json({ success: false, message: "Server Error: " + String(err) })
  }
}
