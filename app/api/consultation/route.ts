import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, message, calculationData, timestamp } = body

    console.log("상담 신청 요청 받음:", { name, phone, hasCalculationData: !!calculationData })

    // 필수 필드 검증
    if (!name || !phone) {
      console.log("필수 필드 누락:", { name: !!name, phone: !!phone })
      return NextResponse.json({ success: false, message: "이름과 전화번호는 필수입니다." }, { status: 400 })
    }

    // Google Apps Script URL 확인
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error("Google Script URL이 설정되지 않았습니다.")
      return NextResponse.json({ success: false, message: "서버 설정 오류가 발생했습니다." }, { status: 500 })
    }

    console.log("Google Apps Script URL:", scriptUrl.substring(0, 50) + "...")

    // 계산 데이터를 안전하게 직렬화
    let safeCalculationData = null
    if (calculationData) {
      try {
        safeCalculationData = {
          totalAssets: Number(calculationData.totalAssets) || 0,
          totalDebt: Number(calculationData.totalDebt) || 0,
          netAssets: Number(calculationData.netAssets) || 0,
          taxableAmount: Number(calculationData.taxableAmount) || 0,
          taxRate: Number(calculationData.taxRate) || 0,
          progressiveDeduction: Number(calculationData.progressiveDeduction) || 0,
          finalTax: Number(calculationData.finalTax) || 0,
          basicDeduction: Boolean(calculationData.basicDeduction),
          spouseDeduction: Boolean(calculationData.spouseDeduction),
          housingDeduction: Boolean(calculationData.housingDeduction),
          realEstateTotal: Number(calculationData.realEstateTotal) || 0,
          financialAssetsTotal: Number(calculationData.financialAssetsTotal) || 0,
          giftAssetsTotal: Number(calculationData.giftAssetsTotal) || 0,
          otherAssetsTotal: Number(calculationData.otherAssetsTotal) || 0,
          financialDebtTotal: Number(calculationData.financialDebtTotal) || 0,
          funeralExpenseTotal: Number(calculationData.funeralExpenseTotal) || 0,
          taxArrearsTotal: Number(calculationData.taxArrearsTotal) || 0,
          otherDebtTotal: Number(calculationData.otherDebtTotal) || 0,
          totalDeductions: Number(calculationData.totalDeductions) || 0,
          financialDeduction: Number(calculationData.financialDeduction) || 0,
          calculatedTax: Number(calculationData.calculatedTax) || 0,
          giftTaxCredit: Number(calculationData.giftTaxCredit) || 0,
          reportTaxCredit: Number(calculationData.reportTaxCredit) || 0,
          totalTaxCredit: Number(calculationData.totalTaxCredit) || 0,
          spouseDeductionAmount: Number(calculationData.spouseDeductionAmount) || 0,
        }
        console.log("계산 데이터 직렬화 완료")
      } catch (serializationError) {
        console.error("계산 데이터 직렬화 오류:", serializationError)
        safeCalculationData = null
      }
    }

    // Google Apps Script로 전송할 데이터
    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: String(message || "").trim(),
      timestamp: String(timestamp || new Date().toISOString()),
      calculationData: safeCalculationData,
    }

    console.log("Google Apps Script로 전송할 데이터 준비 완료")

    try {
      // Google Apps Script 호출
      console.log("Google Apps Script 호출 시작...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("Google Apps Script 응답 상태:", response.status)
      console.log("Google Apps Script 응답 헤더:", Object.fromEntries(response.headers.entries()))

      // 응답 본문 읽기
      let responseText = ""
      try {
        responseText = await response.text()
        console.log("Google Apps Script 응답 본문:", responseText.substring(0, 500))
      } catch (textError) {
        console.error("응답 본문 읽기 실패:", textError)
      }

      // 성공 응답 처리 (2xx, 3xx)
      if (response.status >= 200 && response.status < 400) {
        console.log("Google Apps Script 호출 성공")
        return NextResponse.json({
          success: true,
          message: "상담 신청이 완료되었습니다.",
        })
      }

      // 4xx, 5xx 오류 처리
      console.error("Google Apps Script 오류 응답:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })

      // 클라이언트 오류 (4xx)
      if (response.status >= 400 && response.status < 500) {
        return NextResponse.json(
          {
            success: false,
            message: "요청 데이터에 문제가 있습니다. 다시 시도해주세요.",
          },
          { status: 400 },
        )
      }

      // 서버 오류 (5xx)
      return NextResponse.json(
        {
          success: false,
          message: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      )
    } catch (fetchError) {
      console.error("Google Apps Script 호출 오류:", fetchError)

      // 타임아웃 오류
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Google Apps Script 호출 타임아웃")
        return NextResponse.json(
          {
            success: false,
            message: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
          },
          { status: 408 },
        )
      }

      // 네트워크 오류
      if (fetchError instanceof TypeError) {
        console.error("네트워크 오류:", fetchError.message)
        return NextResponse.json(
          {
            success: false,
            message: "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.",
          },
          { status: 503 },
        )
      }

      // 기타 오류
      return NextResponse.json(
        {
          success: false,
          message: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("상담 신청 API 전체 오류:", error)

    // JSON 파싱 오류
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "요청 데이터 형식이 올바르지 않습니다.",
        },
        { status: 400 },
      )
    }

    // 기타 서버 오류
    return NextResponse.json(
      {
        success: false,
        message: "서버 내부 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}
