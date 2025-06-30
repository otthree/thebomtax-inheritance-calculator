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

    // 계산 결과 간단히 포맷팅
    let calculationSummary = "계산 데이터 없음"
    if (data.calculationData && data.calculationData.finalTax !== undefined) {
      const finalTax = Math.round(data.calculationData.finalTax / 10000)
      const totalAssets = Math.round(data.calculationData.totalAssets / 10000)
      calculationSummary = `총재산: ${totalAssets.toLocaleString()}만원, 상속세: ${finalTax.toLocaleString()}만원`
    }

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

    // 성공 응답
    const output = ContentService.createTextOutput(
      JSON.stringify({
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
      }),
    ).setMimeType(ContentService.MimeType.JSON)

    // CORS 헤더 설정
    output.setHeader("Access-Control-Allow-Origin", "*")
    output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    output.setHeader("Access-Control-Allow-Headers", "Content-Type")

    return output
  } catch (error) {
    console.error("오류 발생:", error)
    console.error("오류 스택:", error.stack)

    // 에러 응답
    const errorOutput = ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "오류가 발생했습니다: " + error.toString(),
        error: error.toString(),
        stack: error.stack,
      }),
    ).setMimeType(ContentService.MimeType.JSON)

    errorOutput.setHeader("Access-Control-Allow-Origin", "*")

    return errorOutput
  }
}

// CORS preflight 처리
function doOptions() {
  const output = ContentService.createTextOutput("")
  output.setHeader("Access-Control-Allow-Origin", "*")
  output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
  output.setHeader("Access-Control-Allow-Headers", "Content-Type")
  return output
}

// 수동 테스트 함수
function manualTest() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "테스트 사용자4",
        phone: "010-1234-5678",
        message: "네 번째 테스트 상담 신청입니다.",
        calculationData: {
          totalAssets: 3000000000,
          finalTax: 150000000,
        },
      }),
    },
  }

  const result = doPost(testData)
  console.log("테스트 결과:", result.getContent())
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
