// 가장 간단한 Google Apps Script 코드 (헤더 설정 제거)

var SpreadsheetApp = SpreadsheetApp
var Utilities = Utilities
var ContentService = ContentService

function doPost(e) {
  try {
    console.log("POST 요청 받음:", e.postData.contents)

    // 스프레드시트 ID (본인의 스프레드시트 ID로 변경하세요)
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"

    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents)
    console.log("파싱된 데이터:", data)

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
      calculationSummary = formatCalculationData(data.calculationData)
    }

    // 데이터 배열 준비
    const rowData = [timestamp, data.name || "", data.phone || "", data.message || "", calculationSummary]

    console.log("추가할 데이터:", rowData)

    // 마지막 행 다음에 데이터 추가
    const lastRow = sheet.getLastRow()
    const newRowIndex = lastRow + 1

    // 각 셀에 개별적으로 값 설정
    sheet.getRange(newRowIndex, 1).setValue(timestamp)
    sheet.getRange(newRowIndex, 2).setValue(data.name || "")
    sheet.getRange(newRowIndex, 3).setValue(data.phone || "")
    sheet.getRange(newRowIndex, 4).setValue(data.message || "")
    sheet.getRange(newRowIndex, 5).setValue(calculationSummary)

    console.log("데이터 추가 완료, 행:", newRowIndex)

    // 간단한 성공 응답 (헤더 설정 없음)
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "상담 신청이 접수되었습니다.",
        timestamp: timestamp,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("오류 발생:", error)

    // 간단한 에러 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "오류가 발생했습니다: " + error.toString(),
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// 수동 테스트 함수
function manualTest() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "테스트 사용자3",
        phone: "010-1111-2222",
        message: "세 번째 테스트 상담 신청입니다.",
        calculationData: {
          totalAssets: 1500000000,
          finalTax: 75000000,
        },
      }),
    },
  }

  const result = doPost(testData)
  console.log("테스트 결과:", result.getContent())
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

// 계산 데이터를 상세하게 포맷팅하는 함수
function formatCalculationData(calc) {
  const formatNumber = (num) => {
    if (!num || num === 0) return null
    const rounded = Math.round(num / 10) * 10
    return rounded.toLocaleString("ko-KR") + "원"
  }

  const formatBoolean = (bool, label) => {
    return bool ? label : null
  }

  const result = []

  // 재산 분류
  const realEstate = formatNumber(calc.realEstateTotal)
  const financial = formatNumber(calc.financialAssetsTotal)
  const gift = formatNumber(calc.giftAssetsTotal)
  const other = formatNumber(calc.otherAssetsTotal)
  const totalAssets = formatNumber(calc.totalAssets)

  if (realEstate) result.push(`부동산:${realEstate}`)
  if (financial) result.push(`금융자산:${financial}`)
  if (gift) result.push(`사전증여자산:${gift}`)
  if (other) result.push(`기타자산:${other}`)
  if (totalAssets) result.push(`총 재산가액:${totalAssets}`)

  // 채무 분류
  const funeral = formatNumber(calc.funeralExpenseTotal)
  const financialDebt = formatNumber(calc.financialDebtTotal)
  const taxArrears = formatNumber(calc.taxArrearsTotal)
  const otherDebt = formatNumber(calc.otherDebtTotal)
  const totalDebt = formatNumber(calc.totalDebt)

  if (funeral) result.push(`장례비:${funeral}`)
  if (financialDebt) result.push(`금융채무:${financialDebt}`)
  if (taxArrears) result.push(`세금미납:${taxArrears}`)
  if (otherDebt) result.push(`기타채무:${otherDebt}`)
  if (totalDebt) result.push(`총 채무:${totalDebt}`)

  // 순재산
  const netAssets = formatNumber(calc.netAssets)
  if (netAssets) result.push(`순재산가액:${netAssets}`)

  // 공제 항목
  const basicDeduction = formatBoolean(calc.basicDeduction, "일괄공제:500,000,000원")
  const spouseDeduction = formatBoolean(calc.spouseDeduction, "배우자공제:500,000,000원")
  const housingDeduction = formatBoolean(calc.housingDeduction, "동거주택 상속공제:600,000,000원")
  const financialDeduction = formatNumber(calc.financialDeduction)
  const totalDeductions = formatNumber(calc.totalDeductions)

  if (basicDeduction) result.push(basicDeduction)
  if (spouseDeduction) result.push(spouseDeduction)
  if (housingDeduction) result.push(housingDeduction)
  if (financialDeduction) result.push(`금융자산 상속공제:${financialDeduction}`)
  if (totalDeductions) result.push(`총 공제액:${totalDeductions}`)

  // 세액 계산
  const taxableAmount = formatNumber(calc.taxableAmount)
  const taxRate = calc.taxRate ? `${calc.taxRate.toFixed(1)}%` : null
  const progressiveDeduction = formatNumber(calc.progressiveDeduction)
  const calculatedTax = formatNumber(calc.calculatedTax)
  const giftTaxCredit = formatNumber(calc.giftTaxCredit)
  const reportTaxCredit = formatNumber(calc.reportTaxCredit)
  const totalTaxCredit = formatNumber(calc.totalTaxCredit)
  const finalTax = formatNumber(calc.finalTax)

  if (taxableAmount) result.push(`과세표준:${taxableAmount}`)
  if (taxRate) result.push(`적용 세율:${taxRate}`)
  if (progressiveDeduction) result.push(`누진공제:${progressiveDeduction}`)
  if (calculatedTax) result.push(`산출세액:${calculatedTax}`)
  if (giftTaxCredit) result.push(`증여세액공제:${giftTaxCredit}`)
  if (reportTaxCredit) result.push(`신고세액공제:${reportTaxCredit}`)
  if (totalTaxCredit) result.push(`세액공제 합계:${totalTaxCredit}`)
  if (finalTax) result.push(`최종 상속세:${finalTax}`)

  return result.length > 0 ? result.join(" | ") : "계산 데이터 없음"
}
