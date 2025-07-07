import { kv } from "@vercel/kv"
import { type NextRequest, NextResponse } from "next/server"

// 랜덤 ID 생성 함수
function generateShortId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const calculationData = await request.json()

    // 고유한 ID 생성 (중복 방지)
    let shortId: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortId = generateShortId()
      attempts++

      if (attempts > maxAttempts) {
        throw new Error("ID 생성 실패")
      }
    } while (await kv.exists(`share:${shortId}`))

    // Vercel KV에 24시간 TTL로 저장
    await kv.setex(`share:${shortId}`, 86400, JSON.stringify(calculationData)) // 24시간 = 86400초

    console.log(`단축 URL 생성 완료: ${shortId}`)

    return NextResponse.json({
      success: true,
      shortId,
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24시간 후
    })
  } catch (error) {
    console.error("단축 URL 생성 오류:", error)
    return NextResponse.json({ success: false, error: "단축 URL 생성에 실패했습니다." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortId = searchParams.get("id")

    if (!shortId) {
      return NextResponse.json({ success: false, error: "ID가 필요합니다." }, { status: 400 })
    }

    // Vercel KV에서 데이터 조회
    const data = await kv.get(`share:${shortId}`)

    if (!data) {
      return NextResponse.json({ success: false, error: "링크가 만료되었거나 존재하지 않습니다." }, { status: 404 })
    }

    console.log(`단축 URL 조회 성공: ${shortId}`)

    return NextResponse.json({
      success: true,
      data: typeof data === "string" ? JSON.parse(data) : data,
    })
  } catch (error) {
    console.error("단축 URL 조회 오류:", error)
    return NextResponse.json({ success: false, error: "데이터 조회에 실패했습니다." }, { status: 500 })
  }
}
