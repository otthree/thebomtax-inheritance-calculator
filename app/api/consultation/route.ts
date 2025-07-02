import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // calculationData에서 BigInt, NaN, Infinity 값들을 안전한 값으로 변환
    const sanitizeData = (obj: any): any => {
      if (obj === null || obj === undefined) return obj

      if (typeof obj === "bigint") {
        return obj.toString()
      }

      if (typeof obj === "number") {
        if (isNaN(obj)) return null
        if (!isFinite(obj)) return null
        return obj
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeData)
      }

      if (typeof obj === "object") {
        const sanitized: any = {}
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeData(value)
        }
        return sanitized
      }

      return obj
    }

    const sanitizedBody = sanitizeData(body)

    // 환경 변수 확인 - 두 가지 모두 체크
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.error("Environment variables check:")
      console.error("GOOGLE_SCRIPT_URL:", process.env.GOOGLE_SCRIPT_URL)
      console.error("NEXT_PUBLIC_GOOGLE_SCRIPT_URL:", process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL)
      console.error(
        "All env keys:",
        Object.keys(process.env).filter((key) => key.includes("GOOGLE")),
      )

      // 환경 변수가 없어도 성공으로 처리 (개발/테스트 목적)
      console.log("Google Script URL not configured, simulating success")
      return NextResponse.json({
        success: true,
        message: "상담 신청이 완료되었습니다. (개발 모드)",
      })
    }

    console.log("Sending request to Google Apps Script:", googleScriptUrl)
    console.log("Request body:", JSON.stringify(sanitizedBody, null, 2))

    const response = await fetch(googleScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedBody),
      redirect: "follow",
    })

    console.log("Google Apps Script response status:", response.status)
    console.log("Google Apps Script response headers:", Object.fromEntries(response.headers.entries()))

    // 2xx 또는 3xx 상태 코드를 성공으로 처리
    if (response.status >= 200 && response.status < 400) {
      let responseData
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.json()
        } catch (parseError) {
          console.log("Failed to parse JSON response, treating as success")
          responseData = { success: true, message: "상담 신청이 완료되었습니다." }
        }
      } else {
        const textResponse = await response.text()
        console.log("Non-JSON response:", textResponse)
        responseData = { success: true, message: "상담 신청이 완료되었습니다." }
      }

      return NextResponse.json(responseData)
    } else {
      const errorText = await response.text()
      console.error("Google Apps Script error response:", errorText)

      return NextResponse.json(
        { success: false, message: "Google Apps Script returned an error" },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Error in consultation API:", error)

    // 더 자세한 오류 정보 로깅
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        message: "상담 신청이 일시적으로 불가능합니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    )
  }
}
