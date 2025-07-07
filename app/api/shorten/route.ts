import { type NextRequest, NextResponse } from "next/server"

/* --------------------------------------------------------
 * 환경 변수 확인 및 fallback 처리
 * ------------------------------------------------------ */
const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.KV_REST_API_URL
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN

console.log("🔍 환경 변수 확인:")
console.log("- KV_REST_API_URL:", process.env.KV_REST_API_URL ? "✅ 설정됨" : "❌ 없음")
console.log("- KV_REST_API_TOKEN:", process.env.KV_REST_API_TOKEN ? "✅ 설정됨" : "❌ 없음")
console.log("- UPSTASH_REDIS_REST_URL:", process.env.KV_REST_API_URL ? "✅ 설정됨" : "❌ 없음")
console.log("- UPSTASH_REDIS_REST_TOKEN:", process.env.KV_REST_API_TOKEN ? "✅ 설정됨" : "❌ 없음")

/* --------------------------------------------------------
 * 메모리 기반 fallback 저장소
 * ------------------------------------------------------ */
const memoryStore = new Map<string, { data: any; expires: number }>()

function cleanupExpired() {
  const now = Date.now()
  for (const [key, value] of memoryStore.entries()) {
    if (value.expires < now) {
      memoryStore.delete(key)
    }
  }
}

class MemoryStorage {
  async set(key: string, value: unknown, ttlSeconds?: number) {
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Date.now() + 24 * 60 * 60 * 1000
    memoryStore.set(key, { data: value, expires })
    cleanupExpired()
    return { result: "OK" }
  }

  async get(key: string) {
    cleanupExpired()
    const item = memoryStore.get(key)
    if (!item || item.expires < Date.now()) {
      return null
    }
    return item.data
  }

  async incr(key: string) {
    cleanupExpired()
    const item = memoryStore.get(key)
    const currentValue = item?.data || 0
    const newValue = Number(currentValue) + 1
    memoryStore.set(key, { data: newValue, expires: item?.expires || Date.now() + 24 * 60 * 60 * 1000 })
    return { result: newValue }
  }
}

/* --------------------------------------------------------
 * Upstash Redis 클라이언트
 * ------------------------------------------------------ */
class UpstashRedis {
  private baseUrl: string
  private token: string

  constructor() {
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      throw new Error("⚠️  Upstash 환경 변수가 누락되었습니다.")
    }
    this.baseUrl = UPSTASH_URL
    this.token = UPSTASH_TOKEN
  }

  private encKey(key: string) {
    return encodeURIComponent(key)
  }

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

/* --------------------------------------------------------
 * 저장소 초기화 (Redis 또는 Memory fallback)
 * ------------------------------------------------------ */
let storage: UpstashRedis | MemoryStorage

try {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    storage = new UpstashRedis()
    console.log("✅ Upstash Redis 클라이언트 초기화 성공")
  } else {
    storage = new MemoryStorage()
    console.log("⚠️  Upstash 환경 변수 없음 - 메모리 저장소 사용")
  }
} catch (error) {
  console.error("❌ Redis 초기화 실패, 메모리 저장소로 fallback:", error)
  storage = new MemoryStorage()
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
      existingCode = await storage.get(`url:${originalUrl}`)
    } catch (error) {
      console.warn("기존 URL 조회 실패:", error)
      // 계속 진행
    }

    if (existingCode) {
      const shortUrl = `${request.nextUrl.origin}/s/${existingCode}`
      return NextResponse.json({
        shortUrl,
        shortCode: existingCode,
        originalUrl,
        cached: true,
        expiresIn: "24시간",
        storage: storage instanceof UpstashRedis ? "redis" : "memory",
      })
    }

    /* 2) 새 코드 생성 (충돌 방지) */
    let shortCode = generateShortCode()
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      try {
        const existing = await storage.get(`short:${shortCode}`)
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
        storage.set(`short:${shortCode}`, urlData, TTL_24H),
        storage.set(`url:${originalUrl}`, shortCode, TTL_24H),
        storage.set(`clicks:${shortCode}`, 0, TTL_24H),
      ])

      console.log(`✅ URL 단축 성공: ${originalUrl} -> ${shortUrl}`)

      return NextResponse.json({
        shortUrl,
        shortCode,
        originalUrl,
        expiresIn: "24시간",
        cached: false,
        storage: storage instanceof UpstashRedis ? "redis" : "memory",
      })
    } catch (error) {
      console.error("❌ 저장 실패:", error)
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
    const code = request.nextUrl.searchParams.get("code")
    if (!code) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    // 저장소에서 URL 데이터 조회
    let encoded: string | null = null
    try {
      const result = await storage.get(`short:${code}`)
      encoded = typeof result === "string" ? result : result ? JSON.stringify(result) : null
    } catch (error) {
      console.error("❌ 저장소 조회 실패:", error)
      return NextResponse.json({ error: "링크 조회 중 오류가 발생했습니다." }, { status: 500 })
    }

    if (!encoded) {
      return NextResponse.json({ error: "존재하지 않거나 만료된 링크입니다." }, { status: 404 })
    }

    let urlData: ShortenedUrlData
    try {
      // 이미 객체인 경우와 문자열인 경우 모두 처리
      if (typeof encoded === "object") {
        urlData = encoded as ShortenedUrlData
      } else {
        urlData = JSON.parse(decodeURIComponent(encoded))
      }
    } catch (error) {
      console.error("❌ URL 데이터 파싱 실패:", error)
      return NextResponse.json({ error: "링크 데이터가 손상되었습니다." }, { status: 500 })
    }

    /* 클릭 수 증가 – 응답과 별개로 비동기 */
    storage.incr(`clicks:${code}`).catch((err) => {
      console.error("클릭 수 증가 실패:", err)
    })

    console.log(`🔗 리다이렉트: ${code} -> ${urlData.originalUrl}`)

    return NextResponse.json({
      originalUrl: urlData.originalUrl,
      shortCode: urlData.shortCode,
      createdAt: urlData.createdAt,
      storage: storage instanceof UpstashRedis ? "redis" : "memory",
    })
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
    const body = await request.json().catch(() => ({}))
    const { shortCode } = body

    if (!shortCode) {
      return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
    }

    const [encoded, clicks] = await Promise.all([
      storage.get(`short:${shortCode}`).catch(() => null),
      storage.get(`clicks:${shortCode}`).catch(() => null),
    ])

    if (!encoded) {
      return NextResponse.json({ error: "존재하지 않는 링크입니다." }, { status: 404 })
    }

    let urlData: ShortenedUrlData
    if (typeof encoded === "object") {
      urlData = encoded as ShortenedUrlData
    } else {
      urlData = JSON.parse(decodeURIComponent(encoded))
    }

    return NextResponse.json({
      ...urlData,
      clicks: Number(clicks ?? 0),
      expiresIn: "24시간",
      storage: storage instanceof UpstashRedis ? "redis" : "memory",
    })
  } catch (err) {
    console.error("❌ 통계 조회 오류:", err)
    return NextResponse.json({ error: "통계 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
