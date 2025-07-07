import { type NextRequest, NextResponse } from "next/server"

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
}

// 메모리 저장소 (실제 서비스에서는 데이터베이스 사용)
const urlDatabase = new Map<string, ShortenedUrl>()

// 랜덤 단축 코드 생성
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
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

    // 이미 단축된 URL인지 확인
    for (const [code, data] of urlDatabase.entries()) {
      if (data.originalUrl === originalUrl) {
        return NextResponse.json({
          shortUrl: data.shortUrl,
          shortCode: data.shortCode,
          originalUrl: data.originalUrl,
        })
      }
    }

    // 새로운 단축 URL 생성
    let shortCode = generateShortCode()

    // 중복 코드 체크
    while (urlDatabase.has(shortCode)) {
      shortCode = generateShortCode()
    }

    const baseUrl = request.nextUrl.origin
    const shortUrl = `${baseUrl}/s/${shortCode}`

    const shortenedUrl: ShortenedUrl = {
      id: Date.now().toString(),
      originalUrl,
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
    }

    urlDatabase.set(shortCode, shortenedUrl)

    return NextResponse.json({
      shortUrl: shortenedUrl.shortUrl,
      shortCode: shortenedUrl.shortCode,
      originalUrl: shortenedUrl.originalUrl,
    })
  } catch (error) {
    console.error("URL 단축 오류:", error)
    return NextResponse.json({ error: "URL 단축 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const shortCode = request.nextUrl.searchParams.get("code")

  if (!shortCode) {
    return NextResponse.json({ error: "단축 코드가 필요합니다." }, { status: 400 })
  }

  const urlData = urlDatabase.get(shortCode)

  if (!urlData) {
    return NextResponse.json({ error: "URL을 찾을 수 없습니다." }, { status: 404 })
  }

  // 클릭 수 증가
  urlData.clicks++
  urlDatabase.set(shortCode, urlData)

  return NextResponse.json({
    originalUrl: urlData.originalUrl,
    clicks: urlData.clicks,
  })
}
