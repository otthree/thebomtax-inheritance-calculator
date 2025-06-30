// 새로운 Google Apps Script 코드 (Google Apps Script 에디터에서 사용)

function doPost(e) {
  try {
    // 스프레드시트 ID (본인의 스프레드시트 ID로 변경하세요)
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"

    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents)

    // 스프레드시트 열기
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet()

    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([["제출일시", "이름", "전화번호", "상담내용", "계산결과"]])
    }

    // 현재 시간
    const now = new Date()
    const timestamp = SpreadsheetApp.newDateRange(now).setTimeZone("Asia/Seoul").format("yyyy-MM-dd HH:mm:ss")

    // 계산 결과 간단히 포맷팅
    let calculationSummary = "계산 데이터 없음"
    if (data.calculationData) {
      const calc = data.calculationData
      calculationSummary = `총재산: ${Math.round(calc.totalAssets / 10000)}만원, 최종상속세: ${Math.round(calc.finalTax / 10000)}만원`
    }

    // 새 행 추가
    sheet.appendRow([timestamp, data.name || "", data.phone || "", data.message || "", calculationSummary])

    // 성공 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "데이터가 저장되었습니다.",
      }),
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      })
  } catch (error) {
    // 에러 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "오류: " + error.toString(),
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
}

// 테스트 함수
function testFunction() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "테스트",
        phone: "010-1234-5678",
        message: "테스트 메시지",
        calculationData: {
          totalAssets: 1000000000,
          finalTax: 50000000,
        },
      }),
    },
  }

  const result = doPost(testData)
  console.log(result.getContent())
}
