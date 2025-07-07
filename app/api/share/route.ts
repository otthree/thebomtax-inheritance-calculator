import { kv } from "@vercel/kv"
import { type NextRequest, NextResponse } from "next/server"

// 8자리 랜덤 ID 생성 함수
function generateShortId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// POST: 데이터 저장하고 단축 ID 반환
export async function POST(request: NextRequest) {
  try {
    const calculationData = await request.json()

    // 새로운 ID 생성 (중복 방지)
    let shortId: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortId = generateShortId()
      attempts++

      if (attempts > maxAttempts) {
        throw new Error("Failed to generate unique ID")
      }
    } while (await kv.exists(`share:${shortId}`))

    // Vercel KV에 데이터 저장 (24시간 TTL)
    await kv.setex(
      `share:${shortId}`,
      24 * 60 * 60,
      JSON.stringify({
        data: calculationData,
        createdAt: Date.now(),
      }),
    )

    console.log(`데이터 저장 완료: ${shortId}`)

    return NextResponse.json({ shortId })
  } catch (error) {
    console.error("Error storing data:", error)
    return NextResponse.json(
      {
        error: "Failed to store data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
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

    // Vercel KV에서 데이터 조회
    const storedData = await kv.get(`share:${shortId}`)

    if (!storedData) {
      console.log(`데이터를 찾을 수 없음: ${shortId}`)
      return NextResponse.json(
        {
          error: "Share link not found or expired",
        },
        { status: 404 },
      )
    }

    // JSON 파싱
    const parsed = typeof storedData === "string" ? JSON.parse(storedData) : storedData

    console.log(`데이터 조회 완료: ${shortId}`)

    return NextResponse.json({ data: parsed.data })
  } catch (error) {
    console.error("Error retrieving data:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE: 단축 ID 데이터 삭제 (선택적)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortId = searchParams.get("id")

    if (!shortId) {
      return NextResponse.json({ error: "Short ID is required" }, { status: 400 })
    }

    await kv.del(`share:${shortId}`)

    console.log(`데이터 삭제 완료: ${shortId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting data:", error)
    return NextResponse.json(
      {
        error: "Failed to delete data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
