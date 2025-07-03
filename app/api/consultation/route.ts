import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, message, calculationData, timestamp } = body

    // 필수 필드 검증
    if (!name || !phone) {
      return NextResponse.json({ success: false, message: "이름과 전화번호는 필수입니다." }, { status: 400 })
    }

    // Google Apps Script URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error("Google Script URL이 설정되지 않았습니다.")
      return NextResponse.json({ success: false, message: "서버 설정 오류가 발생했습니다." }, { status: 500 })
    }

    // 계산 데이터를 안전하게 직렬화
    const safeCalculationData = calculationData
      ? {
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
      : null

    // Google Apps Script로 전송할 데이터
    const payload = {
      name: String(name),
      phone: String(phone),
      message: String(message || ""),
      timestamp: String(timestamp),
      calculationData: safeCalculationData,
    }

    console.log("Google Apps Script로 전송:", payload)

    // Google Apps Script 호출
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("Google Apps Script 응답 상태:", response.status)

    // 2xx 또는 3xx 상태 코드를 성공으로 처리
    if (response.status >= 200 && response.status < 400) {
      return NextResponse.json({ success: true, message: "상담 신청이 완료되었습니다." })
    }

    // 응답 본문 읽기 시도
    let responseText = ""
    try {
      responseText = await response.text()
      console.log("Google Apps Script 응답 본문:", responseText)
    } catch (error) {
      console.log("응답 본문 읽기 실패:", error)
    }

    return NextResponse.json({ success: false, message: "상담 신청 처리 중 오류가 발생했습니다." }, { status: 500 })
  } catch (error) {
    console.error("상담 신청 API 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
