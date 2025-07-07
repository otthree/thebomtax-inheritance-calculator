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
    const k = this.encKey(key)
    const v = this.encVal(value)
    const endpoint = ttl ? `${this.baseUrl}/setex/${k}/${ttl}/${v}` : `${this.baseUrl}/set/${k}/${v}`

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
    })
    if (!res.ok) throw new Error(`Redis SET failed: ${res.status} ${res.statusText}`)
    return res.json()
  }

  async get(key: string) {
    const endpoint = `${this.baseUrl}/get/${this.encKey(key)}`
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Redis GET failed: ${res.status} ${res.statusText}`)

    const { result } = (await res.json()) as { result: string | null }
    return result // encoded string | null
  }

  async incr(key: string) {
    const endpoint = `${this.baseUrl}/incr/${this.encKey(key)}`
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
    })
    if (!res.ok) throw new Error(`Redis INCR failed: ${res.status} ${res.statusText}`)
    return res.json()
  }

  async expire(key: string, seconds: number) {
    const endpoint = `${this.baseUrl}/expire/${this.encKey(key)}/${seconds}`
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
    })
    return res.json()
  }
}

const redis = new UpstashRedis()

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
    const { originalUrl } = await request.json()

    if (!originalUrl) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 })
    }
    try {
      new URL(originalUrl)
    } catch {
      return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
    }

    /* 1) 이미 존재하는지 확인 (원본 URL ➞ 코드) */
    const existingCode = await redis.get(`url:${originalUrl}`)
    if (existingCode) {
      const shortUrl = `${request.nextUrl.origin}/s/${existingCode}`
      return NextResponse.json({ shortUrl, shortCode: existingCode, originalUrl, cached: true })
    }

    /* 2) 새 코드 생성 (충돌 방지) */
    let shortCode = generateShortCode()
    while ((await redis.get(`short:${shortCode}`)) !== null) {
      shortCode = generateShortCode()
    }

    const shortUrl = `${request.nextUrl.origin}/s/${shortCode}`
    const urlData: ShortenedUrlData = {
      originalUrl,
      shortCode,
      createdAt: new Date().toISOString(),
    }

    /* 3) 저장 – 24시간 TTL */
    await Promise.all([
      redis.set(`short:${shortCode}`, urlData, TTL_24H),
      redis.set(`url:${originalUrl}`, shortCode, TTL_24H),
      redis.set(`clicks:${shortCode}`, 0, TTL_24H),
    ])

    return NextResponse.json({ shortUrl, shortCode, originalUrl, expiresIn: "24시간", cached: false })
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
    const code = request.nextUrl.searchParams.get("code")
    if (!code) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    const encoded = await redis.get(`short:${code}`)
    if (!encoded) {
      return NextResponse.json({ error: "존재하지 않거나 만료된 링크입니다." }, { status: 404 })
    }

    const urlData = JSON.parse(decodeURIComponent(encoded)) as ShortenedUrlData

    /* 클릭 수 증가 – 응답과 별개로 비동기 */
    redis.incr(`clicks:${code}`).catch(console.error)

    return NextResponse.json({ ...urlData })
  } catch (err) {
    console.error("❌ URL 조회 오류:", err)
    return NextResponse.json({ error: "URL 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

/* --------------------------------------------------------
 * PATCH  /api/shorten  – stats (clicks, createdAt, …)
 * ------------------------------------------------------ */
export async function PATCH(request: NextRequest) {
  try {
    const { shortCode } = await request.json()
    if (!shortCode) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    const [encoded, clicks] = await Promise.all([redis.get(`short:${shortCode}`), redis.get(`clicks:${shortCode}`)])

    if (!encoded) {
      return NextResponse.json({ error: "존재하지 않는 링크입니다." }, { status: 404 })
    }

    const urlData = JSON.parse(decodeURIComponent(encoded)) as ShortenedUrlData
    return NextResponse.json({ ...urlData, clicks: Number(clicks ?? 0), expiresIn: "24시간" })
  } catch (err) {
    console.error("❌ 통계 조회 오류:", err)
    return NextResponse.json({ error: "통계 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
