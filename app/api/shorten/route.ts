import { type NextRequest, NextResponse } from "next/server"

// Upstash Redis 설정
// const redis = new Redis({
//   url: process.env.KV_REST_API_URL!,
//   token: process.env.KV_REST_API_TOKEN!,
// })

const executeRedisCommand = async (command: string[]) => {
  const url = `${process.env.KV_REST_API_URL}/`
  const token = process.env.KV_REST_API_TOKEN

  if (!token) {
    console.warn("KV_REST_API_TOKEN is not defined")
    return null
  }

  const res = await fetch(url + command.map(encodeURIComponent).join("/"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  const body = await res.json()
  if (body.error) {
    throw new Error(`${body.error}`)
  }

  return body.result
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

// POST: URL 단축
export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("content-type") !== "application/json") {
      return NextResponse.json({ error: "Content-Type이 application/json이어야 합니다." }, { status: 400 })
    }

    const { originalUrl } = (await request.json()) as { originalUrl?: string }

    if (!originalUrl) {
      return NextResponse.json({ error: "originalUrl이 필요합니다." }, { status: 400 })
    }

    // URL 유효성 검사
    try {
      new URL(originalUrl)
    } catch {
      return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
    }

    /* 기존 단축 URL 재사용 여부 확인 */
    const existingCode = await executeRedisCommand(["GET", `url:${originalUrl}`])
    if (existingCode) {
      const shortUrl = `https://상속세더봄.com/s/${existingCode}`
      return NextResponse.json({ shortUrl, shortCode: existingCode, originalUrl, isExisting: true })
    }

    /* 새 단축 코드 생성 (중복 방지) */
    let shortCode = generateShortCode()
    let tries = 1
    while (await executeRedisCommand(["EXISTS", `short:${shortCode}`])) {
      if (tries++ > 10) {
        return NextResponse.json({ error: "단축 코드 생성에 실패했습니다." }, { status: 500 })
      }
      shortCode = generateShortCode()
    }

    /* Redis 저장 (24h TTL) — JSON 문자열로 저장해야 나중에 parse 가능 */
    const payload = JSON.stringify({
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
    })
    const ttl = 60 * 60 * 24

    await Promise.all([
      executeRedisCommand(["SETEX", `short:${shortCode}`, ttl, payload]),
      executeRedisCommand(["SETEX", `url:${originalUrl}`, ttl, shortCode]),
    ])

    const shortUrl = `https://상속세더봄.com/s/${shortCode}`
    return NextResponse.json({ shortUrl, shortCode, originalUrl, expiresIn: ttl })
  } catch (err) {
    console.error("URL 단축 오류:", err)
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
    await executeRedisCommand(["HINCRBY", `short:${shortCode}`, "clicks", "1"])

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
