import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 데이터 검증
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "이름과 전화번호는 필수입니다." }, { status: 400 })
    }

    // calculationData가 있는 경우 안전하게 처리
    let processedCalculationData = null
    if (body.calculationData) {
      try {
        // BigInt, NaN, Infinity 값들을 안전한 값으로 변환
        processedCalculationData = JSON.parse(
          JSON.stringify(body.calculationData, (key, value) => {
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
        console.error("calculationData 처리 오류:", error)
        processedCalculationData = null
      }
    }

    // Google Apps Script로 전송할 데이터 준비
    const formData = new FormData()
    formData.append("name", body.name)
    formData.append("phone", body.phone)
    formData.append("message", body.message || "")

    if (processedCalculationData) {
      formData.append("calculationData", JSON.stringify(processedCalculationData))
    }

    // Google Apps Script URL (환경변수에서 가져오기)
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error("Google Apps Script URL이 설정되지 않았습니다.")
      return NextResponse.json({ error: "서버 설정 오류가 발생했습니다." }, { status: 500 })
    }

    // Google Apps Script로 데이터 전송
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: formData,
    })

    // 응답 상태 확인
    if (response.status >= 200 && response.status < 400) {
      // 2xx, 3xx 상태 코드는 성공으로 처리
      return NextResponse.json({
        success: true,
        message: "상담 신청이 성공적으로 접수되었습니다.",
      })
    } else {
      console.error("Google Apps Script 응답 오류:", response.status, response.statusText)
      return NextResponse.json({ error: "상담 신청 처리 중 오류가 발생했습니다." }, { status: 500 })
    }
  } catch (error) {
    console.error("상담 신청 처리 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
