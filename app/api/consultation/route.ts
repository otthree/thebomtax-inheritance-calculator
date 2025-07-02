import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, message, calculationData } = body

    // 필수 필드 검증
    if (!name || !phone) {
      return NextResponse.json({ error: "이름과 전화번호는 필수입니다." }, { status: 400 })
    }

    // calculationData가 있는 경우 안전하게 처리
    let safeCalculationData = null
    if (calculationData) {
      try {
        // BigInt, NaN, Infinity 값들을 안전한 값으로 변환
        safeCalculationData = JSON.parse(
          JSON.stringify(calculationData, (key, value) => {
            if (typeof value === "bigint") {
              return value.toString()
            }
            if (typeof value === "number") {
              if (isNaN(value)) return 0
              if (!isFinite(value)) return 0
            }
            return value
          }),
        )
      } catch (error) {
        console.error("calculationData 처리 중 오류:", error)
        safeCalculationData = null
      }
    }

    // Google Apps Script URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error("GOOGLE_SCRIPT_URL이 설정되지 않았습니다.")
      return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 })
    }

    // Google Apps Script로 데이터 전송
    const payload = {
      name,
      phone,
      message: message || "",
      calculationData: safeCalculationData,
      timestamp: new Date().toISOString(),
    }

    console.log("Google Apps Script로 전송할 데이터:", JSON.stringify(payload, null, 2))

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow", // 리다이렉트 자동 처리
    })

    console.log("Google Apps Script 응답 상태:", response.status)
    console.log("Google Apps Script 응답 헤더:", Object.fromEntries(response.headers.entries()))

    // 2xx 또는 3xx 상태 코드를 성공으로 처리
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      let responseData
      try {
        const responseText = await response.text()
        console.log("Google Apps Script 응답 텍스트:", responseText)

        // JSON 파싱 시도
        if (responseText.trim()) {
          try {
            responseData = JSON.parse(responseText)
          } catch (parseError) {
            console.log("JSON 파싱 실패, 텍스트 응답으로 처리")
            responseData = { message: "상담 신청이 완료되었습니다.", rawResponse: responseText }
          }
        } else {
          responseData = { message: "상담 신청이 완료되었습니다." }
        }
      } catch (error) {
        console.error("응답 처리 중 오류:", error)
        responseData = { message: "상담 신청이 완료되었습니다." }
      }

      return NextResponse.json({
        success: true,
        message: "상담 신청이 완료되었습니다.",
        data: responseData,
      })
    } else {
      // 4xx, 5xx 오류
      const errorText = await response.text()
      console.error("Google Apps Script 오류 응답:", errorText)

      return NextResponse.json(
        {
          error: "상담 신청 처리 중 오류가 발생했습니다.",
          details: errorText,
          status: response.status,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("상담 신청 API 오류:", error)

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    )
  }
}
