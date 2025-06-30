// Google Apps Script 코드 (Google Apps Script 에디터에서 사용)

function doPost(e) {
  try {
    // POST 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents)

    // 스프레드시트 ID (본인의 스프레드시트 ID로 변경)
    const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet()

    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([["제출일시", "이름", "전화번호", "상담내용", "계산결과"]])
    }

    // 현재 시간
    const now = new Date()
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")

    // 계산 결과 포맷팅
    const calculationDetails = formatCalculationData(data.calculationData)

    // 새 행 추가
    const newRow = [timestamp, data.name, data.phone, data.message, calculationDetails]

    sheet.appendRow(newRow)

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "데이터가 성공적으로 저장되었습니다." }),
    ).setMimeType(ContentService.MimeType.JSON)
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

  return `
1단계: 총 재산가액 계산
부동산: ${formatNumber(data.realEstateTotal)}원
금융자산: ${formatNumber(data.financialAssetsTotal)}원
사전증여자산: ${formatNumber(data.giftAssetsTotal)}원
기타자산: ${formatNumber(data.otherAssetsTotal)}원
총 재산가액: ${formatNumber(data.totalAssets)}원

2단계: 총 채무 계산
장례비: ${formatNumber(data.funeralExpenseTotal)}원
금융채무: ${formatNumber(data.financialDebtTotal)}원
세금미납: ${formatNumber(data.taxArrearsTotal)}원
기타채무: ${formatNumber(data.otherDebtTotal)}원
총 채무: ${formatNumber(data.totalDebt)}원

3단계: 순 재산가액 계산
총 재산가액 - 총 채무: ${formatNumber(data.netAssets)}원
${formatNumber(data.totalAssets)} - ${formatNumber(data.totalDebt)} = ${formatNumber(data.netAssets)}

4단계: 공제 계산
일괄공제: ${data.basicDeduction ? "500,000,000" : "0"}원
배우자공제: ${data.spouseDeduction ? "500,000,000" : "0"}원
동거주택 상속공제: ${data.housingDeduction ? "600,000,000" : "0"}원
금융자산 상속공제: ${formatNumber(data.financialDeduction)}원
총 공제액: ${formatNumber(data.totalDeductions)}원

5단계: 과세표준 계산
순 재산가액 - 총 공제액: ${formatNumber(data.taxableAmount)}원
${formatNumber(data.netAssets)} - ${formatNumber(data.totalDeductions)} = ${formatNumber(data.taxableAmount)}

6단계: 세율 적용
과세표준: ${formatNumber(data.taxableAmount)}원
적용 세율: ${data.taxRate.toFixed(1)}%
누진공제: ${formatNumber(data.progressiveDeduction)}원
산출세액: ${formatNumber(data.calculatedTax)}원

7단계: 세액공제
증여세액공제: ${formatNumber(data.giftTaxCredit)}원
신고세액공제: ${formatNumber(data.reportTaxCredit)}원
세액공제 합계: ${formatNumber(data.totalTaxCredit)}원
최종 상속세: ${formatNumber(data.finalTax)}원
  `.trim()
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
          realEstateTotal: 800000000,
          financialAssetsTotal: 200000000,
          giftAssetsTotal: 0,
          otherAssetsTotal: 0,
          financialDebtTotal: 100000000,
          funeralExpenseTotal: 0,
          taxArrearsTotal: 0,
          otherDebtTotal: 0,
          totalDeductions: 500000000,
          financialDeduction: 0,
          basicDeduction: true,
          spouseDeduction: false,
          housingDeduction: false,
          taxableAmount: 400000000,
          taxRate: 20,
          progressiveDeduction: 10000000,
          calculatedTax: 70000000,
          giftTaxCredit: 0,
          reportTaxCredit: 2100000,
          totalTaxCredit: 2100000,
          finalTax: 67900000,
        },
      }),
    },
  }

  const result = doPost(testData)
  console.log(result.getContent())
}
