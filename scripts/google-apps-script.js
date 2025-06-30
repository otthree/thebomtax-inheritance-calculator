// Google Apps Script 코드 (Google Apps Script 에디터에서 사용)

var SpreadsheetApp = SpreadsheetApp
var Utilities = Utilities
var Session = Session
var ContentService = ContentService

function doPost(e) {
  try {
    // CORS 헤더 설정
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    // POST 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents)

    // 스프레드시트 ID (본인의 스프레드시트 ID로 변경)
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet()

    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([["제출일시", "이름", "전화번호", "상담내용", "계산결과"]])
    }

    // 현재 시간
    const now = new Date()
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")

    // 계산 결과 포맷팅 (줄바꿈을 공백으로 변경)
    const calculationDetails = formatCalculationData(data.calculationData)

    // 새 행 추가 - 각 값을 명시적으로 문자열로 변환
    const newRow = [
      String(timestamp),
      String(data.name || ""),
      String(data.phone || ""),
      String(data.message || ""),
      String(calculationDetails),
    ]

    // 한 번에 한 행 추가
    const lastRow = sheet.getLastRow()
    sheet.getRange(lastRow + 1, 1, 1, 5).setValues([newRow])

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "데이터가 성공적으로 저장되었습니다." }),
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers)
  } catch (error) {
    console.error("Error:", error)
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: "오류가 발생했습니다: " + error.toString() }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function formatCalculationData(data) {
  if (!data) return "계산 데이터 없음"

  const formatNumber = (num) => {
    const rounded = Math.round(num / 10) * 10
    return rounded.toLocaleString("ko-KR")
  }

  // 줄바꿈 대신 | 구분자 사용
  return [
    `총재산: ${formatNumber(data.totalAssets)}원`,
    `총채무: ${formatNumber(data.totalDebt)}원`,
    `순재산: ${formatNumber(data.netAssets)}원`,
    `과세표준: ${formatNumber(data.taxableAmount)}원`,
    `세율: ${data.taxRate}%`,
    `최종상속세: ${formatNumber(data.finalTax)}원`,
    `공제(기본:${data.basicDeduction ? "O" : "X"}, 배우자:${data.spouseDeduction ? "O" : "X"}, 주택:${data.housingDeduction ? "O" : "X"})`,
  ].join(" | ")
}

// OPTIONS 요청 처리 (CORS preflight)
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT).setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
}

// 테스트용 함수
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "홍길동",
        phone: "010-1234-5678",
        message: "상속세 상담 받고 싶습니다.",
        calculationData: {
          totalAssets: 1000000000,
          totalDebt: 100000000,
          netAssets: 900000000,
          taxableAmount: 400000000,
          taxRate: 20,
          finalTax: 67900000,
          basicDeduction: true,
          spouseDeduction: false,
          housingDeduction: false,
        },
      }),
    },
  }

  const result = doPost(testData)
  console.log(result.getContent())
}

// 기존 잘못된 데이터 정리 함수
function cleanupSheet() {
  const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet()

  // 모든 데이터 삭제하고 헤더만 남기기
  const lastRow = sheet.getLastRow()
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1)
  }

  // 헤더 다시 설정
  sheet.getRange(1, 1, 1, 5).setValues([["제출일시", "이름", "전화번호", "상담내용", "계산결과"]])

  console.log("시트가 정리되었습니다.")
}
