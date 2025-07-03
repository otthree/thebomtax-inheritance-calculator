"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Calculator, Phone, ChevronRight, ChevronLeft, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ConsultationModal from "@/components/consultation-modal"
import { Footer } from "@/components/footer"

interface FormData {
  realEstate: string
  businessProperty: string
  land: string
  otherRealEstate: string
  giftRealEstate: string
  giftOther: string
  deposit: string
  savings: string
  stocks: string
  funds: string
  bonds: string
  crypto: string
  vehicle: string
  lifeInsurance: string
  pensionInsurance: string
  jewelry: string
  otherAssets: string
  mortgageLoan: string
  creditLoan: string
  cardDebt: string
  funeralExpense: string
  taxArrears: string
  otherDebt: string
  basicDeduction: boolean
  spouseDeduction: boolean
  housingDeduction: boolean
}

interface CalculationResult {
  realEstateTotal: number
  financialAssetsTotal: number
  insuranceTotal: number
  businessAssetsTotal: number
  movableAssetsTotal: number
  otherAssetsTotal: number
  totalAssets: number
  financialDebtTotal: number
  funeralExpenseTotal: number
  taxArrearsTotal: number
  otherDebtTotal: number
  totalDebt: number
  netAssets: number
  totalDeductions: number
  financialDeduction: number
  taxableAmount: number
  taxRate: number
  progressiveDeduction: number
  finalTax: number
  calculatedTax?: number
  giftTaxCredit?: number
  reportTaxCredit?: number
  totalTaxCredit?: number
  giftAssetsTotal?: number
  spouseDeductionAmount?: number
}

