import { type NextRequest, NextResponse } from "next/server"

// 메모리 저장소 (실제 운영환경에서는 데이터베이스 사용 권장)
const shareData = new Map<string, any>()

// 간단한 ID 생성기
function generateShortId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 짧은 ID 생성
    let shortId = generateShortId()

    // 중복 확인 (매우 낮은 확률이지만)
    while (shareData.has(shortId)) {
      shortId = generateShortId()
    }

    // 데이터 저장 (24시간 후 자동 삭제)
    shareData.set(shortId, {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
    })

    // 만료된 데이터 정리
    cleanupExpiredData()

    return NextResponse.json({ shortId })
  } catch (error) {
    console.error("Share API error:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortId = searchParams.get("id")

    if (!shortId) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 })
    }

    const stored = shareData.get(shortId)

    if (!stored) {
      return NextResponse.json({ error: "Share link not found or expired" }, { status: 404 })
    }

    // 만료 확인
    if (Date.now() > stored.expiresAt) {
      shareData.delete(shortId)
      return NextResponse.json({ error: "Share link expired" }, { status: 404 })
    }

    return NextResponse.json({ data: stored.data })
  } catch (error) {
    console.error("Share API error:", error)
    return NextResponse.json({ error: "Failed to retrieve share data" }, { status: 500 })
  }
}

// 만료된 데이터 정리 함수
function cleanupExpiredData() {
  const now = Date.now()
  for (const [key, value] of shareData.entries()) {
    if (now > value.expiresAt) {
      shareData.delete(key)
    }
  }
}
