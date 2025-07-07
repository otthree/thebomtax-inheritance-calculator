import { type NextRequest, NextResponse } from "next/server"

/* --------------------------------------------------------
 * Upstash Redis – lightweight REST helper
 * ------------------------------------------------------ */
class UpstashRedis {
  private baseUrl: string
  private token: string

  constructor() {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error("⚠️  Upstash 환경 변수가 누락되었습니다.")
    }
    this.baseUrl = process.env.KV_REST_API_URL
    this.token = process.env.KV_REST_API_TOKEN
  }

  /* URL-encode keys so that '/', ':' 등 특수 문자가 안전해집니다. */
  private encKey(key: string) {
    return encodeURIComponent(key)
  }

  /* 문자열이 아니면 JSON 문자열로 직렬화 후 인코딩 */
  private encVal(val: unknown) {
    const str = typeof val === "string" ? val : JSON.stringify(val)
    return encodeURIComponent(str)
  }

  async set(key: string, value: unknown, ttl?: number) {
    try {
      const k = this.encKey(key)
      const v = this.encVal(value)
      const endpoint = ttl ? `${this.baseUrl}/setex/${k}/${ttl}/${v}` : `${this.baseUrl}/set/${k}/${v}`

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Redis SET failed: ${res.status} ${res.statusText} - ${errorText}`)
      }

      return res.json()
    } catch (error) {
      console.error("Redis SET 오류:", error)
      throw error
    }
  }

  async get(key: string) {
    try {
      const endpoint = `${this.baseUrl}/get/${this.encKey(key)}`
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (res.status === 404) return null

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Redis GET failed: ${res.status} ${res.statusText} - ${errorText}`)
      }

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        const text = await res.text()
        throw new Error(`Expected JSON response, got: ${text}`)
      }

      const data = await res.json()
      return data.result
    } catch (error) {
      console.error("Redis GET 오류:", error)
      throw error
    }
  }

  async incr(key: string) {
    try {
      const endpoint = `${this.baseUrl}/incr/${this.encKey(key)}`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Redis INCR failed: ${res.status} ${res.statusText} - ${errorText}`)
      }

      return res.json()
    } catch (error) {
      console.error("Redis INCR 오류:", error)
      throw error
    }
  }
}

let redis: UpstashRedis

try {
  redis = new UpstashRedis()
} catch (error) {
  console.error("❌ Upstash Redis 초기화 실패:", error)
}

/* --------------------------------------------------------
 * Types & helpers
 * ------------------------------------------------------ */
interface ShortenedUrlData {
  originalUrl: string
  shortCode: string
  createdAt: string
}

const TTL_24H = 24 * 60 * 60 // 24시간

function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

/* --------------------------------------------------------
 * POST  /api/shorten  – create (or return existing) short URL
 * ------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    // Redis 초기화 확인
    if (!redis) {
      console.error("❌ Redis 클라이언트가 초기화되지 않았습니다.")
      return NextResponse.json({ error: "서버 설정 오류입니다. 관리자에게 문의하세요." }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const { originalUrl } = body

    if (!originalUrl) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 })
    }

    // URL 유효성 검사
    try {
      new URL(originalUrl)
    } catch {
      return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
    }

    /* 1) 이미 존재하는지 확인 (원본 URL ➞ 코드) */
    let existingCode: string | null = null
    try {
      existingCode = await redis.get(`url:${originalUrl}`)
    } catch (error) {
      console.warn("기존 URL 조회 실패:", error)
      // 계속 진행
    }

    if (existingCode) {
      const shortUrl = `${request.nextUrl.origin}/s/${existingCode}`
      return NextResponse.json({
        shortUrl,
        code: existingCode,
        cached: true,
        expiresIn: "24시간",
      })
    }

    /* 2) 새 코드 생성 (충돌 방지) */
    let shortCode = generateShortCode()
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      try {
        const existing = await redis.get(`short:${shortCode}`)
        if (!existing) break
        shortCode = generateShortCode()
        attempts++
      } catch (error) {
        console.warn("코드 중복 확인 실패:", error)
        break // 오류 시 현재 코드 사용
      }
    }

    const shortUrl = `${request.nextUrl.origin}/s/${shortCode}`
    const urlData: ShortenedUrlData = {
      originalUrl,
      shortCode,
      createdAt: new Date().toISOString(),
    }

    /* 3) 저장 – 24시간 TTL */
    try {
      await Promise.all([
        redis.set(`short:${shortCode}`, urlData, TTL_24H),
        redis.set(`url:${originalUrl}`, shortCode, TTL_24H),
        redis.set(`clicks:${shortCode}`, 0, TTL_24H),
      ])

      console.log(`✅ URL 단축 성공: ${originalUrl} -> ${shortUrl}`)

      return NextResponse.json({
        shortUrl,
        code: shortCode,
        expiresIn: "24시간",
        cached: false,
      })
    } catch (error) {
      console.error("❌ Redis 저장 실패:", error)
      return NextResponse.json({ error: "URL 단축 저장에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 })
    }
  } catch (err) {
    console.error("❌ URL 단축 오류:", err)
    return NextResponse.json({ error: "URL 단축 중 오류가 발생했습니다." }, { status: 500 })
  }
}

/* --------------------------------------------------------
 * GET  /api/shorten?code=XXXXXX  – get original URL & count click
 * ------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    // Redis 초기화 확인
    if (!redis) {
      console.error("❌ Redis 클라이언트가 초기화되지 않았습니다.")
      return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 })
    }

    const code = request.nextUrl.searchParams.get("code")
    if (!code) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    // Redis에서 URL 데이터 조회
    let encoded: string | null = null
    try {
      encoded = await redis.get(`short:${code}`)
    } catch (error) {
      console.error("❌ Redis 조회 실패:", error)
      return NextResponse.json({ error: "링크 조회 중 오류가 발생했습니다." }, { status: 500 })
    }

    if (!encoded) {
      return NextResponse.json({ error: "존재하지 않거나 만료된 링크입니다." }, { status: 404 })
    }

    let urlData: ShortenedUrlData
    try {
      urlData = JSON.parse(decodeURIComponent(encoded))
    } catch (error) {
      console.error("❌ URL 데이터 파싱 실패:", error)
      return NextResponse.json({ error: "링크 데이터가 손상되었습니다." }, { status: 500 })
    }

    /* 클릭 수 증가 – 응답과 별개로 비동기 */
    redis.incr(`clicks:${code}`).catch((err) => {
      console.error("클릭 수 증가 실패:", err)
    })

    console.log(`🔗 리다이렉트: ${code} -> ${urlData.originalUrl}`)

    return NextResponse.json({
      originalUrl: urlData.originalUrl,
    })
  } catch (err) {
    console.error("❌ URL 조회 오류:", err)
    return NextResponse.json({ error: "URL 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
