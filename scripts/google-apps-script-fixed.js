// 수정된 Google Apps Script 코드

const SpreadsheetApp = SpreadsheetApp
const Utilities = Utilities
const ContentService = ContentService

function doPost(e) {
  try {
    console.log("POST 요청 받음:", e.postData.contents)

    // 스프레드시트 ID (본인의 스프레드시트 ID로 변경하세요)
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"

    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents)
    console.log("파싱된 데이터:", data)

    // 스프레드시트 열기
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet()

    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([["제출일시", "이름", "전화번호", "상담내용", "계산결과"]])
    }

    // 현재 시간 (한국 시간)
    const now = new Date()
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const timestamp = Utilities.formatDate(kstTime, "GMT", "yyyy-MM-dd HH:mm:ss")

    // 계산 결과 포맷팅
    let calculationSummary = "계산 데이터 없음"
    if (data.calculationData && data.calculationData.totalAssets) {
      const calc = data.calculationData
      const formatNumber = (num) => Math.round(num / 10000).toLocaleString() + "만원"

      calculationSummary = [
        `총재산: ${formatNumber(calc.totalAssets)}`,
        `순재산: ${formatNumber(calc.netAssets || 0)}`,
        `과세표준: ${formatNumber(calc.taxableAmount || 0)}`,
        `최종상속세: ${formatNumber(calc.finalTax || 0)}`,
        `공제(기본:${calc.basicDeduction ? "O" : "X"}, 배우자:${calc.spouseDeduction ? "O" : "X"}, 주택:${calc.housingDeduction ? "O" : "X"})`,
      ].join(" | ")
    }

    // 새 행 추가
    const newRow = [timestamp, data.name || "", data.phone || "", data.message || "", calculationSummary]

    console.log("추가할 행:", newRow)
    sheet.appendRow(newRow)

    console.log("데이터 저장 완료")

    // 성공 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "상담 신청이 성공적으로 접수되었습니다.",
      }),
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      })
  } catch (error) {
    console.error("Google Apps Script 오류:", error)

    // 에러 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "오류가 발생했습니다: " + error.toString(),
      }),
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
      })
  }
}

// CORS preflight 처리
function doOptions() {
  return ContentService.createTextOutput("").setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
}

// 테스트 함수
function testFunction() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "홍길동",
        phone: "010-1234-5678",
        message: "상속세 상담 요청",
        calculationData: {
          totalAssets: 1000000000,
          netAssets: 900000000,
          taxableAmount: 400000000,
          finalTax: 67000000,
          basicDeduction: true,
          spouseDeduction: false,
          housingDeduction: false,
        },
        timestamp: new Date().toISOString(),
      }),
    },
  }

  const result = doPost(testData)
  console.log("테스트 결과:", result.getContent())
}
