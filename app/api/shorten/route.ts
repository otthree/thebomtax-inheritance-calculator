import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Upstash Redis 설정
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// 단축 코드 생성 함수
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// POST: URL 단축
export async function POST(request: NextRequest) {
  try {
    const { originalUrl } = await request.json()

    if (!originalUrl) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 })
    }

    // 단축 코드 생성 (중복 체크)
    let shortCode: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortCode = generateShortCode()
      attempts++

      if (attempts > maxAttempts) {
        return NextResponse.json({ error: "단축 코드 생성에 실패했습니다." }, { status: 500 })
      }
    } while (await redis.exists(`short:${shortCode}`))

    // Redis에 저장 (24시간 TTL)
    await redis.setex(`short:${shortCode}`, 86400, originalUrl)

    // 한글 도메인으로 단축 URL 생성
    const shortUrl = `https://상속세더봄.com/s/${shortCode}`

    return NextResponse.json({ shortUrl })
  } catch (error) {
    console.error("URL 단축 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

// GET: 단축 URL 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortCode = searchParams.get("code")

    if (!shortCode) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    // Redis에서 데이터 조회
    const dataStr = await redis.get(`short:${shortCode}`)

    if (!dataStr) {
      return NextResponse.json({ error: "존재하지 않거나 만료된 링크입니다." }, { status: 404 })
    }

    let data
    try {
      data = JSON.parse(dataStr)
    } catch (parseError) {
      console.error("❌ URL 데이터 파싱 실패:", parseError)
      return NextResponse.json({ error: "링크 데이터가 손상되었습니다." }, { status: 500 })
    }

    // 클릭 수 증가
    await redis.hincrby(`short:${shortCode}`, "clicks", 1)

    console.log(`🔗 단축 URL 조회: ${shortCode} -> ${data.originalUrl}`)

    return NextResponse.json({
      originalUrl: data.originalUrl,
      shortCode,
      createdAt: data.createdAt,
      clicks: (data.clicks || 0) + 1,
    })
  } catch (error) {
    console.error("URL 조회 오류:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
