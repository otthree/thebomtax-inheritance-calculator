import { type NextRequest, NextResponse } from "next/server"

// 서버 메모리에 데이터 저장하는 Map 객체
const dataStore = new Map<string, { data: any; timestamp: number }>()

// 8자리 랜덤 ID 생성 함수
function generateShortId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 24시간 지난 데이터 삭제 함수
function cleanupExpiredData() {
  const now = Date.now()
  const expireTime = 24 * 60 * 60 * 1000 // 24시간

  for (const [key, value] of dataStore.entries()) {
    if (now - value.timestamp > expireTime) {
      dataStore.delete(key)
    }
  }
}

// POST: 데이터 저장하고 단축 ID 반환
export async function POST(request: NextRequest) {
  try {
    const calculationData = await request.json()

    // 만료된 데이터 정리
    cleanupExpiredData()

    // 새로운 ID 생성 (중복 방지)
    let shortId: string
    do {
      shortId = generateShortId()
    } while (dataStore.has(shortId))

    // 메모리에 데이터 저장
    dataStore.set(shortId, {
      data: calculationData,
      timestamp: Date.now(),
    })

    return NextResponse.json({ shortId })
  } catch (error) {
    console.error("Error storing data:", error)
    return NextResponse.json({ error: "Failed to store data" }, { status: 500 })
  }
}

// GET: 단축 ID로 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortId = searchParams.get("id")

    if (!shortId) {
      return NextResponse.json({ error: "Short ID is required" }, { status: 400 })
    }

    // 만료된 데이터 정리
    cleanupExpiredData()

    // 데이터 조회
    const stored = dataStore.get(shortId)

    if (!stored) {
      return NextResponse.json({ error: "Data not found or expired" }, { status: 404 })
    }

    // 24시간 경과 확인
    const now = Date.now()
    const expireTime = 24 * 60 * 60 * 1000

    if (now - stored.timestamp > expireTime) {
      dataStore.delete(shortId)
      return NextResponse.json({ error: "Data has expired" }, { status: 404 })
    }

    return NextResponse.json(stored.data)
  } catch (error) {
    console.error("Error retrieving data:", error)
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 })
  }
}
