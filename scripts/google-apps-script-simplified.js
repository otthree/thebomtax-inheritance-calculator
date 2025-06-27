// Google Apps Script 코드 - 간소화된 버전

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
      // 헤더 행 추가 (간소화된 컬럼)
      sheet
        .getRange(1, 1, 1, 9)
        .setValues([
          [
            "접수일시",
            "회사명/고객명",
            "연락처",
            "문의내용",
            "총재산가액",
            "총채무",
            "일괄공제",
            "배우자공제",
            "동거주택공제",
            "최종상속세",
          ],
        ])

      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, 9)
      headerRange.setBackground("#4285f4")
      headerRange.setFontColor("white")
      headerRange.setFontWeight("bold")
      headerRange.setHorizontalAlignment("center")
    }

    // 문의내용에서 계산 결과 추출
    let totalAssets = ""
    let totalDebt = ""
    let basicDeduction = ""
    let spouseDeduction = ""
    let housingDeduction = ""
    let finalTax = ""

    // 문의내용에서 계산 결과 파싱
    const inquiry = data.inquiry || ""

    // 정규식으로 계산 결과 추출
    const totalAssetsMatch = inquiry.match(/총 재산가액: ([\d,]+)원/)
    const totalDebtMatch = inquiry.match(/총 채무: ([\d,]+)원/)
    const finalTaxMatch = inquiry.match(/최종 상속세: ([\d,]+)원/)
    const basicDeductionMatch = inquiry.match(/일괄공제: (적용|미적용)/)
    const spouseDeductionMatch = inquiry.match(/배우자공제: (적용|����적용)/)
    const housingDeductionMatch = inquiry.match(/동거주택공제: (적용|미적용)/)

    if (totalAssetsMatch) totalAssets = Number.parseInt(totalAssetsMatch[1].replace(/,/g, "")) || 0
    if (totalDebtMatch) totalDebt = Number.parseInt(totalDebtMatch[1].replace(/,/g, "")) || 0
    if (finalTaxMatch) finalTax = Number.parseInt(finalTaxMatch[1].replace(/,/g, "")) || 0
    if (basicDeductionMatch) basicDeduction = basicDeductionMatch[1]
    if (spouseDeductionMatch) spouseDeduction = spouseDeductionMatch[1]
    if (housingDeductionMatch) housingDeduction = housingDeductionMatch[1]

    // 새 행에 데이터 추가
    const newRow = [
      data.timestamp,
      data.companyName,
      data.phone,
      data.inquiry,
      totalAssets,
      totalDebt,
      basicDeduction,
      spouseDeduction,
      housingDeduction,
      finalTax,
    ]

    sheet.appendRow(newRow)

    // 자동 열 너비 조정
    sheet.autoResizeColumns(1, 9)

    // 숫자 컬럼 포맷팅 (통화 형식)
    const lastRow = sheet.getLastRow()
    if (lastRow > 1) {
      // 총재산가액, 총채무, 최종상속세 컬럼을 통화 형식으로 포맷
      sheet.getRange(lastRow, 5, 1, 1).setNumberFormat("#,##0") // 총재산가액
      sheet.getRange(lastRow, 6, 1, 1).setNumberFormat("#,##0") // 총채무
      sheet.getRange(lastRow, 10, 1, 1).setNumberFormat("#,##0") // 최종상속세
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
