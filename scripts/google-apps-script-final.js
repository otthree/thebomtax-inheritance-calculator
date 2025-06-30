// 최종 수정된 Google Apps Script 코드

var SpreadsheetApp = SpreadsheetApp
var Utilities = Utilities
var ContentService = ContentService

function doPost(e) {
  try {
    console.log("=== Google Apps Script 시작 ===")
    console.log("POST 요청 받음:", e.postData.contents)

    // 스프레드시트 ID (본인의 스프레드시트 ID로 변경하세요)
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"

    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents)
    console.log("파싱된 데이터:", JSON.stringify(data, null, 2))
    console.log("이름:", data.name)
    console.log("전화번호:", data.phone)
    console.log("상담내용:", data.message)

    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    const sheet = spreadsheet.getActiveSheet()

    // 헤더 확인 및 추가
    if (sheet.getLastRow() === 0) {
      const headers = ["제출일시", "이름", "전화번호", "상담내용", "계산결과"]
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      console.log("헤더 추가됨")
    }

    // 현재 시간 (한국 시간)
    const now = new Date()
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000) // UTC+9
    const timestamp = Utilities.formatDate(kstTime, "GMT+9", "yyyy-MM-dd HH:mm:ss")

    // 계산 결과 상세 포맷팅
    let calculationSummary = "계산 데이터 없음"
    if (data.calculationData) {
      const calc = data.calculationData
      const details = []

      // 재산 항목들 (0이 아닌 것만)
      const assets = []
      if (calc.realEstateTotal && calc.realEstateTotal > 0) {
        assets.push(`부동산: ${Math.round(calc.realEstateTotal / 10000).toLocaleString()}만원`)
      }
      if (calc.financialAssetsTotal && calc.financialAssetsTotal > 0) {
        assets.push(`금융자산: ${Math.round(calc.financialAssetsTotal / 10000).toLocaleString()}만원`)
      }
      if (calc.giftAssetsTotal && calc.giftAssetsTotal > 0) {
        assets.push(`사전증여자산: ${Math.round(calc.giftAssetsTotal / 10000).toLocaleString()}만원`)
      }
      if (calc.otherAssetsTotal && calc.otherAssetsTotal > 0) {
        assets.push(`기타자산: ${Math.round(calc.otherAssetsTotal / 10000).toLocaleString()}만원`)
      }

      // 총 재산가액
      if (calc.totalAssets && calc.totalAssets > 0) {
        details.push(`총 재산가액: ${Math.round(calc.totalAssets / 10000).toLocaleString()}만원`)
      }

      // 채무 항목들 (0이 아닌 것만)
      const debts = []
      if (calc.funeralExpenseTotal && calc.funeralExpenseTotal > 0) {
        debts.push(`장례비: ${Math.round(calc.funeralExpenseTotal / 10000).toLocaleString()}만원`)
      }
      if (calc.financialDebtTotal && calc.financialDebtTotal > 0) {
        debts.push(`금융채무: ${Math.round(calc.financialDebtTotal / 10000).toLocaleString()}만원`)
      }
      if (calc.taxArrearsTotal && calc.taxArrearsTotal > 0) {
        debts.push(`세금미납: ${Math.round(calc.taxArrearsTotal / 10000).toLocaleString()}만원`)
      }
      if (calc.otherDebtTotal && calc.otherDebtTotal > 0) {
        debts.push(`기타채무: ${Math.round(calc.otherDebtTotal / 10000).toLocaleString()}만원`)
      }

      // 총 채무
      if (calc.totalDebt && calc.totalDebt > 0) {
        details.push(`총 채무: ${Math.round(calc.totalDebt / 10000).toLocaleString()}만원`)
      }

      // 공제 항목들 (0이 아닌 것만)
      const deductions = []
      if (calc.basicDeduction) {
        deductions.push(`일괄공제: 5,000만원`)
      }
      if (calc.spouseDeduction) {
        deductions.push(`배우자공제: 적용`)
      }
      if (calc.housingDeduction) {
        deductions.push(`동거주택 상속공제: 적용`)
      }
      if (calc.financialDeduction && calc.financialDeduction > 0) {
        deductions.push(`금융자산 상속공제: ${Math.round(calc.financialDeduction / 10000).toLocaleString()}만원`)
      }

      // 총 공제액
      if (calc.totalDeductions && calc.totalDeductions > 0) {
        details.push(`총 공제액: ${Math.round(calc.totalDeductions / 10000).toLocaleString()}만원`)
      }

      // 과세표준
      if (calc.taxableAmount && calc.taxableAmount > 0) {
        details.push(`과세표준: ${Math.round(calc.taxableAmount / 10000).toLocaleString()}만원`)
      }

      // 세율 정보
      if (calc.taxRate) {
        details.push(`적용 세율: ${calc.taxRate}%`)
      }

      // 누진공제
      if (calc.progressiveDeduction && calc.progressiveDeduction > 0) {
        details.push(`누진공제: ${Math.round(calc.progressiveDeduction / 10000).toLocaleString()}만원`)
      }

      // 산출세액
      if (calc.calculatedTax && calc.calculatedTax > 0) {
        details.push(`산출세액: ${Math.round(calc.calculatedTax / 10000).toLocaleString()}만원`)
      }

      // 세액공제 항목들 (0이 아닌 것만)
      const taxCredits = []
      if (calc.giftTaxCredit && calc.giftTaxCredit > 0) {
        taxCredits.push(`증여세액공제: ${Math.round(calc.giftTaxCredit / 10000).toLocaleString()}만원`)
      }
      if (calc.reportTaxCredit && calc.reportTaxCredit > 0) {
        taxCredits.push(`신고세액공제: ${Math.round(calc.reportTaxCredit / 10000).toLocaleString()}만원`)
      }

      // 총 세액공제
      if (calc.totalTaxCredit && calc.totalTaxCredit > 0) {
        details.push(`세액공제 합계: ${Math.round(calc.totalTaxCredit / 10000).toLocaleString()}만원`)
      }

      // 최종 상속세
      if (calc.finalTax !== undefined) {
        details.push(`최종 상속세: ${Math.round(calc.finalTax / 10000).toLocaleString()}만원`)
      }

      // 재산 세부 항목 추가
      if (assets.length > 0) {
        details.unshift(`[재산] ${assets.join(", ")}`)
      }

      // 채무 세부 항목 추가
      if (debts.length > 0) {
        details.push(`[채무] ${debts.join(", ")}`)
      }

      // 공제 세부 항목 추가
      if (deductions.length > 0) {
        details.push(`[공제] ${deductions.join(", ")}`)
      }

      // 세액공제 세부 항목 추가
      if (taxCredits.length > 0) {
        details.push(`[세액공제] ${taxCredits.join(", ")}`)
      }

      // 최종 요약 생성
      if (details.length > 0) {
        calculationSummary = details.join(" | ")
      } else {
        calculationSummary = "계산 결과 없음"
      }
    }

    console.log("계산 요약:", calculationSummary)

    // 데이터 배열 준비 - 빈 값 처리 개선
    const name = (data.name || "").toString().trim()
    const phone = (data.phone || "").toString().trim()
    const message = (data.message || "").toString().trim()

    // 마지막 행 다음에 데이터 추가
    const lastRow = sheet.getLastRow()
    const newRowIndex = lastRow + 1

    console.log("데이터 추가 시작, 행:", newRowIndex)

    // 각 셀에 개별적으로 값 설정 - 더 안전한 방법
    try {
      sheet.getRange(newRowIndex, 1).setValue(timestamp)
      console.log("1열 (시간) 추가 완료")

      sheet.getRange(newRowIndex, 2).setValue(name)
      console.log("2열 (이름) 추가 완료:", name)

      sheet.getRange(newRowIndex, 3).setValue(phone)
      console.log("3열 (전화번호) 추가 완료:", phone)

      sheet.getRange(newRowIndex, 4).setValue(message)
      console.log("4열 (상담내용) 추가 완료:", message)

      sheet.getRange(newRowIndex, 5).setValue(calculationSummary)
      console.log("5열 (계산결과) 추가 완료")
    } catch (cellError) {
      console.error("셀 추가 중 오류:", cellError)
      throw cellError
    }

    console.log("데이터 추가 완료, 행:", newRowIndex)

    // 추가된 데이터 확인
    const addedData = sheet.getRange(newRowIndex, 1, 1, 5).getValues()[0]
    console.log("실제 추가된 데이터:", addedData)

    // 성공 응답 - CORS 헤더 없이
    const responseData = {
      success: true,
      message: "상담 신청이 접수되었습니다.",
      timestamp: timestamp,
      data: {
        name: name,
        phone: phone,
        message: message,
        calculationSummary: calculationSummary,
      },
      addedRow: newRowIndex,
    }

    console.log("응답 데이터:", JSON.stringify(responseData))

    return ContentService.createTextOutput(JSON.stringify(responseData)).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("오류 발생:", error)
    console.error("오류 스택:", error.stack)

    // 에러 응답 - CORS 헤더 없이
    const errorData = {
      success: false,
      message: "오류가 발생했습니다: " + error.toString(),
      error: error.toString(),
      stack: error.stack,
    }

    console.log("에러 응답 데이터:", JSON.stringify(errorData))

    return ContentService.createTextOutput(JSON.stringify(errorData)).setMimeType(ContentService.MimeType.JSON)
  }
}

