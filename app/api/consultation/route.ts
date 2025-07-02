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

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      console.error("GOOGLE_SCRIPT_URL environment variable is not set")
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 })
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
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
