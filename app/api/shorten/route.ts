import { type NextRequest, NextResponse } from "next/server"

// Upstash Redis 클라이언트
class UpstashRedis {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = process.env.KV_REST_API_URL!
    this.token = process.env.KV_REST_API_TOKEN!
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    const url = `${this.baseUrl}/set/${key}`
    const body = JSON.stringify(value)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: ttlSeconds ? JSON.stringify([body, "EX", ttlSeconds]) : body,
    })

    if (!response.ok) {
      throw new Error(`Redis SET failed: ${response.statusText}`)
    }

    return response.json()
  }

  async get(key: string) {
    const url = `${this.baseUrl}/get/${key}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Redis GET failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
  }

  async incr(key: string) {
    const url = `${this.baseUrl}/incr/${key}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Redis INCR failed: ${response.statusText}`)
    }

    return response.json()
  }

  async expire(key: string, seconds: number) {
    const url = `${this.baseUrl}/expire/${key}/${seconds}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return response.json()
  }
}

const redis = new UpstashRedis()

interface ShortenedUrlData {
  originalUrl: string
  shortCode: string
  createdAt: string
}

// 6자리 랜덤 코드 생성
function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { originalUrl } = await request.json()

    if (!originalUrl) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 })
    }

    // URL 유효성 검사
    try {
      new URL(originalUrl)
    } catch {
      return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
    }

    // 이미 단축된 URL이 있는지 확인 (원본 URL을 키로 사용)
    const existingCode = await redis.get(`url:${originalUrl}`)
    if (existingCode) {
      const baseUrl = request.nextUrl.origin
      const shortUrl = `${baseUrl}/s/${existingCode}`

      return NextResponse.json({
        shortUrl,
        shortCode: existingCode,
        originalUrl,
        cached: true,
      })
    }

    // 새로운 단축 코드 생성 (중복 체크)
    let shortCode = generateShortCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const existing = await redis.get(`short:${shortCode}`)
      if (!existing) break

      shortCode = generateShortCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: "단축 코드 생성에 실패했습니다." }, { status: 500 })
    }

    const baseUrl = request.nextUrl.origin
    const shortUrl = `${baseUrl}/s/${shortCode}`

    const urlData: ShortenedUrlData = {
      originalUrl,
      shortCode,
      createdAt: new Date().toISOString(),
    }

    // 24시간 TTL (86400초)
    const TTL_SECONDS = 24 * 60 * 60

    // Redis에 저장
    await Promise.all([
      // 단축코드 -> 원본URL 매핑 (24시간 TTL)
      redis.set(`short:${shortCode}`, JSON.stringify(urlData), TTL_SECONDS),
      // 원본URL -> 단축코드 매핑 (24시간 TTL)
      redis.set(`url:${originalUrl}`, shortCode, TTL_SECONDS),
      // 클릭 카운터 초기화 (24시간 TTL)
      redis.set(`clicks:${shortCode}`, 0, TTL_SECONDS),
    ])

    console.log(`✅ URL 단축 성공: ${originalUrl} -> ${shortUrl}`)

    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl,
      expiresIn: "24시간",
      cached: false,
    })
  } catch (error) {
    console.error("❌ URL 단축 오류:", error)
    return NextResponse.json({ error: "URL 단축 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const shortCode = request.nextUrl.searchParams.get("code")

    if (!shortCode) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    // Redis에서 URL 데이터 조회
    const urlDataStr = await redis.get(`short:${shortCode}`)

    if (!urlDataStr) {
      return NextResponse.json(
        {
          error: "존재하지 않거나 만료된 링크입니다.",
        },
        { status: 404 },
      )
    }

    const urlData: ShortenedUrlData = JSON.parse(urlDataStr)

    // 클릭 수 증가 (비동기로 처리하여 응답 속도 향상)
    redis.incr(`clicks:${shortCode}`).catch((err) => {
      console.error("클릭 수 증가 실패:", err)
    })

    console.log(`🔗 리다이렉트: ${shortCode} -> ${urlData.originalUrl}`)

    return NextResponse.json({
      originalUrl: urlData.originalUrl,
      shortCode: urlData.shortCode,
      createdAt: urlData.createdAt,
    })
  } catch (error) {
    console.error("❌ URL 조회 오류:", error)
    return NextResponse.json({ error: "URL 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 통계 조회 API (선택사항)
export async function PATCH(request: NextRequest) {
  try {
    const { shortCode } = await request.json()

    if (!shortCode) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    const [urlDataStr, clicks] = await Promise.all([redis.get(`short:${shortCode}`), redis.get(`clicks:${shortCode}`)])

    if (!urlDataStr) {
      return NextResponse.json({ error: "존재하지 않는 링크입니다." }, { status: 404 })
    }

    const urlData: ShortenedUrlData = JSON.parse(urlDataStr)

    return NextResponse.json({
      ...urlData,
      clicks: clicks || 0,
      expiresIn: "24시간",
    })
  } catch (error) {
    console.error("❌ 통계 조회 오류:", error)
    return NextResponse.json({ error: "통계 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
