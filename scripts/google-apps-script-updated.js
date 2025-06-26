// Google Apps Script 코드 - 업데이트된 버전

function doPost(e) {
  try {
    // ⭐ 여기서 스프레드시트 ID만 변경하면 됩니다!
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w" // 새로운 스프레드시트 ID로 변경
    const SHEET_NAME = "상담신청" // 시트 이름도 원하는 대로 변경 가능

    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents)

    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)

    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME)
      // 헤더 행 추가
      sheet.getRange(1, 1, 1, 5).setValues([["접수일시", "회사명/고객명", "연락처", "문의내용", "출처"]])

      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, 5)
      headerRange.setBackground("#4285f4")
      headerRange.setFontColor("white")
      headerRange.setFontWeight("bold")
      headerRange.setHorizontalAlignment("center")
    }

    // 새 행에 데이터 추가
    const newRow = [data.timestamp, data.companyName, data.phone, data.inquiry, data.source]

    sheet.appendRow(newRow)

    // 자동 열 너비 조정
    sheet.autoResizeColumns(1, 5)

    // 성공 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "상담 신청이 성공적으로 저장되었습니다.",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    // 에러 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// 여러 스프레드시트를 사용하고 싶다면 이런 식으로도 가능합니다
function doPostMultipleSheets(e) {
  try {
    const data = JSON.parse(e.postData.contents)

    // 조건에 따라 다른 스프레드시트 사용
    let SPREADSHEET_ID
    let SHEET_NAME

    if (data.source === "상속세 계산기") {
      SPREADSHEET_ID = "INHERITANCE_TAX_SPREADSHEET_ID"
      SHEET_NAME = "상속세상담"
    } else if (data.source === "증여세 계산기") {
      SPREADSHEET_ID = "GIFT_TAX_SPREADSHEET_ID"
      SHEET_NAME = "증여세상담"
    } else {
      SPREADSHEET_ID = "DEFAULT_SPREADSHEET_ID"
      SHEET_NAME = "일반상담"
    }

    // 나머지 로직은 동일...
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME)
      sheet.getRange(1, 1, 1, 5).setValues([["접수일시", "회사명/고객명", "연락처", "문의내용", "출처"]])
    }

    const newRow = [data.timestamp, data.companyName, data.phone, data.inquiry, data.source]
    sheet.appendRow(newRow)
    sheet.autoResizeColumns(1, 5)

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "저장 완료" })).setMimeType(
      ContentService.MimeType.JSON,
    )
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() })).setMimeType(
      ContentService.MimeType.JSON,
    )
  }
}

function doGet() {
  return ContentService.createTextOutput("상담 신청 API가 정상적으로 작동 중입니다.").setMimeType(
    ContentService.MimeType.TEXT,
  )
}
