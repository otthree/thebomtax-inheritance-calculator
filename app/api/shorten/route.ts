import { type NextRequest, NextResponse } from "next/server"

// Upstash Redis REST API 설정
const UPSTASH_REDIS_REST_URL = process.env.KV_REST_API_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.KV_REST_API_TOKEN

// 메모리 기반 fallback 저장소
const memoryStore = new Map<string, any>()
const memoryExpiry = new Map<string, number>()

// Redis 사용 가능 여부 확인
const isRedisAvailable = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)

if (!isRedisAvailable) {
  console.warn("⚠️ Upstash Redis 환경변수가 설정되지 않았습니다. 메모리 저장소를 사용합니다.")
}

// 단축 코드 생성 함수
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 메모리 저장소 만료 확인 및 정리
function cleanExpiredMemoryEntries() {
  const now = Date.now()
  for (const [key, expiry] of memoryExpiry.entries()) {
    if (now > expiry) {
      memoryStore.delete(key)
      memoryExpiry.delete(key)
    }
  }
}

// 메모리 저장소 함수들
function memorySet(key: string, value: any, ttlSeconds?: number) {
  memoryStore.set(key, value)
  if (ttlSeconds) {
    memoryExpiry.set(key, Date.now() + ttlSeconds * 1000)
  }
}

function memoryGet(key: string): any {
  cleanExpiredMemoryEntries()
  return memoryStore.get(key) || null
}

function memoryExists(key: string): boolean {
  cleanExpiredMemoryEntries()
  return memoryStore.has(key)
}

// Redis 명령 실행 함수
async function executeRedisCommand(command: string[]): Promise<any> {
  if (!isRedisAvailable) {
    // 메모리 저장소 fallback
    const [cmd, key, ...args] = command

    switch (cmd.toUpperCase()) {
      case "GET":
        return memoryGet(key)
      case "SET":
        memorySet(key, args[0])
        return "OK"
      case "SETEX":
        memorySet(key, args[1], Number.parseInt(args[0]))
        return "OK"
      case "EXISTS":
        return memoryExists(key) ? 1 : 0
      case "HINCRBY":
        const current = memoryGet(key) || {}
        const field = args[0]
        const increment = Number.parseInt(args[1]) || 1
        current[field] = (current[field] || 0) + increment
        memorySet(key, current)
        return current[field]
      default:
        return null
    }
  }

  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command]),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Redis API 오류:", errorText)
    throw new Error(`Redis API 오류: ${response.status}`)
  }

  const results = await response.json()
  return results[0]?.result
}

// POST: URL 단축
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type이 application/json이어야 합니다." }, { status: 400 })
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError)
      return NextResponse.json({ error: "잘못된 JSON 형식입니다." }, { status: 400 })
    }

    const { originalUrl } = body

    if (!originalUrl || typeof originalUrl !== "string") {
      return NextResponse.json({ error: "originalUrl이 필요합니다." }, { status: 400 })
    }

    // URL 유효성 검사
    try {
      new URL(originalUrl)
    } catch {
      return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
    }

    // 기존 단축 URL 확인
    const existingCode = await executeRedisCommand(["GET", `url:${originalUrl}`])

    if (existingCode) {
      const shortUrl = `${request.nextUrl.origin}/s/${existingCode}`
      console.log(`🔄 기존 단축 URL 재사용: ${originalUrl} -> ${shortUrl}`)

      return NextResponse.json({
        shortUrl,
        shortCode: existingCode,
        originalUrl,
        isExisting: true,
        storage: isRedisAvailable ? "redis" : "memory",
      })
    }

    // 새 단축 코드 생성 (중복 방지)
    let shortCode: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortCode = generateShortCode()
      attempts++

      if (attempts > maxAttempts) {
        return NextResponse.json({ error: "단축 코드 생성에 실패했습니다." }, { status: 500 })
      }
    } while (await executeRedisCommand(["EXISTS", `short:${shortCode}`]))

    // 저장소에 데이터 저장 (24시간 TTL)
    const ttl = 24 * 60 * 60 // 24시간
    const urlData = {
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
    }

    await Promise.all([
      executeRedisCommand(["SETEX", `short:${shortCode}`, ttl.toString(), JSON.stringify(urlData)]),
      executeRedisCommand(["SETEX", `url:${originalUrl}`, ttl.toString(), shortCode]),
    ])

    const shortUrl = `${request.nextUrl.origin}/s/${shortCode}`

    console.log(`✅ URL 단축 성공 (${isRedisAvailable ? "Redis" : "Memory"}): ${originalUrl} -> ${shortUrl}`)

    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl,
      expiresIn: ttl,
      storage: isRedisAvailable ? "redis" : "memory",
    })
  } catch (error) {
    console.error("URL 단축 오류:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
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

    // 저장소에서 데이터 조회
    const dataStr = await executeRedisCommand(["GET", `short:${shortCode}`])

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

    // 클릭 수 증가 (비동기로 처리하여 응답 속도 향상)
    executeRedisCommand(["HINCRBY", `short:${shortCode}`, "clicks", "1"]).catch((err) => {
      console.warn("클릭 수 증가 실패:", err)
    })

    console.log(`🔗 단축 URL 조회 (${isRedisAvailable ? "Redis" : "Memory"}): ${shortCode} -> ${data.originalUrl}`)

    return NextResponse.json({
      originalUrl: data.originalUrl,
      shortCode,
      createdAt: data.createdAt,
      clicks: (data.clicks || 0) + 1,
      storage: isRedisAvailable ? "redis" : "memory",
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