export default function InheritanceTaxCalculator() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    realEstate: "",
    businessProperty: "",
    land: "",
    otherRealEstate: "",
    giftRealEstate: "",
    giftOther: "",
    deposit: "",
    savings: "",
    stocks: "",
    funds: "",
    bonds: "",
    crypto: "",
    vehicle: "",
    lifeInsurance: "",
    pensionInsurance: "",
    jewelry: "",
    otherAssets: "",
    mortgageLoan: "",
    creditLoan: "",
    cardDebt: "",
    funeralExpense: "",
    taxArrears: "",
    otherDebt: "",
    basicDeduction: true,
    spouseDeduction: false,
    housingDeduction: false,
  })

  const [calculationResult, setCalculationResult] = useState<CalculationResult>({
    realEstateTotal: 0,
    financialAssetsTotal: 0,
    insuranceTotal: 0,
    businessAssetsTotal: 0,
    movableAssetsTotal: 0,
    otherAssetsTotal: 0,
    totalAssets: 0,
    financialDebtTotal: 0,
    funeralExpenseTotal: 0,
    taxArrearsTotal: 0,
    otherDebtTotal: 0,
    totalDebt: 0,
    netAssets: 0,
    totalDeductions: 0,
    financialDeduction: 0,
    taxableAmount: 0,
    taxRate: 0,
    progressiveDeduction: 0,
    finalTax: 0,
  })

  const convertWonToKoreanAmount = (amount: number): string => {
    amount = amount / 10000
    if (amount === 0) return "0(원)"

    const units = ["", "만", "억", "조"]
    const result = []
    let tempAmount = Math.abs(amount)

    for (let i = 0; i < units.length && tempAmount > 0; i++) {
      const remainder = tempAmount % 10000
      if (remainder > 0) {
        result.unshift(`${remainder.toLocaleString("ko-KR")}${units[i]}`)
      }
      tempAmount = Math.floor(tempAmount / 10000)
    }

    const koreanAmount = result.join(" ")
    return `${amount < 0 ? "-" : ""}${koreanAmount}(원)`
  }

  const formatInputValue = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "")
    if (!numericValue) return ""

    const number = Number.parseInt(numericValue) * 10000
    return convertWonToKoreanAmount(number)
  }

  const parseInputValue = (value: string): number => {
    const numericValue = value.replace(/[^0-9]/g, "")
    return numericValue ? Number.parseInt(numericValue) * 10000 : 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTax = () => {
    // 자산 계산
    const realEstateTotal =
      parseInputValue(formData.realEstate) +
      parseInputValue(formData.businessProperty) +
      parseInputValue(formData.land) +
      parseInputValue(formData.otherRealEstate)

    const financialAssetsTotal =
      parseInputValue(formData.deposit) +
      parseInputValue(formData.savings) +
      parseInputValue(formData.stocks) +
      parseInputValue(formData.funds) +
      parseInputValue(formData.bonds) +
      parseInputValue(formData.crypto)

    const insuranceTotal = parseInputValue(formData.lifeInsurance) + parseInputValue(formData.pensionInsurance)

    const movableAssetsTotal = parseInputValue(formData.vehicle) + parseInputValue(formData.jewelry)

    const giftAssetsTotal = parseInputValue(formData.giftRealEstate) + parseInputValue(formData.giftOther)

    const otherAssetsTotal = parseInputValue(formData.otherAssets)

    const totalAssets =
      realEstateTotal + financialAssetsTotal + insuranceTotal + movableAssetsTotal + giftAssetsTotal + otherAssetsTotal

    // 부채 계산
    const financialDebtTotal =
      parseInputValue(formData.mortgageLoan) + parseInputValue(formData.creditLoan) + parseInputValue(formData.cardDebt)

    const funeralExpenseTotal = parseInputValue(formData.funeralExpense)
    const taxArrearsTotal = parseInputValue(formData.taxArrears)
    const otherDebtTotal = parseInputValue(formData.otherDebt)

    const totalDebt = financialDebtTotal + funeralExpenseTotal + taxArrearsTotal + otherDebtTotal

    // 순 재산가액
    const netAssets = totalAssets - totalDebt

    // 공제액 계산
    let totalDeductions = 0
    let spouseDeductionAmount = 0

    if (formData.basicDeduction) {
      totalDeductions += 200000000 // 기초공제 2억
    }

    if (formData.spouseDeduction) {
      spouseDeductionAmount = Math.min(netAssets * 0.3, 300000000) // 배우자공제 (순재산가액의 30% 또는 3억 중 적은 금액)
      totalDeductions += spouseDeductionAmount
    }

    if (formData.housingDeduction) {
      totalDeductions += 60000000 // 주택공제 6천만원
    }

    // 금융재산 공제 (2천만원 또는 금융재산의 20% 중 적은 금액)
    const financialDeduction = Math.min(20000000, financialAssetsTotal * 0.2)
    totalDeductions += financialDeduction

    // 과세표준
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

    // 산출세액
    const calculatedTax = Math.round(taxableAmount * (taxRate / 100)) - progressiveDeduction

    // 세액공제 (신고세액공제 등)
    const reportTaxCredit = Math.min(calculatedTax * 0.03, 5000000) // 신고세액공제 3% (최대 500만원)
    const totalTaxCredit = reportTaxCredit

    // 최종 상속세
    const finalTax = Math.max(0, calculatedTax - totalTaxCredit)

    const result: CalculationResult = {
      realEstateTotal,
      financialAssetsTotal,
      insuranceTotal,
      businessAssetsTotal: 0,
      movableAssetsTotal,
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
      finalTax,
      calculatedTax,
      giftTaxCredit: 0,
      reportTaxCredit,
      totalTaxCredit,
      giftAssetsTotal,
      spouseDeductionAmount,
    }

    setCalculationResult(result)
  }

  useEffect(() => {
    calculateTax()
  }, [formData])

  const handleSubmit = () => {
    const calculationData = {
      formData,
      calculationResult,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("inheritanceTaxCalculation", JSON.stringify(calculationData))
    router.push("/result")
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

  const progress = (currentStep / 4) * 100

  const steps = [
    { number: 1, title: "자산", description: "부동산, 금융자산 등" },
    { number: 2, title: "부채", description: "대출, 미납세금 등" },
    { number: 3, title: "제출 및 비용", description: "장례비용, 미납세금 등" },
    { number: 4, title: "공제혜택", description: "기초공제, 배우자공제 등" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <Image
                    src="/logo-deobom-blue.png"
                    alt="세무법인 더봄"
                    width={240}
                    height={72}
                    className="h-10 w-auto"
                  />
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      <div className="bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">상속세 계산기</h2>
              <p className="text-sm text-slate-600">2025년 기준 · 전문 세무사 검증 · 무료 서비스</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 계산기 */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="bg-slate-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">상속세 계산기</CardTitle>
                    <p className="text-slate-200 text-sm mt-1">{Math.round(progress)}% 완료</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{currentStep}/4</div>
                  </div>
                </div>
                <Progress value={progress} className="mt-4 bg-slate-600" />
              </CardHeader>
              <CardContent className="p-0">
                {/* 단계 표시 */}
                <div className="flex justify-between p-6 bg-slate-50 border-b">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className={`flex flex-col items-center ${
                        step.number === currentStep
                          ? "text-slate-900"
                          : step.number < currentStep
                            ? "text-green-600"
                            : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                          step.number === currentStep
                            ? "bg-slate-900 text-white"
                            : step.number < currentStep
                              ? "bg-green-600 text-white"
                              : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {step.number}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-slate-500 hidden sm:block">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6">
                  {/* Step 1: 부동산 */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">부동산</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          주거용, 상업용, 토지 등 부동산 자산을 입력해주세요
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="realEstate" className="text-sm font-medium text-slate-700">
                              주거용 부동산 (단위: 만원)
                            </Label>
                            <Input
                              id="realEstate"
                              type="text"
                              placeholder="예: 80,000"
                              value={formData.realEstate}
                              onChange={(e) => handleInputChange("realEstate", e.target.value)}
                              className="text-right"
                            />
                            {formData.realEstate && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.realEstate)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="businessProperty" className="text-sm font-medium text-slate-700">
                              상업용 부동산 (단위: 만원)
                            </Label>
                            <Input
                              id="businessProperty"
                              type="text"
                              placeholder="예: 50,000"
                              value={formData.businessProperty}
                              onChange={(e) => handleInputChange("businessProperty", e.target.value)}
                              className="text-right"
                            />
                            {formData.businessProperty && (
                              <p className="text-xs text-slate-500 mt-1">
                                {formatInputValue(formData.businessProperty)}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="land" className="text-sm font-medium text-slate-700">
                              토지 (단위: 만원)
                            </Label>
                            <Input
                              id="land"
                              type="text"
                              placeholder="예: 30,000"
                              value={formData.land}
                              onChange={(e) => handleInputChange("land", e.target.value)}
                              className="text-right"
                            />
                            {formData.land && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.land)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="otherRealEstate" className="text-sm font-medium text-slate-700">
                              기타 부동산 (단위: 만원)
                            </Label>
                            <Input
                              id="otherRealEstate"
                              type="text"
                              placeholder="예: 10,000"
                              value={formData.otherRealEstate}
                              onChange={(e) => handleInputChange("otherRealEstate", e.target.value)}
                              className="text-right"
                            />
                            {formData.otherRealEstate && (
                              <p className="text-xs text-slate-500 mt-1">
                                {formatInputValue(formData.otherRealEstate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">금융자산</h3>
                        <p className="text-sm text-slate-600 mb-4">예금, 주식, 펀드 등 금융자산을 입력해주세요</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="deposit" className="text-sm font-medium text-slate-700">
                              예금 (단위: 만원)
                            </Label>
                            <Input
                              id="deposit"
                              type="text"
                              placeholder="예: 5,000"
                              value={formData.deposit}
                              onChange={(e) => handleInputChange("deposit", e.target.value)}
                              className="text-right"
                            />
                            {formData.deposit && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.deposit)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="stocks" className="text-sm font-medium text-slate-700">
                              주식 (단위: 만원)
                            </Label>
                            <Input
                              id="stocks"
                              type="text"
                              placeholder="예: 3,000"
                              value={formData.stocks}
                              onChange={(e) => handleInputChange("stocks", e.target.value)}
                              className="text-right"
                            />
                            {formData.stocks && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.stocks)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="funds" className="text-sm font-medium text-slate-700">
                              펀드 (단위: 만원)
                            </Label>
                            <Input
                              id="funds"
                              type="text"
                              placeholder="예: 2,000"
                              value={formData.funds}
                              onChange={(e) => handleInputChange("funds", e.target.value)}
                              className="text-right"
                            />
                            {formData.funds && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.funds)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="bonds" className="text-sm font-medium text-slate-700">
                              채권 (단위: 만원)
                            </Label>
                            <Input
                              id="bonds"
                              type="text"
                              placeholder="예: 1,000"
                              value={formData.bonds}
                              onChange={(e) => handleInputChange("bonds", e.target.value)}
                              className="text-right"
                            />
                            {formData.bonds && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.bonds)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="savings" className="text-sm font-medium text-slate-700">
                              적금 (단위: 만원)
                            </Label>
                            <Input
                              id="savings"
                              type="text"
                              placeholder="예: 1,000"
                              value={formData.savings}
                              onChange={(e) => handleInputChange("savings", e.target.value)}
                              className="text-right"
                            />
                            {formData.savings && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.savings)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="crypto" className="text-sm font-medium text-slate-700">
                              암호화폐 (단위: 만원)
                            </Label>
                            <Input
                              id="crypto"
                              type="text"
                              placeholder="예: 1,000"
                              value={formData.crypto}
                              onChange={(e) => handleInputChange("crypto", e.target.value)}
                              className="text-right"
                            />
                            {formData.crypto && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.crypto)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">기타 자산</h3>
                        <p className="text-sm text-slate-600 mb-4">차량, 보험, 귀금속 등 기타 자산을 입력해주세요</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vehicle" className="text-sm font-medium text-slate-700">
                              차량 (단위: 만원)
                            </Label>
                            <Input
                              id="vehicle"
                              type="text"
                              placeholder="예: 3,000"
                              value={formData.vehicle}
                              onChange={(e) => handleInputChange("vehicle", e.target.value)}
                              className="text-right"
                            />
                            {formData.vehicle && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.vehicle)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="lifeInsurance" className="text-sm font-medium text-slate-700">
                              생명보험 (단위: 만원)
                            </Label>
                            <Input
                              id="lifeInsurance"
                              type="text"
                              placeholder="예: 5,000"
                              value={formData.lifeInsurance}
                              onChange={(e) => handleInputChange("lifeInsurance", e.target.value)}
                              className="text-right"
                            />
                            {formData.lifeInsurance && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.lifeInsurance)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="pensionInsurance" className="text-sm font-medium text-slate-700">
                              연금보험 (단위: 만원)
                            </Label>
                            <Input
                              id="pensionInsurance"
                              type="text"
                              placeholder="예: 2,000"
                              value={formData.pensionInsurance}
                              onChange={(e) => handleInputChange("pensionInsurance", e.target.value)}
                              className="text-right"
                            />
                            {formData.pensionInsurance && (
                              <p className="text-xs text-slate-500 mt-1">
                                {formatInputValue(formData.pensionInsurance)}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="jewelry" className="text-sm font-medium text-slate-700">
                              귀금속 (단위: 만원)
                            </Label>
                            <Input
                              id="jewelry"
                              type="text"
                              placeholder="예: 1,000"
                              value={formData.jewelry}
                              onChange={(e) => handleInputChange("jewelry", e.target.value)}
                              className="text-right"
                            />
                            {formData.jewelry && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.jewelry)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="giftRealEstate" className="text-sm font-medium text-slate-700">
                              증여받은 부동산 (단위: 만원)
                            </Label>
                            <Input
                              id="giftRealEstate"
                              type="text"
                              placeholder="예: 10,000"
                              value={formData.giftRealEstate}
                              onChange={(e) => handleInputChange("giftRealEstate", e.target.value)}
                              className="text-right"
                            />
                            {formData.giftRealEstate && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.giftRealEstate)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="giftOther" className="text-sm font-medium text-slate-700">
                              증여받은 기타자산 (단위: 만원)
                            </Label>
                            <Input
                              id="giftOther"
                              type="text"
                              placeholder="예: 5,000"
                              value={formData.giftOther}
                              onChange={(e) => handleInputChange("giftOther", e.target.value)}
                              className="text-right"
                            />
                            {formData.giftOther && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.giftOther)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="otherAssets" className="text-sm font-medium text-slate-700">
                              기타 자산 (단위: 만원)
                            </Label>
                            <Input
                              id="otherAssets"
                              type="text"
                              placeholder="예: 2,000"
                              value={formData.otherAssets}
                              onChange={(e) => handleInputChange("otherAssets", e.target.value)}
                              className="text-right"
                            />
                            {formData.otherAssets && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.otherAssets)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: 부채 */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">금융 부채</h3>
                        <p className="text-sm text-slate-600 mb-4">대출, 신용카드 등 금융 부채를 입력해주세요</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="mortgageLoan" className="text-sm font-medium text-slate-700">
                              주택담보대출 (단위: 만원)
                            </Label>
                            <Input
                              id="mortgageLoan"
                              type="text"
                              placeholder="예: 20,000"
                              value={formData.mortgageLoan}
                              onChange={(e) => handleInputChange("mortgageLoan", e.target.value)}
                              className="text-right"
                            />
                            {formData.mortgageLoan && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.mortgageLoan)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="creditLoan" className="text-sm font-medium text-slate-700">
                              신용대출 (단위: 만원)
                            </Label>
                            <Input
                              id="creditLoan"
                              type="text"
                              placeholder="예: 5,000"
                              value={formData.creditLoan}
                              onChange={(e) => handleInputChange("creditLoan", e.target.value)}
                              className="text-right"
                            />
                            {formData.creditLoan && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.creditLoan)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="cardDebt" className="text-sm font-medium text-slate-700">
                              신용카드 부채 (단위: 만원)
                            </Label>
                            <Input
                              id="cardDebt"
                              type="text"
                              placeholder="예: 500"
                              value={formData.cardDebt}
                              onChange={(e) => handleInputChange("cardDebt", e.target.value)}
                              className="text-right"
                            />
                            {formData.cardDebt && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.cardDebt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: 제출 및 비용 */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">장례비용 및 기타</h3>
                        <p className="text-sm text-slate-600 mb-4">장례비용, 미납세금 등을 입력해주세요</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="funeralExpense" className="text-sm font-medium text-slate-700">
                              장례비용 (단위: 만원)
                            </Label>
                            <Input
                              id="funeralExpense"
                              type="text"
                              placeholder="예: 500"
                              value={formData.funeralExpense}
                              onChange={(e) => handleInputChange("funeralExpense", e.target.value)}
                              className="text-right"
                            />
                            {formData.funeralExpense && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.funeralExpense)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="taxArrears" className="text-sm font-medium text-slate-700">
                              미납세금 (단위: 만원)
                            </Label>
                            <Input
                              id="taxArrears"
                              type="text"
                              placeholder="예: 200"
                              value={formData.taxArrears}
                              onChange={(e) => handleInputChange("taxArrears", e.target.value)}
                              className="text-right"
                            />
                            {formData.taxArrears && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.taxArrears)}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="otherDebt" className="text-sm font-medium text-slate-700">
                              기타 부채 (단위: 만원)
                            </Label>
                            <Input
                              id="otherDebt"
                              type="text"
                              placeholder="예: 1,000"
                              value={formData.otherDebt}
                              onChange={(e) => handleInputChange("otherDebt", e.target.value)}
                              className="text-right"
                            />
                            {formData.otherDebt && (
                              <p className="text-xs text-slate-500 mt-1">{formatInputValue(formData.otherDebt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: 공제혜택 */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">공제 혜택</h3>
                        <p className="text-sm text-slate-600 mb-4">해당되는 공제 항목을 선택해주세요</p>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <Checkbox
                              id="basicDeduction"
                              checked={formData.basicDeduction}
                              onCheckedChange={(checked) => handleInputChange("basicDeduction", checked as boolean)}
                            />
                            <div className="flex-1">
                              <Label htmlFor="basicDeduction" className="text-sm font-medium text-slate-700">
                                기초공제 (2억원)
                              </Label>
                              <p className="text-xs text-slate-500">모든 상속인에게 적용되는 기본 공제</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <Checkbox
                              id="spouseDeduction"
                              checked={formData.spouseDeduction}
                              onCheckedChange={(checked) => handleInputChange("spouseDeduction", checked as boolean)}
                            />
                            <div className="flex-1">
                              <Label htmlFor="spouseDeduction" className="text-sm font-medium text-slate-700">
                                배우자공제 (최대 3억원)
                              </Label>
                              <p className="text-xs text-slate-500">
                                배우자가 있는 경우 적용 (순재산가액의 30% 또는 3억원 중 적은 금액)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <Checkbox
                              id="housingDeduction"
                              checked={formData.housingDeduction}
                              onCheckedChange={(checked) => handleInputChange("housingDeduction", checked as boolean)}
                            />
                            <div className="flex-1">
                              <Label htmlFor="housingDeduction" className="text-sm font-medium text-slate-700">
                                주택공제 (6천만원)
                              </Label>
                              <p className="text-xs text-slate-500">거주주택에 대한 공제</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 네비게이션 버튼 */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      variant="outline"
                      className="flex items-center bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      이전
                    </Button>

                    {currentStep < 4 ? (
                      <Button onClick={nextStep} className="flex items-center bg-slate-700 hover:bg-slate-800">
                        다음
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} className="flex items-center bg-blue-600 hover:bg-blue-700">
                        <Calculator className="w-4 h-4 mr-2" />
                        계산하기
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 실시간 계산 결과 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="bg-slate-800 text-white">
                <CardTitle className="text-lg">실시간 계산 결과</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-600 mb-2">예상 상속세</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {convertWonToKoreanAmount(calculationResult.finalTax * 10000)}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 재산가액</span>
                    <span className="font-medium">
                      {convertWonToKoreanAmount(calculationResult.totalAssets * 10000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 부채</span>
                    <span className="font-medium text-red-600">
                      -{convertWonToKoreanAmount(calculationResult.totalDebt * 10000)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-slate-600">순 재산가액</span>
                    <span className="font-medium">{convertWonToKoreanAmount(calculationResult.netAssets * 10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 공제액</span>
                    <span className="font-medium text-green-600">
                      -{convertWonToKoreanAmount(calculationResult.totalDeductions * 10000)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-slate-600">과세표준</span>
                    <span className="font-medium">
                      {convertWonToKoreanAmount(calculationResult.taxableAmount * 10000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">적용 세율</span>
                    <span className="font-medium">{calculationResult.taxRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">산출세액</span>
                    <span className="font-medium">
                      {convertWonToKoreanAmount((calculationResult.calculatedTax || 0) * 10000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">세액공제</span>
                    <span className="font-medium text-green-600">
                      -{convertWonToKoreanAmount((calculationResult.totalTaxCredit || 0) * 10000)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">최종 상속세</span>
                    <span className="text-blue-600">
                      {convertWonToKoreanAmount(calculationResult.finalTax * 10000)}
                    </span>
                  </div>
                </div>

                <Alert className="mt-6 bg-yellow-50 border-yellow-300">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-xs">
                    이 결과는 참고용이며, 실제 상속세는 전문가와 상담하시기 바랍니다.
                  </AlertDescription>
                </Alert>

                <Button
                  className="w-full mt-4 bg-slate-700 hover:bg-slate-800"
                  onClick={() => setIsConsultationModalOpen(true)}
                >
                  상세보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 모바일 전화 버튼 */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <a
          href="tel:02-336-0309"
          className="w-14 h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="전화걸기"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={{
          totalAssets: calculationResult.totalAssets,
          totalDebt: calculationResult.totalDebt,
          netAssets: calculationResult.netAssets,
          taxableAmount: calculationResult.taxableAmount,
          taxRate: calculationResult.taxRate,
          progressiveDeduction: calculationResult.progressiveDeduction,
          finalTax: calculationResult.finalTax,
          basicDeduction: formData.basicDeduction,
          spouseDeduction: formData.spouseDeduction,
          housingDeduction: formData.housingDeduction,
          realEstateTotal: calculationResult.realEstateTotal,
          financialAssetsTotal: calculationResult.financialAssetsTotal,
          giftAssetsTotal: calculationResult.giftAssetsTotal || 0,
          otherAssetsTotal: calculationResult.otherAssetsTotal,
          financialDebtTotal: calculationResult.financialDebtTotal,
          funeralExpenseTotal: calculationResult.funeralExpenseTotal,
          taxArrearsTotal: calculationResult.taxArrearsTotal,
          otherDebtTotal: calculationResult.otherDebtTotal,
          totalDeductions: calculationResult.totalDeductions,
          financialDeduction: calculationResult.financialDeduction,
          calculatedTax: calculationResult.calculatedTax || 0,
          giftTaxCredit: calculationResult.giftTaxCredit || 0,
          reportTaxCredit: calculationResult.reportTaxCredit || 0,
          totalTaxCredit: calculationResult.totalTaxCredit || 0,
          spouseDeductionAmount: calculationResult.spouseDeductionAmount || 0,
        }}
      />

      <Footer />
    </div>
  )
}
