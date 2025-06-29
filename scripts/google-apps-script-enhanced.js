// Google Apps Script 코드 - 계산 결과 포함 버전

function doPost(e) {
  try {
    // 스프레드시트 ID (실제 스프레드시트 ID로 변경)
    const SPREADSHEET_ID = "1K-TAmgjS9icds44S1xJ741qQMAWbcnM1V6p8Ky6mg3w"
    const SHEET_NAME = "상담신청"

    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents)

    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)

    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME)
      // 헤더 행 추가 (확장된 컬럼)
      sheet
        .getRange(1, 1, 1, 11)
        .setValues([
          [
            "접수일시",
            "회사명/고객명",
            "연락처",
            "문의내용",
            "출처",
            "총재산가액",
            "총채무",
            "일괄공제",
            "배우자공제",
            "동거주택공제",
            "최종상속세",
          ],
        ])

      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, 11)
      headerRange.setBackground("#4285f4")
      headerRange.setFontColor("white")
      headerRange.setFontWeight("bold")
      headerRange.setHorizontalAlignment("center")
    }

    // 계산 데이터 처리
    const calculationInfo = ""
    let totalAssets = ""
    let totalDebt = ""
    let basicDeduction = ""
    let spouseDeduction = ""
    let housingDeduction = ""
    let finalTax = ""

    if (data.calculationData) {
      const calc = data.calculationData
      totalAssets = calc.totalAssets || 0
      totalDebt = calc.totalDebt || 0
      basicDeduction = calc.basicDeduction ? "적용" : "미적용"
      spouseDeduction = calc.spouseDeduction ? "적용" : "미적용"
      housingDeduction = calc.housingDeduction ? "적용" : "미적용"
      finalTax = calc.finalTax || 0
    }

    // 새 행에 데이터 추가
    const newRow = [
      data.timestamp,
      data.companyName,
      data.phone,
      data.inquiry,
      data.source,
      totalAssets,
      totalDebt,
      basicDeduction,
      spouseDeduction,
      housingDeduction,
      finalTax,
    ]

    sheet.appendRow(newRow)

    // 자동 열 너비 조정
    sheet.autoResizeColumns(1, 11)

    // 숫자 컬럼 포맷팅 (통화 형식)
    const lastRow = sheet.getLastRow()
    if (lastRow > 1) {
      // 총재산가액, 총채무, 최종상속세 컬럼을 통화 형식으로 포맷
      sheet.getRange(lastRow, 6, 1, 1).setNumberFormat("#,##0") // 총재산가액
      sheet.getRange(lastRow, 7, 1, 1).setNumberFormat("#,##0") // 총채무
      sheet.getRange(lastRow, 11, 1, 1).setNumberFormat("#,##0") // 최종상속세
    }

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

function doGet() {
  return ContentService.createTextOutput("상담 신청 API가 정상적으로 작동 중입니다.").setMimeType(
    ContentService.MimeType.TEXT,
  )
}
