import { type NextRequest, NextResponse } from "next/server"

// Upstash Redis REST API 설정
const UPSTASH_REDIS_REST_URL = process.env.KV_REST_API_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.KV_REST_API_TOKEN

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error("❌ Upstash Redis 환경변수가 설정되지 않았습니다.")
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

// Redis 명령 실행 함수
async function executeRedisCommand(command: string[]): Promise<any> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Redis 설정이 누락되었습니다.")
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

    // Redis에 데이터 저장 (24시간 TTL)
    const ttl = 24 * 60 * 60 // 24시간

    await Promise.all([
      executeRedisCommand([
        "SETEX",
        `short:${shortCode}`,
        ttl,
        JSON.stringify({
          originalUrl,
          createdAt: new Date().toISOString(),
          clicks: 0,
        }),
      ]),
      executeRedisCommand(["SETEX", `url:${originalUrl}`, ttl, shortCode]),
    ])

    const shortUrl = `${request.nextUrl.origin}/s/${shortCode}`

    console.log(`✅ URL 단축 성공: ${originalUrl} -> ${shortUrl}`)

    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl,
      expiresIn: ttl,
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

    // Redis에서 데이터 조회
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

    // 클릭 수 증가
    await executeRedisCommand(["HINCRBY", `short:${shortCode}`, "clicks", 1])

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