// CORS preflight 처리 - 단순화
function doOptions() {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT)
}

// 수동 테스트 함수
function manualTest() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "테스트 사용자7",
        phone: "010-1234-5678",
        message: "총재산 100,000만원, 상속세 6,730만원 테스트",
        calculationData: {
          totalAssets: 1000000000, // 10억 = 100,000만원
          totalDebt: 0,
          netAssets: 1000000000,
          taxableAmount: 500000000, // 5억
          finalTax: 67300000, // 6,730만원
          realEstateTotal: 600000000,
          financialAssetsTotal: 400000000,
          giftAssetsTotal: 0,
          otherAssetsTotal: 0,
          financialDebtTotal: 0,
          funeralExpenseTotal: 0,
          taxArrearsTotal: 0,
          otherDebtTotal: 0,
          totalDeductions: 500000000,
          financialDeduction: 0,
          basicDeduction: true,
          spouseDeduction: false,
          housingDeduction: false,
          taxRate: 20,
          progressiveDeduction: 32700000,
          calculatedTax: 100000000,
          giftTaxCredit: 0,
          reportTaxCredit: 32700000,
          totalTaxCredit: 32700000,
        },
      }),
    },
  }

  try {
    const result = doPost(testData)
    console.log("테스트 결과:", result.getContent())
    console.log("테스트 성공!")
  } catch (error) {
    console.error("테스트 실패:", error)
  }
}

// 스프레드시트 초기화 함수
function initializeSheet() {
  const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = spreadsheet.getActiveSheet()

  // 기존 데이터 모두 삭제
  sheet.clear()

  // 헤더 추가
  const headers = ["제출일시", "이름", "전화번호", "상담내용", "계산결과"]
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])

  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setFontWeight("bold")
  headerRange.setBackground("#f0f0f0")

  console.log("스프레드시트 초기화 완료")
}

// 스프레드시트 데이터 확인 함수
function checkSheetData() {
  const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = spreadsheet.getActiveSheet()

  const lastRow = sheet.getLastRow()
  console.log("총 행 수:", lastRow)

  if (lastRow > 0) {
    const data = sheet.getRange(1, 1, lastRow, 5).getValues()
    console.log("스프레드시트 데이터:")
    data.forEach((row, index) => {
      console.log(`행 ${index + 1}:`, row)
    })
  }
}
