// 간단한 구글 앱스 스크립트 - 새로 만든 버전

function doPost(e) {
  try {
    console.log("POST 요청 받음:", e.postData.contents)

    // 스프레드시트 ID - 여기에 실제 스프레드시트 ID를 입력하세요
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"
    const SHEET_NAME = "상담신청"

    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents)
    console.log("파싱된 데이터:", data)

    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)

    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME)
      // 헤더 추가
      sheet.getRange(1, 1, 1, 5).setValues([["접수일시", "회사명/고객명", "연락처", "문의내용", "출처"]])

      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, 5)
      headerRange.setBackground("#4285f4")
      headerRange.setFontColor("white")
      headerRange.setFontWeight("bold")
      headerRange.setHorizontalAlignment("center")
    }

    // 새 행에 데이터 추가
    const newRow = [
      data.timestamp || new Date().toLocaleString("ko-KR"),
      data.companyName || "",
      data.phone || "",
      data.inquiry || "",
      data.source || "상속세 계산기",
    ]

    console.log("추가할 데이터:", newRow)
    sheet.appendRow(newRow)

    // 자동 열 너비 조정
    sheet.autoResizeColumns(1, 5)

    console.log("데이터 저장 완료")

    // 성공 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "상담 신청이 성공적으로 저장되었습니다.",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("오류 발생:", error)

    // 에러 응답
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// GET 요청 처리 (테스트용)
function doGet() {
  return ContentService.createTextOutput("상담 신청 API가 정상적으로 작동 중입니다.").setMimeType(
    ContentService.MimeType.TEXT,
  )
}
