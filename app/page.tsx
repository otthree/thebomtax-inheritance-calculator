"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, FileText, Users, Phone, Building, Gift, Receipt, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import ConsultationModal from "@/components/consultation-modal"
import Footer from "@/components/footer"

// 상속세 계산 함수들
const calculateInheritanceTax = (data: any) => {
  // 총 재산가액 계산
  const totalAssets = data.realEstateTotal + data.financialAssetsTotal + data.giftAssetsTotal + data.otherAssetsTotal

  // 총 채무 계산
  const totalDebt = data.financialDebtTotal + data.funeralExpenseTotal + data.taxArrearsTotal + data.otherDebtTotal

  // 순재산가액
  const netAssets = totalAssets - totalDebt

  // 공제액 계산
  let totalDeductions = 0

  // 일괄공제 (5억원)
  if (data.basicDeduction) {
    totalDeductions += 500000000
  }

  // 배우자공제 (최소 5억원, 최대 30억원)
  if (data.spouseDeduction) {
    const spouseDeductionAmount = Math.min(3000000000, Math.max(500000000, netAssets * 0.5))
    totalDeductions += spouseDeductionAmount
  }

  // 동거주택 상속공제 (최대 6억원)
  if (data.housingDeduction) {
    totalDeductions += 600000000
  }

  // 금융자산 상속공제
  totalDeductions += data.financialDeduction

  // 과세표준 계산
  const taxableAmount = Math.max(0, netAssets - totalDeductions)

  // 세율 및 누진공제 계산
  let taxRate = 0
  let progressiveDeduction = 0

  if (taxableAmount <= 100000000) {
    taxRate = 10
    progressiveDeduction = 0
  } else if (taxableAmount <= 500000000) {
    taxRate = 20
    progressiveDeduction = 10000000
  } else if (taxableAmount <= 1000000000) {
    taxRate = 30
    progressiveDeduction = 60000000
  } else if (taxableAmount <= 3000000000) {
    taxRate = 40
    progressiveDeduction = 160000000
  } else {
    taxRate = 50
    progressiveDeduction = 460000000
  }

  // 산출세액 계산
  const calculatedTax = Math.max(0, (taxableAmount * taxRate) / 100 - progressiveDeduction)

  // 세액공제 계산
  const totalTaxCredit = data.giftTaxCredit + data.reportTaxCredit

  // 최종 상속세
  const finalTax = Math.max(0, calculatedTax - totalTaxCredit)

  return {
    totalAssets,
    totalDebt,
    netAssets,
    totalDeductions,
    taxableAmount,
    taxRate,
    progressiveDeduction,
    calculatedTax,
    totalTaxCredit,
    finalTax,
    financialDeduction: data.financialDeduction,
  }
}

