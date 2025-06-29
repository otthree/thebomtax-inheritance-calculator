"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, FileText, Zap, TrendingUp, DollarSign, BarChart3, AlertTriangle, Phone } from "lucide-react"
import Image from "next/image"
import ConsultationModal from "@/components/consultation-modal"
import { Footer } from "@/components/footer"

export default function InheritanceTaxCalculator() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    // 1단계: 재산
    // 부동산
    realEstate: "",
    businessProperty: "",
    land: "",
    otherRealEstate: "",
    // 금융자산
    deposit: "",
    savings: "",
    stocks: "",
    funds: "",
    bonds: "",
    crypto: "",
    // 기타자산
    vehicle: "",
    insurance: "",
    businessShare: "",
    otherAssets: "",

    // 2단계: 증여
    giftProperty: "",
    isSpouse: false,

    // 3단계: 채무 및 비용
    mortgageLoan: "",
    creditLoan: "",
    cardDebt: "",
    funeralExpense: "",
    taxArrears: "",
    otherDebt: "",

    // 4단계: 공제
    basicDeduction: true,
    spouseDeduction: false,
    housingDeduction: false,
  })

  const [calculationResult, setCalculationResult] = useState({
    // 재산 분류별
    realEstateTotal: 0,
    financialAssetsTotal: 0,
    giftAssetsTotal: 0,
    otherAssetsTotal: 0,
    totalAssets: 0,

    // 채무 분류별
    financialDebtTotal: 0,
    funeralExpenseTotal: 0,
    taxArrearsTotal: 0,
    otherDebtTotal: 0,
    totalDebt: 0,

    // 계산 과정
    netAssets: 0,
    totalDeductions: 0,
    financialDeduction: 0,
    taxableAmount: 0,
    taxRate: 0,
    progressiveDeduction: 0,
    calculatedTax: 0,
    giftTaxCredit: 0,
    reportTaxCredit: 0,
    totalTaxCredit: 0,
    finalTax: 0,
  })

  const steps = [
    { number: 1, name: "재산", active: currentStep >= 1 },
    { number: 2, name: "증여", active: currentStep >= 2 },
    { number: 3, name: "채무및비용", active: currentStep >= 3 },
    { number: 4, name: "공제혜택", active: currentStep >= 4 },
  ]

  // 컴포넌트 마운트 시 초기 계산 실행
  useEffect(() => {
    calculateTax(formData)
  }, [])

  // 배우자 체크 시 배우자 공제 자동 체크
  useEffect(() => {
    if (formData.isSpouse && !formData.spouseDeduction) {
      const newFormData = { ...formData, spouseDeduction: true }
      setFormData(newFormData)
      calculateTax(newFormData)
    }
  }, [formData, formData.isSpouse])

  const handleInputChange = (field: string, value: string) => {
    // 숫자만 추출 (콤마 제거)
    const numericValue = value.replace(/[^0-9]/g, "")

    // 숫자를 콤마가 포함된 형태로 포맷팅
    const formattedValue = numericValue ? Number(numericValue).toLocaleString("ko-KR") : ""

    const newFormData = { ...formData, [field]: formattedValue }
    setFormData(newFormData)

    // 실시간 계산 (새로운 formData로)
    calculateTax(newFormData)
  }

  const calculateTax = (data: typeof formData) => {
    console.log("=== 계산 시작 ===")
    console.log("입력 데이터:", data)

    // 만원 단위를 원 단위로 변환하는 함수
    const convertToWon = (value: string) => {
      const result = Number.parseInt(value?.replace(/,/g, "") || "0") * 10000
      return result
    }

    // 부동산 = 주거용 부동산 + 상업용 부동산 + 토지 + 기타부동산
    const realEstateTotal =
      convertToWon(data.realEstate) +
      convertToWon(data.businessProperty) +
      convertToWon(data.land) +
      convertToWon(data.otherRealEstate)

    // 금융자산 = 예금 + 적금 + 주식 + 펀드 + 채권 + 암호화폐
    const financialAssetsTotal =
      convertToWon(data.deposit) +
      convertToWon(data.savings) +
      convertToWon(data.stocks) +
      convertToWon(data.funds) +
      convertToWon(data.bonds) +
      convertToWon(data.crypto)

    // 사전증여자산 = 증여받은 재산
    const giftAssetsTotal = convertToWon(data.giftProperty)

    // 기타자산 = 차량 + 보험금 + 사업지분 + 기타 자산
    const otherAssetsTotal =
      convertToWon(data.vehicle) +
      convertToWon(data.insurance) +
      convertToWon(data.businessShare) +
      convertToWon(data.otherAssets)

    // 총재산가액 = 부동산 + 금융자산 + 사전증여자산 + 기타자산
    const totalAssets = realEstateTotal + financialAssetsTotal + giftAssetsTotal + otherAssetsTotal

    // 금융채무 = 주택담보대출 + 신용대출 + 카드대금
    const financialDebtTotal =
      convertToWon(data.mortgageLoan) + convertToWon(data.creditLoan) + convertToWon(data.cardDebt)

    // 장례비
    const funeralExpenseTotal = convertToWon(data.funeralExpense)

    // 세금미납
    const taxArrearsTotal = convertToWon(data.taxArrears)

    // 기타채무
    const otherDebtTotal = convertToWon(data.otherDebt)

    // 총채무 = 장례비 + 금융채무 + 세금미납 + 기타채무
    const totalDebt = funeralExpenseTotal + financialDebtTotal + taxArrearsTotal + otherDebtTotal

    // 순 재산가액 = 총 재산가액 - 총 채무
    const netAssets = totalAssets - totalDebt

    // 공제 계산
    let basicDeductionAmount = 0
    let spouseDeductionAmount = 0
    let housingDeductionAmount = 0

    // 일괄공제를 체크해야만 기본 5억원 공제 적용
    if (data.basicDeduction) basicDeductionAmount = 500000000 // 5억원
    if (data.spouseDeduction) spouseDeductionAmount = 500000000 // 5억원
    if (data.housingDeduction) housingDeductionAmount = 600000000 // 6억원

    // 금융자산 공제 = min(순금융자산의 20%, 2억원)
    const netFinancialAssets = Math.max(0, financialAssetsTotal - financialDebtTotal)
    const financialDeduction = Math.min(netFinancialAssets * 0.2, 200000000) // 최대 2억원

    // 총 공제액
    const totalDeductions = basicDeductionAmount + spouseDeductionAmount + housingDeductionAmount + financialDeduction

    // 과세표준 = 순 재산가액 - 총 공제액
    const taxableAmount = Math.max(0, netAssets - totalDeductions)

    // 세율 및 누진공제액 계산
    let taxRate = 0
    let progressiveDeduction = 0

    if (taxableAmount <= 100000000) {
      // 1억원 이하: 10%
      taxRate = 10
      progressiveDeduction = 0
    } else if (taxableAmount <= 500000000) {
      // 5억원 이하: 20%
      taxRate = 20
      progressiveDeduction = 10000000 // 1천만원
    } else if (taxableAmount <= 1000000000) {
      // 10억원 이하: 30%
      taxRate = 30
      progressiveDeduction = 60000000 // 6천만원
    } else if (taxableAmount <= 3000000000) {
      // 30억원 이하: 40%
      taxRate = 40
      progressiveDeduction = 160000000 // 1억 6천만원
    } else {
      // 30억원 초과: 50%
      taxRate = 50
      progressiveDeduction = 460000000 // 4억 6천만원
    }

    // 상속세 산출세액 = (상속세 과세표준 * 세율) - 누진공제액
    const calculatedTax = Math.max(0, (taxableAmount * taxRate) / 100 - progressiveDeduction)

    // 증여세액공제 계산
    let giftTaxCredit = 0
    if (giftAssetsTotal > 0) {
      // 배우자일 때: 사전증여자산 - 6억원, 아닐 시: 사전증여자산 - 5천만원
      const giftDeductionAmount = data.isSpouse ? 600000000 : 50000000
      const deductedGiftAmount = Math.max(0, giftAssetsTotal - giftDeductionAmount)

      if (deductedGiftAmount > 0) {
        let giftTaxRate = 0
        let giftProgressiveDeduction = 0

        if (deductedGiftAmount <= 100000000) {
          // 1억원 이하: 10%
          giftTaxRate = 10
          giftProgressiveDeduction = 0
        } else if (deductedGiftAmount <= 500000000) {
          // 5억원 이하: 20%
          giftTaxRate = 20
          giftProgressiveDeduction = 10000000 // 1천만원
        } else if (deductedGiftAmount <= 1000000000) {
          // 10억원 이하: 30%
          giftTaxRate = 30
          giftProgressiveDeduction = 60000000 // 6천만원
        } else if (deductedGiftAmount <= 3000000000) {
          // 30억원 이하: 40%
          giftTaxRate = 40
          giftProgressiveDeduction = 160000000 // 1억 6천만원
        } else {
          // 30억원 초과: 50%
          giftTaxRate = 50
          giftProgressiveDeduction = 460000000 // 4억 6천만원
        }

        giftTaxCredit = Math.max(0, (deductedGiftAmount * giftTaxRate) / 100 - giftProgressiveDeduction)
      }
    }

    // 신고세액공제 = 산출세액의 3%
    const reportTaxCredit = calculatedTax * 0.03

    // 세액공제 합계
    const totalTaxCredit = giftTaxCredit + reportTaxCredit

    // 최종 상속세 = 산출세액 - 세액공제 합계
    const finalTax = Math.max(0, calculatedTax - totalTaxCredit)

    const result = {
      realEstateTotal,
      financialAssetsTotal,
      giftAssetsTotal,
      otherAssetsTotal,
      totalAssets,
      financialDebtTotal,
      funeralExpenseTotal,
      taxArrearsTotal,
      otherDebtTotal,
      totalDebt,
      netAssets,
      totalDeductions,
      financialDeduction,
      taxableAmount,
      taxRate,
      progressiveDeduction,
      calculatedTax,
      giftTaxCredit,
      reportTaxCredit,
      totalTaxCredit,
      finalTax,
    }

    console.log("=== 계산 결과 ===")
    console.log("총 재산가액:", totalAssets)
    console.log("총 채무:", totalDebt)
    console.log("최종 상속세:", finalTax)
    console.log("전체 결과:", result)

    setCalculationResult(result)
  }

  const formatNumber = (num: number) => {
    // 10원 단위까지 반올림
    const rounded = Math.round(num / 10) * 10
    return rounded.toLocaleString("ko-KR")
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleCalculate = () => {
    // 계산 데이터를 localStorage에 저장
    const calculationData = {
      formData,
      calculationResult,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("inheritanceTaxCalculation", JSON.stringify(calculationData))

    // 결과 페이지로 이동
    router.push("/result")
  }

  // 상담 모달에 전달할 계산 데이터 - 간단하게 정리
  const consultationData = {
    totalAssets: calculationResult.totalAssets,
    totalDebt: calculationResult.totalDebt,
    netAssets: calculationResult.netAssets,
    taxableAmount: calculationResult.taxableAmount,
    calculatedTax: calculationResult.calculatedTax,
    finalTax: calculationResult.finalTax,
    basicDeduction: formData.basicDeduction,
    spouseDeduction: formData.spouseDeduction,
    housingDeduction: formData.housingDeduction,
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo-deobom-blue.png"
                  alt="세무법인 더봄"
                  width={240}
                  height={72}
                  className="h-10 w-auto"
                />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* 데스크톱에서만 전화번호 표시 */}
              <div className="hidden md:flex items-center space-x-2 text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="font-medium text-base">02-336-0309</span>
              </div>
              <Button
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 text-base font-medium rounded-md"
                onClick={() => setIsConsultationModalOpen(true)}
              >
                전문가 상담
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">상속세 계산기</h2>
              <p className="text-sm text-slate-600">2025년 기준 · 전문 세무사 검증 · 무료 서비스</p>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                실시간 계산
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                전문가 검증
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                정확한 세율
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 계산기 섹션 */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">상속세 계산기</CardTitle>
                  <span className="text-sm">{currentStep} / 4</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{((currentStep / 4) * 100).toFixed(0)}% 완료</span>
                  </div>
                  <Progress value={(currentStep / 4) * 100} className="bg-white/20" />
                </div>
                <div className="flex justify-between mt-4">
                  {steps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.active ? "bg-white text-blue-600" : "bg-white/20 text-white"
                        }`}
                      >
                        {step.number}
                      </div>
                      <span className="text-xs mt-1">{step.name}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* 단계별 입력 폼 */}
            {currentStep === 1 && (
              <Card className="mt-6">
                <CardHeader></CardHeader>
                <CardContent className="space-y-8">
                  {/* 부동산 섹션 */}
                  <div>
                    <h3 className="text-base font-semibold mb-4 text-slate-900">부동산</h3>
                    <p className="text-sm text-gray-600 mb-4">주거용, 상업용, 토지 등 부동산 자산을 입력해주세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="realEstate" className="text-sm font-medium">
                          주거용 부동산 (만원)
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">아파트, 주택, 오피스텔 등</p>
                        <Input
                          id="realEstate"
                          placeholder="예: 80,000"
                          value={formData.realEstate}
                          onChange={(e) => handleInputChange("realEstate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessProperty" className="text-sm font-medium">
                          상업용 부동산 (만원)
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">상가, 사무실, 임대용 건물 등</p>
                        <Input
                          id="businessProperty"
                          placeholder="예: 50,000"
                          value={formData.businessProperty}
                          onChange={(e) => handleInputChange("businessProperty", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="land" className="text-sm font-medium">
                          토지 (만원)
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">대지, 전답, 임야, 잡종지 등</p>
                        <Input
                          id="land"
                          placeholder="예: 30,000"
                          value={formData.land}
                          onChange={(e) => handleInputChange("land", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="otherRealEstate" className="text-sm font-medium">
                          기타 부동산 (만원)
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">펜션, 창고, 공장 등</p>
                        <Input
                          id="otherRealEstate"
                          placeholder="예: 10,000"
                          value={formData.otherRealEstate}
                          onChange={(e) => handleInputChange("otherRealEstate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 금융자산 섹션 */}
                  <div>
                    <h3 className="text-base font-semibold mb-4 text-slate-900">금융자산</h3>
                    <p className="text-sm text-gray-600 mb-4">예금, 주식, 펀드 등 금융자산을 입력해주세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="deposit" className="text-sm font-medium">
                          예금 (만원)
                        </Label>
                        <Input
                          id="deposit"
                          placeholder="예: 5,000"
                          value={formData.deposit}
                          onChange={(e) => handleInputChange("deposit", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="savings" className="text-sm font-medium">
                          적금 (만원)
                        </Label>
                        <Input
                          id="savings"
                          placeholder="예: 3,000"
                          value={formData.savings}
                          onChange={(e) => handleInputChange("savings", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stocks" className="text-sm font-medium">
                          주식 (만원)
                        </Label>
                        <Input
                          id="stocks"
                          placeholder="예: 5,000"
                          value={formData.stocks}
                          onChange={(e) => handleInputChange("stocks", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="funds" className="text-sm font-medium">
                          펀드 (만원)
                        </Label>
                        <Input
                          id="funds"
                          placeholder="예: 2,000"
                          value={formData.funds}
                          onChange={(e) => handleInputChange("funds", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bonds" className="text-sm font-medium">
                          채권 (만원)
                        </Label>
                        <Input
                          id="bonds"
                          placeholder="예: 1,000"
                          value={formData.bonds}
                          onChange={(e) => handleInputChange("bonds", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="crypto" className="text-sm font-medium">
                          암호화폐 (만원)
                        </Label>
                        <Input
                          id="crypto"
                          placeholder="예: 1,000"
                          value={formData.crypto}
                          onChange={(e) => handleInputChange("crypto", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 기타 자산 섹션 */}
                  <div>
                    <h3 className="text-base font-semibold mb-4 text-slate-900">기타 자산</h3>
                    <p className="text-sm text-gray-600 mb-4">대여금, 차량 등 기타 자산을 입력해주세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="vehicle" className="text-sm font-medium">
                          차량 (만원)
                        </Label>
                        <Input
                          id="vehicle"
                          placeholder="예: 3,000"
                          value={formData.vehicle}
                          onChange={(e) => handleInputChange("vehicle", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="insurance" className="text-sm font-medium">
                          보험금 (만원)
                        </Label>
                        <Input
                          id="insurance"
                          placeholder="예: 3,000"
                          value={formData.insurance}
                          onChange={(e) => handleInputChange("insurance", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessShare" className="text-sm font-medium">
                          사업지분 (만원)
                        </Label>
                        <Input
                          id="businessShare"
                          placeholder="예: 1,000"
                          value={formData.businessShare}
                          onChange={(e) => handleInputChange("businessShare", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="otherAssets" className="text-sm font-medium">
                          기타 자산 (만원)
                        </Label>
                        <Input
                          id="otherAssets"
                          placeholder="예: 2,000"
                          value={formData.otherAssets}
                          onChange={(e) => handleInputChange("otherAssets", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                      이전
                    </Button>
                    <Button onClick={nextStep} className="bg-slate-700 hover:bg-slate-800">
                      다음
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">증여</CardTitle>
                  <p className="text-sm text-gray-600">
                    피상속인이 사망일 전 10년 이내에 상속인에게 증여한 재산이 있다면 입력해주세요
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="giftProperty" className="text-sm font-medium">
                        증여받은 재산 (만원)
                      </Label>
                      <Input
                        id="giftProperty"
                        placeholder="예: 20,000"
                        value={formData.giftProperty}
                        onChange={(e) => handleInputChange("giftProperty", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="isSpouse"
                      checked={formData.isSpouse}
                      onChange={(e) => {
                        const newFormData = { ...formData, isSpouse: e.target.checked }
                        setFormData(newFormData)
                        calculateTax(newFormData)
                      }}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="isSpouse" className="text-base font-medium text-gray-900">
                        상속인이 피상속인의 배우자일 경우 체크해주세요
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      이전
                    </Button>
                    <Button onClick={nextStep} className="bg-slate-700 hover:bg-slate-800">
                      다음
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">채무 및 비용</CardTitle>
                  <p className="text-sm text-gray-600">차감할 채무와 비용을 입력해주세요</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mortgageLoan" className="text-sm font-medium">
                        주택담보대출 (만원)
                      </Label>
                      <Input
                        id="mortgageLoan"
                        placeholder="예: 20,000"
                        value={formData.mortgageLoan}
                        onChange={(e) => handleInputChange("mortgageLoan", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditLoan" className="text-sm font-medium">
                        신용대출 (만원)
                      </Label>
                      <Input
                        id="creditLoan"
                        placeholder="예: 3,000"
                        value={formData.creditLoan}
                        onChange={(e) => handleInputChange("creditLoan", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardDebt" className="text-sm font-medium">
                        카드대금 (만원)
                      </Label>
                      <Input
                        id="cardDebt"
                        placeholder="예: 500"
                        value={formData.cardDebt}
                        onChange={(e) => handleInputChange("cardDebt", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="funeralExpense" className="text-sm font-medium">
                        장례비 (만원)
                      </Label>
                      <Input
                        id="funeralExpense"
                        placeholder="예: 1,000"
                        value={formData.funeralExpense}
                        onChange={(e) => handleInputChange("funeralExpense", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxArrears" className="text-sm font-medium">
                        소득세 미납액 (만원)
                      </Label>
                      <Input
                        id="taxArrears"
                        placeholder="예: 3,000"
                        value={formData.taxArrears}
                        onChange={(e) => handleInputChange("taxArrears", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherDebt" className="text-sm font-medium">
                        기타 채무 (만원)
                      </Label>
                      <Input
                        id="otherDebt"
                        placeholder="예: 5,000"
                        value={formData.otherDebt}
                        onChange={(e) => handleInputChange("otherDebt", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      이전
                    </Button>
                    <Button onClick={nextStep} className="bg-slate-700 hover:bg-slate-800">
                      다음
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">공제혜택</CardTitle>
                  <p className="text-sm text-gray-600">적용 가능한 공제를 선택해주세요</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="basicDeduction"
                        checked={formData.basicDeduction}
                        onChange={(e) => {
                          const newFormData = { ...formData, basicDeduction: e.target.checked }
                          setFormData(newFormData)
                          calculateTax(newFormData)
                        }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="basicDeduction" className="text-base font-medium text-gray-900">
                          일괄공제
                        </label>
                        <p className="text-sm text-gray-600">5억원 (기본 공제)</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="spouseDeduction"
                        checked={formData.spouseDeduction}
                        onChange={(e) => {
                          const newFormData = { ...formData, spouseDeduction: e.target.checked }
                          setFormData(newFormData)
                          calculateTax(newFormData)
                        }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="spouseDeduction" className="text-base font-medium text-gray-900">
                          배우자 공제
                        </label>
                        <p className="text-sm text-gray-600">5억원 (배우자가 있는 경우)</p>
                        <p className="text-sm text-blue-600 font-medium">배우자 상속분에 경우 최소 5억원 보장</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="housingDeduction"
                        checked={formData.housingDeduction}
                        onChange={(e) => {
                          const newFormData = { ...formData, housingDeduction: e.target.checked }
                          setFormData(newFormData)
                          calculateTax(newFormData)
                        }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="housingDeduction" className="text-base font-medium text-gray-900">
                          동거주택 상속공제
                        </label>
                        <p className="text-sm text-gray-600">6억원 (10년이상 함께 거주한 1주택자의 경우)</p>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      💡 공제 항목은 중복 적용 가능하며, 순금융자산의 20% 공제(최대 2억원)가 자동으로 추가됩니다.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      이전
                    </Button>
                    <Button onClick={handleCalculate} className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-2">
                      계산하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 실시간 계산 결과 */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-lg overflow-hidden">
              <CardHeader className="bg-slate-800 text-white rounded-t-lg py-3">
                <CardTitle className="text-base">실시간 계산 결과</CardTitle>
              </CardHeader>
              <CardContent className="bg-white text-slate-900">
                <div className="text-center mb-6 mt-4">
                  <p className="text-sm text-slate-600">예상 상속세</p>
                  <p className="text-3xl font-bold text-slate-900">{formatNumber(calculationResult.finalTax)}원</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 재산가액</span>
                    <span className="text-slate-900">{formatNumber(calculationResult.totalAssets)}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">과세표준</span>
                    <span className="text-slate-900">{formatNumber(calculationResult.taxableAmount)}원</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <h4 className="font-medium mb-3 text-slate-900">상세 내역</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">총 재산가액</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.totalAssets)}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">총 채무</span>
                      <span className="text-red-600">-{formatNumber(calculationResult.totalDebt)}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">순 재산가액</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.netAssets)}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">공제액</span>
                      <span className="text-green-600">-{formatNumber(calculationResult.totalDeductions)}원</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-600">과세표준</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.taxableAmount)}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">적용 세율</span>
                      <span className="text-slate-900">{calculationResult.taxRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">산출세액</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.calculatedTax)}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">세액공제</span>
                      <span className="text-green-600">-{formatNumber(calculationResult.totalTaxCredit)}원</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-600">최종 상속세</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.finalTax)}원</span>
                    </div>
                  </div>
                  <Alert className="mt-4 bg-yellow-50 border-yellow-300">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      이 결과는 실시간 계산으로 참고용입니다. 실제 상속세는 전문가와 상담하시기 바랍니다.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={toggleDetails} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white">
                      {showDetails ? "간단히" : "상세보기"}
                    </Button>
                  </div>

                  {showDetails && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold mb-4 text-slate-900">계산 과정 상세</h3>

                      {/* 1단계: 총 재산가액 계산 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-700 mb-3">1단계: 총 재산가액 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">부동산:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.realEstateTotal)}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융자산:</span>
                            <span className="text-slate-900">
                              {formatNumber(calculationResult.financialAssetsTotal)}원
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">사전증여자산:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.giftAssetsTotal)}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">기타자산:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.otherAssetsTotal)}원</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">총 재산가액:</span>
                            <span className="text-blue-700">{formatNumber(calculationResult.totalAssets)}원</span>
                          </div>
                        </div>
                      </div>

                      {/* 2단계: 총 채무 계산 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-red-500">
                        <h4 className="font-medium text-red-700 mb-3">2단계: 총 채무 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">장례비:</span>
                            <span className="text-slate-900">
                              {formatNumber(calculationResult.funeralExpenseTotal)}원
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융채무:</span>
                            <span className="text-slate-900">
                              {formatNumber(calculationResult.financialDebtTotal)}원
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">세금미납:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.taxArrearsTotal)}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">기타채무:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.otherDebtTotal)}원</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">총 채무:</span>
                            <span className="text-red-700">{formatNumber(calculationResult.totalDebt)}원</span>
                          </div>
                        </div>
                      </div>

                      {/* 3단계: 순 재산가액 계산 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h4 className="font-medium text-green-700 mb-3">3단계: 순 재산가액 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">총 재산가액 - 총 채무:</span>
                            <span className="text-green-700">{formatNumber(calculationResult.netAssets)}원</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatNumber(calculationResult.totalAssets)} - {formatNumber(calculationResult.totalDebt)}{" "}
                            = {formatNumber(calculationResult.netAssets)}
                          </div>
                        </div>
                      </div>

                      {/* 4단계: 공제 계산 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <h4 className="font-medium text-purple-700 mb-3">4단계: 공제 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">일괄공제:</span>
                            <span className="text-slate-900">{formData.basicDeduction ? "500,000,000" : "0"}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">배우자공제:</span>
                            <span className="text-slate-900">{formData.spouseDeduction ? "500,000,000" : "0"}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">동거주택 상속공제:</span>
                            <span className="text-slate-900">{formData.housingDeduction ? "600,000,000" : "0"}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융자산 상속공제:</span>
                            <span className="text-slate-900">
                              {formatNumber(calculationResult.financialDeduction)}원
                            </span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">총 공제액:</span>
                            <span className="text-purple-700">{formatNumber(calculationResult.totalDeductions)}원</span>
                          </div>
                        </div>
                      </div>

                      {/* 5단계: 과세표준 계산 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <h4 className="font-medium text-orange-700 mb-3">5단계: 과세표준 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">순 재산가액 - 총 공제액:</span>
                            <span className="text-orange-700">{formatNumber(calculationResult.taxableAmount)}원</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatNumber(calculationResult.totalAssets)} -{" "}
                            {formatNumber(calculationResult.totalDeductions)} ={" "}
                            {formatNumber(calculationResult.taxableAmount)}
                          </div>
                        </div>
                      </div>

                      {/* 6단계: 세율 적용 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-700 mb-3">6단계: 세율 적용</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">과세표준:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.taxableAmount)}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">적용 세율:</span>
                            <span className="text-slate-900">{calculationResult.taxRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">누진공제:</span>
                            <span className="text-slate-900">
                              {formatNumber(calculationResult.progressiveDeduction)}원
                            </span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">산출세액:</span>
                            <span className="text-blue-700">{formatNumber(calculationResult.calculatedTax)}원</span>
                          </div>
                        </div>
                      </div>

                      {/* 7단계: 세액공제 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <h4 className="font-medium text-indigo-700 mb-3">7단계: 세액공제</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">증여세액공제:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.giftTaxCredit)}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">신고세액공제:</span>
                            <span className="text-slate-900">{formatNumber(calculationResult.reportTaxCredit)}원</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">세액공제 합계:</span>
                            <span className="text-indigo-700">{formatNumber(calculationResult.totalTaxCredit)}원</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                            <span className="text-slate-600">최종 상속세:</span>
                            <span className="text-indigo-700">{formatNumber(calculationResult.finalTax)}원</span>
                          </div>
                        </div>
                      </div>

                      {/* 2025년 상속세율 */}
                      <div className="mb-6 bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center text-slate-900">
                          <span className="mr-2">📊</span>
                          2025년 상속세율
                        </h4>
                        <div className="space-y-1 text-sm text-slate-700">
                          <div>• 1억원 이하: 10% (누진공제: 0원)</div>
                          <div>• 5억원 이하: 20% (누진공제: 1천만원)</div>
                          <div>• 10억원 이하: 30% (누진공제: 6천만원)</div>
                          <div>• 30억원 이하: 40% (누진공제: 1억6천만원)</div>
                          <div>• 30억원 초과: 50% (누진공제: 4억6천만원)</div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-500">
                          <div>✓ 일괄공제: 5억원</div>
                          <div>✓ 배우자공제: 5억원</div>
                          <div>✓ 동거주택 상속공제: 6억원</div>
                          <div>✓ 금융자산 상속공제: 순금융자산의 20% (최대 2억원)</div>
                        </div>
                      </div>

                      {/* 최종 계산 결과 */}
                      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 text-center text-white">
                        <div className="flex items-center justify-center mb-2">
                          <span className="mr-2">🧮</span>
                          <span className="font-semibold">최종 계산 결과</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          최종 상속세: {formatNumber(calculationResult.finalTax)}원
                        </div>
                        <div className="text-sm opacity-90">
                          산출세액: {formatNumber(calculationResult.calculatedTax)}원 - 세액공제:{" "}
                          {formatNumber(calculationResult.totalTaxCredit)}원
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 상속세 계산 안내 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-12">상속세 계산 안내</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-2">단계별 입력</h3>
              <p className="text-sm text-gray-600">기본 정보부터 차근차근 입력하여 정확한 계산 결과를 얻으세요</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-2">실시간 계산</h3>
              <p className="text-sm text-gray-600">입력하는 즉시 계산 결과를 확인할 수 있습니다</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-2">정확한 결과</h3>
              <p className="text-sm text-gray-600">2025년 기준 상속세율과 공제액 적용한 정확한 계산</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-4">주요 공제</h3>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>일괄공제: 5억원</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>배우자공제: 5억원</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>동거주택 상속공제: 6억원</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>금융자산 상속공제: 순금융자산의 20% (최대 2억원)</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-4">계산 방법</h3>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">1</span>
                  <span>총 재산가액 계산</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">2</span>
                  <span>총 공제액 계산</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">3</span>
                  <span>과세표준 × 세율 - 누진공제</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-4">세율 구간</h3>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>1억원 이하: 10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>5억원 이하: 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>10억원 이하: 30%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>30억원 이하: 40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>30억원 초과: 50%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 전화 버튼 - 고정 위치 */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <a
          href="tel:02-336-0309"
          className="w-14 h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="전화걸기"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>

      {/* 상담 모달 */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={consultationData}
      />

      {/* Footer 추가 */}
      <Footer />
    </div>
  )
}
