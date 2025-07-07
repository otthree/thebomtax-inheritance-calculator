import { type NextRequest, NextResponse } from "next/server"

// 메모리 기반 저장소 (실제 서비스에서는 데이터베이스 사용)
const urlStore = new Map<string, { originalUrl: string; createdAt: Date; clicks: number }>()

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

    // 이미 단축된 URL이 있는지 확인
    for (const [code, data] of urlStore.entries()) {
      if (data.originalUrl === originalUrl) {
        const shortUrl = `${request.nextUrl.origin}/s/${code}`
        return NextResponse.json({ shortUrl, code })
      }
    }

    // 새로운 단축 코드 생성
    let shortCode = generateShortCode()
    while (urlStore.has(shortCode)) {
      shortCode = generateShortCode()
    }

    // 저장
    urlStore.set(shortCode, {
      originalUrl,
      createdAt: new Date(),
      clicks: 0,
    })

    const shortUrl = `${request.nextUrl.origin}/s/${shortCode}`

    return NextResponse.json({ shortUrl, code: shortCode })
  } catch (error) {
    console.error("URL 단축 오류:", error)
    return NextResponse.json({ error: "URL 단축에 실패했습니다." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "코드가 필요합니다." }, { status: 400 })
    }

    const data = urlStore.get(code)

    if (!data) {
      return NextResponse.json({ error: "존재하지 않는 코드입니다." }, { status: 404 })
    }

    // 클릭 수 증가
    data.clicks += 1

    return NextResponse.json({ originalUrl: data.originalUrl })
  } catch (error) {
    console.error("URL 조회 오류:", error)
    return NextResponse.json({ error: "URL 조회에 실패했습니다." }, { status: 500 })
  }
}