export default function InheritanceTaxCalculator() {
  const router = useRouter()
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [calculationData, setCalculationData] = useState<any>(null)

  // 재산 관련 상태
  const [realEstateTotal, setRealEstateTotal] = useState(0)
  const [financialAssetsTotal, setFinancialAssetsTotal] = useState(0)
  const [giftAssetsTotal, setGiftAssetsTotal] = useState(0)
  const [otherAssetsTotal, setOtherAssetsTotal] = useState(0)

  // 채무 관련 상태
  const [financialDebtTotal, setFinancialDebtTotal] = useState(0)
  const [funeralExpenseTotal, setFuneralExpenseTotal] = useState(0)
  const [taxArrearsTotal, setTaxArrearsTotal] = useState(0)
  const [otherDebtTotal, setOtherDebtTotal] = useState(0)

  // 공제 관련 상태
  const [basicDeduction, setBasicDeduction] = useState(true)
  const [spouseDeduction, setSpouseDeduction] = useState(false)
  const [housingDeduction, setHousingDeduction] = useState(false)
  const [financialDeduction, setFinancialDeduction] = useState(0)

  // 세액공제 관련 상태
  const [giftTaxCredit, setGiftTaxCredit] = useState(0)
  const [reportTaxCredit, setReportTaxCredit] = useState(0)

  // 계산 결과 상태
  const [result, setResult] = useState<any>(null)

  // 계산 실행
  const handleCalculate = () => {
    const data = {
      realEstateTotal,
      financialAssetsTotal,
      giftAssetsTotal,
      otherAssetsTotal,
      financialDebtTotal,
      funeralExpenseTotal,
      taxArrearsTotal,
      otherDebtTotal,
      basicDeduction,
      spouseDeduction,
      housingDeduction,
      financialDeduction,
      giftTaxCredit,
      reportTaxCredit,
    }

    const calculationResult = calculateInheritanceTax(data)
    setResult(calculationResult)
    setCalculationData({
      ...data,
      ...calculationResult,
    })
  }

  // 결과 페이지로 이동
  const handleViewDetailedResult = () => {
    if (result) {
      const queryParams = new URLSearchParams({
        totalAssets: result.totalAssets.toString(),
        totalDebt: result.totalDebt.toString(),
        netAssets: result.netAssets.toString(),
        taxableAmount: result.taxableAmount.toString(),
        finalTax: result.finalTax.toString(),
        realEstateTotal: realEstateTotal.toString(),
        financialAssetsTotal: financialAssetsTotal.toString(),
        giftAssetsTotal: giftAssetsTotal.toString(),
        otherAssetsTotal: otherAssetsTotal.toString(),
        financialDebtTotal: financialDebtTotal.toString(),
        funeralExpenseTotal: funeralExpenseTotal.toString(),
        taxArrearsTotal: taxArrearsTotal.toString(),
        otherDebtTotal: otherDebtTotal.toString(),
        totalDeductions: result.totalDeductions.toString(),
        financialDeduction: result.financialDeduction.toString(),
        basicDeduction: basicDeduction.toString(),
        spouseDeduction: spouseDeduction.toString(),
        housingDeduction: housingDeduction.toString(),
        taxRate: result.taxRate.toString(),
        progressiveDeduction: result.progressiveDeduction.toString(),
        calculatedTax: result.calculatedTax.toString(),
        giftTaxCredit: giftTaxCredit.toString(),
        reportTaxCredit: reportTaxCredit.toString(),
        totalTaxCredit: result.totalTaxCredit.toString(),
      })

      router.push(`/result?${queryParams.toString()}`)
    }
  }

  // 상담 신청 모달 열기
  const handleConsultationRequest = () => {
    setIsConsultationModalOpen(true)
  }

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num)
  }

  // 만원 단위로 변환
  const toManWon = (num: number) => {
    return Math.round(num / 10000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">상속세 계산기</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleConsultationRequest}
                className="flex items-center space-x-2 bg-transparent"
              >
                <Phone className="h-4 w-4" />
                <span>전문가 상담</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 입력 섹션 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 재산 입력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <span>상속재산</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="realEstate">부동산 (원)</Label>
                    <Input
                      id="realEstate"
                      type="number"
                      value={realEstateTotal || ""}
                      onChange={(e) => setRealEstateTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="financialAssets">금융자산 (원)</Label>
                    <Input
                      id="financialAssets"
                      type="number"
                      value={financialAssetsTotal || ""}
                      onChange={(e) => setFinancialAssetsTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="giftAssets">사전증여자산 (원)</Label>
                    <Input
                      id="giftAssets"
                      type="number"
                      value={giftAssetsTotal || ""}
                      onChange={(e) => setGiftAssetsTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherAssets">기타자산 (원)</Label>
                    <Input
                      id="otherAssets"
                      type="number"
                      value={otherAssetsTotal || ""}
                      onChange={(e) => setOtherAssetsTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 채무 입력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Minus className="h-5 w-5 text-red-600" />
                  <span>상속채무</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="financialDebt">금융채무 (원)</Label>
                    <Input
                      id="financialDebt"
                      type="number"
                      value={financialDebtTotal || ""}
                      onChange={(e) => setFinancialDebtTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="funeralExpense">장례비 (원)</Label>
                    <Input
                      id="funeralExpense"
                      type="number"
                      value={funeralExpenseTotal || ""}
                      onChange={(e) => setFuneralExpenseTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxArrears">세금미납 (원)</Label>
                    <Input
                      id="taxArrears"
                      type="number"
                      value={taxArrearsTotal || ""}
                      onChange={(e) => setTaxArrearsTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherDebt">기타채무 (원)</Label>
                    <Input
                      id="otherDebt"
                      type="number"
                      value={otherDebtTotal || ""}
                      onChange={(e) => setOtherDebtTotal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 공제 입력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-purple-600" />
                  <span>상속공제</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="basicDeduction"
                      checked={basicDeduction}
                      onCheckedChange={(checked) => setBasicDeduction(checked as boolean)}
                    />
                    <Label htmlFor="basicDeduction">일괄공제 (5억원)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spouseDeduction"
                      checked={spouseDeduction}
                      onCheckedChange={(checked) => setSpouseDeduction(checked as boolean)}
                    />
                    <Label htmlFor="spouseDeduction">배우자공제</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="housingDeduction"
                      checked={housingDeduction}
                      onCheckedChange={(checked) => setHousingDeduction(checked as boolean)}
                    />
                    <Label htmlFor="housingDeduction">동거주택 상속공제 (6억원)</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="financialDeduction">금융자산 상속공제 (원)</Label>
                  <Input
                    id="financialDeduction"
                    type="number"
                    value={financialDeduction || ""}
                    onChange={(e) => setFinancialDeduction(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="number-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 세액공제 입력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5 text-orange-600" />
                  <span>세액공제</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="giftTaxCredit">증여세액공제 (원)</Label>
                    <Input
                      id="giftTaxCredit"
                      type="number"
                      value={giftTaxCredit || ""}
                      onChange={(e) => setGiftTaxCredit(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportTaxCredit">신고세액공제 (원)</Label>
                    <Input
                      id="reportTaxCredit"
                      type="number"
                      value={reportTaxCredit || ""}
                      onChange={(e) => setReportTaxCredit(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="number-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 계산 버튼 */}
            <div className="flex justify-center">
              <Button
                onClick={handleCalculate}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                <Calculator className="h-5 w-5 mr-2" />
                상속세 계산하기
              </Button>
            </div>
          </div>

          {/* 결과 섹션 */}
          <div className="space-y-6">
            {result && (
              <>
                {/* 간단 결과 */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-center">계산 결과</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <p className="text-sm opacity-90">총재산</p>
                      <p className="text-2xl font-bold">{formatNumber(toManWon(result.totalAssets))}만원</p>
                    </div>
                    <Separator className="bg-white/20" />
                    <div>
                      <p className="text-sm opacity-90">상속세</p>
                      <p className="text-3xl font-bold">{formatNumber(toManWon(result.finalTax))}만원</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 액션 버튼들 */}
                <div className="space-y-3">
                  <Button onClick={handleViewDetailedResult} className="w-full bg-green-600 hover:bg-green-700">
                    <FileText className="h-4 w-4 mr-2" />
                    상세보기
                  </Button>
                  <Button onClick={handleConsultationRequest} variant="outline" className="w-full bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    전문가 상담 신청
                  </Button>
                </div>

                {/* 주요 정보 요약 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">요약</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">순재산가액</span>
                      <span className="font-medium">{formatNumber(toManWon(result.netAssets))}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">공제액</span>
                      <span className="font-medium">{formatNumber(toManWon(result.totalDeductions))}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">과세표준</span>
                      <span className="font-medium">{formatNumber(toManWon(result.taxableAmount))}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">적용세율</span>
                      <span className="font-medium">{result.taxRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* 안내 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">안내사항</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 본 계산기는 참고용이며, 실제 세액과 차이가 있을 수 있습니다.</p>
                <p>• 정확한 세액 계산을 위해서는 전문가 상담을 받으시기 바랍니다.</p>
                <p>• 상속세 신고는 상속개시일로부터 6개월 이내에 해야 합니다.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 상담 모달 */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={calculationData}
      />

      <Footer />
    </div>
  )
}
