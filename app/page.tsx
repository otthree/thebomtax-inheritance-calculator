"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Plus, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
    otherAssets: "",

    // 2단계: 증여 (새로운 구조)
    gifts: [
      {
        id: 1,
        amount: "",
        relationship: "child", // "spouse" 또는 "child"
      },
    ],

    // 기존 호환성을 위해 유지 (계산에서 사용)
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

    // 배우자 공제 관련 추가 필드
    childrenCount: "",
    parentsCount: "",
    spouseExpectedInheritance: "",
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
    spouseDeductionAmount: 0, // 실제 배우자 공제액
    comprehensiveLimit: 0, // 종합한도
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
    { number: 3, name: "채무 및 비용", active: currentStep >= 3 },
    { number: 4, name: "공제혜택", active: currentStep >= 4 },
  ]

  useEffect(() => {
    calculateTax(formData)
  }, [])

  useEffect(() => {
    if (formData.isSpouse && !formData.spouseDeduction) {
      const newFormData = { ...formData, spouseDeduction: true }
      setFormData(newFormData)
      calculateTax(newFormData)
    }
  }, [formData, formData.isSpouse])

  // 숫자를 한글 금액으로 변환하는 함수 (만원 단위 고려)
  const convertToKoreanAmount = (value: string) => {
    if (!value || value === "0") return ""

    const numericValue = value.replace(/,/g, "")
    const number = Number.parseInt(numericValue)

    if (isNaN(number) || number === 0) return ""

    // 만원 단위이므로 10000을 곱함
    const actualAmount = number * 10000
    const units = ["", "만", "억", "조"]
    const result = []

    let tempNumber = actualAmount
    let unitIndex = 0

    while (tempNumber > 0 && unitIndex < units.length) {
      const remainder = tempNumber % 10000
      if (remainder > 0) {
        result.unshift(`${remainder.toLocaleString("ko-KR")}${units[unitIndex]}`)
      }
      tempNumber = Math.floor(tempNumber / 10000)
      unitIndex++
    }

    return result.join(" ") + "(원)"
  }

  // 원 단위 숫자를 한글 금액으로 변환하는 함수 (실시간 계산 결과용)
  const convertWonToKoreanAmount = (amount: number) => {
    if (amount === 0) return "0(원)"

    const units = ["", "만", "억", "조"]
    const result = []

    let tempNumber = amount
    let unitIndex = 0

    while (tempNumber > 0 && unitIndex < units.length) {
      const remainder = tempNumber % 10000
      if (remainder > 0) {
        result.unshift(`${remainder.toLocaleString("ko-KR")}${units[unitIndex]}`)
      }
      tempNumber = Math.floor(tempNumber / 10000)
      unitIndex++
    }

    return result.join(" ") + "(원)"
  }

  const handleInputChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    const formattedValue = numericValue ? Number(numericValue).toLocaleString("ko-KR") : ""

    const newFormData = { ...formData, [field]: formattedValue }
    setFormData(newFormData)
    calculateTax(newFormData)
  }

  const handleNumberInputChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    const newFormData = { ...formData, [field]: numericValue }
    setFormData(newFormData)
    calculateTax(newFormData)
  }

  // 증여 항목 추가
  const addGiftItem = () => {
    const newGift = {
      id: Date.now(),
      amount: "",
      relationship: "child",
    }
    const newFormData = {
      ...formData,
      gifts: [...formData.gifts, newGift],
    }
    setFormData(newFormData)
    calculateTax(newFormData)
  }

  // 증여 항목 삭제
  const removeGiftItem = (id: number) => {
    if (formData.gifts.length <= 1) return // 최소 1개는 유지

    const newFormData = {
      ...formData,
      gifts: formData.gifts.filter((gift) => gift.id !== id),
    }
    setFormData(newFormData)
    calculateTax(newFormData)
  }

  // 증여 항목 수정
  const updateGiftItem = (id: number, field: string, value: string) => {
    const newGifts = formData.gifts.map((gift) => {
      if (gift.id === id) {
        if (field === "amount") {
          const numericValue = value.replace(/[^0-9]/g, "")
          const formattedValue = numericValue ? Number(numericValue).toLocaleString("ko-KR") : ""
          return { ...gift, [field]: formattedValue }
        } else {
          return { ...gift, [field]: value }
        }
      }
      return gift
    })

    const newFormData = { ...formData, gifts: newGifts }
    setFormData(newFormData)
    calculateTax(newFormData)
  }

  const calculateGiftTaxCredit = (amount: number, relationship: string) => {
    if (amount <= 0) return 0

    const deductionAmount = relationship === "spouse" ? 600000000 : 50000000 // 6억 vs 5천만
    const taxableAmount = Math.max(0, amount - deductionAmount)

    if (taxableAmount <= 0) return 0

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

    return Math.max(0, (taxableAmount * taxRate) / 100 - progressiveDeduction)
  }

  // 배우자 공제액 계산 함수
  const calculateSpouseDeduction = (
    childrenCount: number,
    parentsCount: number,
    spouseExpectedInheritance: number,
    netAssets: number,
    gifts: any[],
  ) => {
    let a = childrenCount
    const b = parentsCount
    const c = spouseExpectedInheritance

    // if a = 0, b = a (자녀수가 0이면 부모수를 자녀수로 설정)
    if (a === 0) {
      a = b
    }

    // 배우자 사전증여액에서 6억을 공제한 값 (배우자과세표준)
    const spouseGiftTotal = gifts
      .filter((gift) => gift.relationship === "spouse")
      .reduce((total, gift) => {
        const amount = gift.amount?.replace(/,/g, "") || "0"
        return total + Number.parseInt(amount) * 10000
      }, 0)

    const 배우자과세표준 = Math.max(0, spouseGiftTotal - 600000000) // 6억 공제

    // d = 순재산가액 - 배우자과세표준
    const d = netAssets - 배우자과세표준

    // 법적한도 T = min(30억, 1.5*d / (1.5+a))
    const T = Math.min(3000000000, (1.5 * d) / (1.5 + a))

    // 배우자공제액 = max(5억, min(c, T))
    const spouseDeduction = Math.max(500000000, Math.min(c, T))

    // 만원 단위로 반올림
    return Math.round(spouseDeduction / 10000) * 10000
  }

  // 종합한도 계산 함수
  const calculateComprehensiveLimit = (netAssets: number, gifts: any[]) => {
    // 상속세 과세가액이 5억원 이하면 종합한도 적용 안함
    if (netAssets <= 500000000) {
      return Number.MAX_SAFE_INTEGER // 무제한
    }

    // 사전증여재산가액
    const giftAssetsTotal = gifts.reduce((total, gift) => {
      const amount = gift.amount?.replace(/,/g, "") || "0"
      return total + Number.parseInt(amount) * 10000
    }, 0)

    // 증여재산 공제액 등 계산
    const giftDeductionTotal = gifts.reduce((total, gift) => {
      const amount = gift.amount?.replace(/,/g, "") || "0"
      const giftAmount = Number.parseInt(amount) * 10000
      const deductionAmount = gift.relationship === "spouse" ? 600000000 : 50000000 // 6억 vs 5천만
      return total + Math.min(giftAmount, deductionAmount)
    }, 0)

    // 종합한도 = 상속세 과세가액 - (사전증여재산가액 - 증여재산 공제액 등)
    const comprehensiveLimit = netAssets - (giftAssetsTotal - giftDeductionTotal)

    return Math.max(0, comprehensiveLimit)
  }

  const calculateTax = (data: typeof formData) => {
    const convertToWon = (value: string) => {
      const numericValue = value?.replace(/,/g, "") || "0"
      const result = Number.parseInt(numericValue) * 10000
      return result
    }

    const realEstateTotal =
      convertToWon(data.realEstate) +
      convertToWon(data.businessProperty) +
      convertToWon(data.land) +
      convertToWon(data.otherRealEstate)

    const financialAssetsTotal =
      convertToWon(data.deposit) +
      convertToWon(data.savings) +
      convertToWon(data.stocks) +
      convertToWon(data.funds) +
      convertToWon(data.bonds) +
      convertToWon(data.crypto)

    // 새로운 증여 계산 로직
    const giftAssetsTotal = data.gifts.reduce((total, gift) => {
      return total + convertToWon(gift.amount)
    }, 0)

    const otherAssetsTotal = convertToWon(data.vehicle) + convertToWon(data.insurance) + convertToWon(data.otherAssets)

    const totalAssets = realEstateTotal + financialAssetsTotal + giftAssetsTotal + otherAssetsTotal

    const financialDebtTotal =
      convertToWon(data.mortgageLoan) + convertToWon(data.creditLoan) + convertToWon(data.cardDebt)

    const funeralExpenseTotal = Math.min(convertToWon(data.funeralExpense), 15000000) // 1500만원 한도 적용
    const taxArrearsTotal = convertToWon(data.taxArrears)
    const otherDebtTotal = convertToWon(data.otherDebt)

    const totalDebt = funeralExpenseTotal + financialDebtTotal + taxArrearsTotal + otherDebtTotal
    const netAssets = totalAssets - totalDebt

    let basicDeductionAmount = 0
    let spouseDeductionAmount = 0
    let housingDeductionAmount = 0

    if (data.basicDeduction) basicDeductionAmount = 500000000

    if (data.spouseDeduction) {
      const childrenCount = Number.parseInt(data.childrenCount) || 0
      const parentsCount = Number.parseInt(data.parentsCount) || 0
      const spouseExpectedInheritance = convertToWon(data.spouseExpectedInheritance)

      spouseDeductionAmount = calculateSpouseDeduction(
        childrenCount,
        parentsCount,
        spouseExpectedInheritance,
        netAssets,
        data.gifts,
      )
    }

    if (data.housingDeduction) housingDeductionAmount = 600000000

    const netFinancialAssets = Math.max(0, financialAssetsTotal - financialDebtTotal)
    const financialDeduction =
      netFinancialAssets <= 20000000
        ? netFinancialAssets
        : netFinancialAssets <= 100000000
          ? 20000000
          : Math.min(netFinancialAssets * 0.2, 200000000)

    // 종합한도 계산
    const comprehensiveLimit = calculateComprehensiveLimit(netAssets, data.gifts)

    // 종합한도 적용 대상 공제액들의 합
    const deductionsSubjectToLimit =
      basicDeductionAmount + spouseDeductionAmount + financialDeduction + housingDeductionAmount

    // 종합한도 적용
    const limitedDeductions = Math.min(deductionsSubjectToLimit, comprehensiveLimit)

    const totalDeductions = limitedDeductions
    const taxableAmount = Math.max(0, netAssets - totalDeductions)

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

    const taxCalculation = (taxableAmount * taxRate) / 100
    const calculatedTax = Math.max(0, taxCalculation - progressiveDeduction)

    // 새로운 증여세액공제 계산
    const giftTaxCredit = data.gifts.reduce((total, gift) => {
      const amount = convertToWon(gift.amount)
      return total + calculateGiftTaxCredit(amount, gift.relationship)
    }, 0)

    const reportTaxCredit = (calculatedTax - giftTaxCredit) * 0.03
    const totalTaxCredit = giftTaxCredit + reportTaxCredit
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
      spouseDeductionAmount,
      comprehensiveLimit,
      taxableAmount,
      taxRate,
      progressiveDeduction,
      calculatedTax,
      giftTaxCredit,
      reportTaxCredit,
      totalTaxCredit,
      finalTax,
    }

    setCalculationResult(result)

    // 기존 호환성을 위해 업데이트
    const hasSpouseGift = data.gifts.some((gift) => gift.relationship === "spouse")
    const totalGiftAmount = data.gifts.reduce((total, gift) => total + convertToWon(gift.amount), 0)

    // 기존 변수들 업데이트 (구글시트 호환성)
    const updatedFormData = {
      ...data,
      giftProperty: (totalGiftAmount / 10000).toLocaleString("ko-KR"),
      isSpouse: hasSpouseGift,
    }

    if (JSON.stringify(updatedFormData) !== JSON.stringify(data)) {
      setFormData(updatedFormData)
    }
  }

  const formatNumber = (num: number) => {
    const rounded = Math.round(num / 10000)
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
    const calculationData = {
      formData,
      calculationResult,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("inheritanceTaxCalculation", JSON.stringify(calculationData))

    // router.push 대신 window.location.href 사용
    window.location.href = "/result"
  }

  const consultationData = {
    totalAssets: calculationResult.totalAssets,
    totalDebt: calculationResult.totalDebt,
    netAssets: calculationResult.netAssets,
    realEstateTotal: calculationResult.realEstateTotal,
    financialAssetsTotal: calculationResult.financialAssetsTotal,
    giftAssetsTotal: calculationResult.giftAssetsTotal,
    otherAssetsTotal: calculationResult.otherAssetsTotal,
    financialDebtTotal: calculationResult.financialDebtTotal,
    funeralExpenseTotal: calculationResult.funeralExpenseTotal,
    taxArrearsTotal: calculationResult.taxArrearsTotal,
    otherDebtTotal: calculationResult.otherDebtTotal,
    totalDeductions: calculationResult.totalDeductions,
    financialDeduction: calculationResult.financialDeduction,
    basicDeduction: formData.basicDeduction,
    spouseDeduction: formData.spouseDeduction,
    housingDeduction: formData.housingDeduction,
    taxableAmount: calculationResult.taxableAmount,
    taxRate: calculationResult.taxRate,
    progressiveDeduction: calculationResult.progressiveDeduction,
    calculatedTax: calculationResult.calculatedTax,
    giftTaxCredit: calculationResult.giftTaxCredit,
    reportTaxCredit: calculationResult.reportTaxCredit,
    totalTaxCredit: calculationResult.totalTaxCredit,
    finalTax: calculationResult.finalTax,
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
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
                상담신청
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

            {currentStep === 1 && (
              <Card className="mt-6">
                <CardHeader></CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-base font-semibold mb-4 text-slate-900">부동산</h3>
                    <p className="text-sm text-gray-600 mb-4">주거용, 상업용, 토지 등 부동산 자산을 입력해주세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="realEstate" className="text-sm font-medium">
                          주거용 부동산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">아파트, 주택, 오피스텔 등</p>
                        <Input
                          id="realEstate"
                          placeholder="예: 80,000"
                          value={formData.realEstate}
                          onChange={(e) => handleInputChange("realEstate", e.target.value)}
                        />
                        {formData.realEstate && (
                          <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.realEstate)}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="otherRealEstate" className="text-sm font-medium">
                          기타 부동산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">상가, 토지, 별장 등</p>
                        <Input
                          id="otherRealEstate"
                          placeholder="예: 10,000"
                          value={formData.otherRealEstate}
                          onChange={(e) => handleInputChange("otherRealEstate", e.target.value)}
                        />
                        {formData.otherRealEstate && (
                          <p className="text-xs text-gray-400 mt-1">
                            {convertToKoreanAmount(formData.otherRealEstate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold mb-4 text-slate-900">금융자산</h3>
                    <p className="text-sm text-gray-600 mb-4">예금, 주식, 펀드 등 금융자산을 입력해주세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="deposit" className="text-sm font-medium">
                          예/적금 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <Input
                          id="deposit"
                          placeholder="예: 5,000"
                          value={formData.deposit}
                          onChange={(e) => handleInputChange("deposit", e.target.value)}
                        />
                        {formData.deposit && (
                          <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.deposit)}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="stocks" className="text-sm font-medium">
                          주식 및 기타 금융자산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <Input
                          id="stocks"
                          placeholder="예: 5,000"
                          value={formData.stocks}
                          onChange={(e) => handleInputChange("stocks", e.target.value)}
                        />
                        {formData.stocks && (
                          <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.stocks)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold mb-4 text-slate-900">기타 자산</h3>
                    <p className="text-sm text-gray-600 mb-4">대여금, 차량 등 기타 자산을 입력해주세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="otherAssets" className="text-sm font-medium">
                          기타 자산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <Input
                          id="otherAssets"
                          placeholder="예: 2,000"
                          value={formData.otherAssets}
                          onChange={(e) => handleInputChange("otherAssets", e.target.value)}
                        />
                        {formData.otherAssets && (
                          <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.otherAssets)}</p>
                        )}
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
                  <div className="space-y-4">
                    {formData.gifts.map((gift, index) => (
                      <div key={gift.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">증여 {index + 1}</h4>
                          {formData.gifts.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGiftItem(gift.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">
                              증여받은 재산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                            </Label>
                            <Input
                              placeholder="예: 20,000"
                              value={gift.amount}
                              onChange={(e) => updateGiftItem(gift.id, "amount", e.target.value)}
                            />
                            {gift.amount && (
                              <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(gift.amount)}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-3 block">증여자와의 관계</Label>
                            <div className="flex space-x-6">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`relationship-${gift.id}`}
                                  value="spouse"
                                  checked={gift.relationship === "spouse"}
                                  onChange={(e) => updateGiftItem(gift.id, "relationship", e.target.value)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-900">배우자</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`relationship-${gift.id}`}
                                  value="child"
                                  checked={gift.relationship === "child"}
                                  onChange={(e) => updateGiftItem(gift.id, "relationship", e.target.value)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-900">자녀</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={addGiftItem}
                      className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent"
                    >
                      <Plus className="w-4 h-4" />
                      <span>증여 항목 추가</span>
                    </Button>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      💡 배우자 증여는 6억원, 자녀 증여는 5천만원까지 공제됩니다.
                    </AlertDescription>
                  </Alert>

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
                        주택담보대출 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                      </Label>
                      <Input
                        id="mortgageLoan"
                        placeholder="예: 20,000"
                        value={formData.mortgageLoan}
                        onChange={(e) => handleInputChange("mortgageLoan", e.target.value)}
                      />
                      {formData.mortgageLoan && (
                        <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.mortgageLoan)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="creditLoan" className="text-sm font-medium">
                        신용대출 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                      </Label>
                      <Input
                        id="creditLoan"
                        placeholder="예: 3,000"
                        value={formData.creditLoan}
                        onChange={(e) => handleInputChange("creditLoan", e.target.value)}
                      />
                      {formData.creditLoan && (
                        <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.creditLoan)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cardDebt" className="text-sm font-medium">
                        카드대금 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                      </Label>
                      <Input
                        id="cardDebt"
                        placeholder="예: 500"
                        value={formData.cardDebt}
                        onChange={(e) => handleInputChange("cardDebt", e.target.value)}
                      />
                      {formData.cardDebt && (
                        <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.cardDebt)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="funeralExpense" className="text-sm font-medium">
                        장례비 (1500만원 한도) <span className="text-xs text-gray-500">(단위 : 만원)</span>
                      </Label>
                      <Input
                        id="funeralExpense"
                        placeholder="예: 1,000"
                        value={formData.funeralExpense}
                        onChange={(e) => handleInputChange("funeralExpense", e.target.value)}
                      />
                      {formData.funeralExpense && (
                        <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.funeralExpense)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="taxArrears" className="text-sm font-medium">
                        소득세 미납액 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                      </Label>
                      <Input
                        id="taxArrears"
                        placeholder="예: 3,000"
                        value={formData.taxArrears}
                        onChange={(e) => handleInputChange("taxArrears", e.target.value)}
                      />
                      {formData.taxArrears && (
                        <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.taxArrears)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="otherDebt" className="text-sm font-medium">
                        기타 채무 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                      </Label>
                      <Input
                        id="otherDebt"
                        placeholder="예: 5,000"
                        value={formData.otherDebt}
                        onChange={(e) => handleInputChange("otherDebt", e.target.value)}
                      />
                      {formData.otherDebt && (
                        <p className="text-xs text-gray-400 mt-1">{convertToKoreanAmount(formData.otherDebt)}</p>
                      )}
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

                    <div className="space-y-4">
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
                        <div className="flex-1">
                          <label htmlFor="spouseDeduction" className="text-base font-medium text-gray-900">
                            배우자 공제
                          </label>
                          <p className="text-sm text-gray-600">배우자가 있을 경우 적용</p>
                          {calculationResult.spouseDeductionAmount > 0 && (
                            <p className="text-sm text-blue-600 font-medium">
                              공제액: {convertWonToKoreanAmount(calculationResult.spouseDeductionAmount)}
                            </p>
                          )}
                        </div>
                      </div>

                      {formData.spouseDeduction && (
                        <div className="ml-8 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="childrenCount" className="text-sm font-medium">
                                자녀 수
                              </Label>
                              <Input
                                id="childrenCount"
                                placeholder="예: 2"
                                value={formData.childrenCount}
                                onChange={(e) => handleNumberInputChange("childrenCount", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="parentsCount" className="text-sm font-medium">
                                부모 수
                              </Label>
                              <Input
                                id="parentsCount"
                                placeholder="예: 2"
                                value={formData.parentsCount}
                                onChange={(e) => handleNumberInputChange("parentsCount", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="spouseExpectedInheritance" className="text-sm font-medium">
                                배우자 상속액 <span className="text-xs text-gray-500">(단위: 만원)</span>
                              </Label>
                              <Input
                                id="spouseExpectedInheritance"
                                placeholder="예: 100,000"
                                value={formData.spouseExpectedInheritance}
                                onChange={(e) => handleInputChange("spouseExpectedInheritance", e.target.value)}
                              />
                              {formData.spouseExpectedInheritance && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {convertToKoreanAmount(formData.spouseExpectedInheritance)}
                                </p>
                              )}
                            </div>
                          </div>
                          <Alert className="bg-blue-100 border-blue-300">
                            <AlertTriangle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-xs">
                              💡 피상속인의 자녀 수와 부모 수를 입력해주십시오.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
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
                        <p className="text-sm text-gray-600">최대 6억원 (10년이상 함께 거주한 1주택자의 경우)</p>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      💡 공제 항목은 중복 적용 가능하며, 순금융자산의 20% 공제(최대 2억원)가 자동으로 추가됩니다.
                    </AlertDescription>
                  </Alert>

                  {calculationResult.netAssets > 500000000 && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 text-sm">
                        💡 상속세 과세가액이 5억원을 초과하여 종합한도가 적용됩니다. (한도:{" "}
                        {convertWonToKoreanAmount(calculationResult.comprehensiveLimit)})
                      </AlertDescription>
                    </Alert>
                  )}

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

          <div className="lg:col-span-1">
            <Card className="bg-white rounded-lg overflow-hidden">
              <CardHeader className="bg-slate-800 text-white rounded-t-lg py-3">
                <CardTitle className="text-base">실시간 계산 결과</CardTitle>
              </CardHeader>
              <CardContent className="bg-white text-slate-900">
                <div className="text-center mb-6 mt-4">
                  <p className="text-sm text-slate-600">예상 상속세</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {convertWonToKoreanAmount(calculationResult.finalTax)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <h4 className="font-medium mb-3 text-slate-900">상세 내역</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">총 재산가액</span>
                      <span className="text-slate-900">{convertWonToKoreanAmount(calculationResult.totalAssets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">총 채무</span>
                      <span className="text-red-600">-{convertWonToKoreanAmount(calculationResult.totalDebt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">순 재산가액</span>
                      <span className="text-slate-900">{convertWonToKoreanAmount(calculationResult.netAssets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">공제액</span>
                      <span className="text-green-600">
                        -{convertWonToKoreanAmount(calculationResult.totalDeductions)}
                      </span>
                    </div>
                    {calculationResult.netAssets > 500000000 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">종합한도 적용</span>
                        <span className="text-slate-500">
                          {convertWonToKoreanAmount(calculationResult.comprehensiveLimit)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-600">과세표준</span>
                      <span className="text-slate-900">
                        {convertWonToKoreanAmount(calculationResult.taxableAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">적용 세율</span>
                      <span className="text-slate-900">{calculationResult.taxRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">산출세액</span>
                      <span className="text-slate-900">
                        {convertWonToKoreanAmount(calculationResult.calculatedTax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">세액공제</span>
                      <span className="text-green-600">
                        -{convertWonToKoreanAmount(calculationResult.totalTaxCredit)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-600">최종 상속세</span>
                      <span className="text-slate-900">{convertWonToKoreanAmount(calculationResult.finalTax)}</span>
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

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-700 mb-3">1단계: 총 재산가액 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">부동산:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.realEstateTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융자산:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.financialAssetsTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">사전증여자산:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.giftAssetsTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">기타자산:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.otherAssetsTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">총 재산가액:</span>
                            <span className="text-blue-700">
                              {convertWonToKoreanAmount(calculationResult.totalAssets)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-red-500">
                        <h4 className="font-medium text-red-700 mb-3">2단계: 총 채무 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">장례비:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.funeralExpenseTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융채무:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.financialDebtTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">세금미납:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.taxArrearsTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">기타채무:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.otherDebtTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">총 채무:</span>
                            <span className="text-red-700">
                              {convertWonToKoreanAmount(calculationResult.totalDebt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h4 className="font-medium text-green-700 mb-3">3단계: 순 재산가액 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">총 재산가액 - 총 채무:</span>
                            <span className="text-green-700">
                              {convertWonToKoreanAmount(calculationResult.netAssets)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {convertWonToKoreanAmount(calculationResult.totalAssets)} -{" "}
                            {convertWonToKoreanAmount(calculationResult.totalDebt)} ={" "}
                            {convertWonToKoreanAmount(calculationResult.netAssets)}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <h4 className="font-medium text-purple-700 mb-3">4단계: 공제 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">일괄공제:</span>
                            <span className="text-slate-900">{formData.basicDeduction ? "5억(원)" : "0(원)"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">배우자공제:</span>
                            <span className="text-slate-900">
                              {formData.spouseDeduction
                                ? convertWonToKoreanAmount(calculationResult.spouseDeductionAmount)
                                : "0(원)"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">동거주택 상속공제:</span>
                            <span className="text-slate-900">{formData.housingDeduction ? "6억(원)" : "0(원)"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융자산 상속공제:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.financialDeduction)}
                            </span>
                          </div>
                          {calculationResult.netAssets > 500000000 && (
                            <div className="flex justify-between text-xs text-orange-600">
                              <span>종합한도 적용:</span>
                              <span>{convertWonToKoreanAmount(calculationResult.comprehensiveLimit)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">총 공제액:</span>
                            <span className="text-purple-700">
                              {convertWonToKoreanAmount(calculationResult.totalDeductions)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <h4 className="font-medium text-orange-700 mb-3">5단계: 과세표준 계산</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">순 재산가액 - 총 공제액:</span>
                            <span className="text-orange-700">
                              {convertWonToKoreanAmount(calculationResult.taxableAmount)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {convertWonToKoreanAmount(calculationResult.netAssets)} -{" "}
                            {convertWonToKoreanAmount(calculationResult.totalDeductions)} ={" "}
                            {convertWonToKoreanAmount(calculationResult.taxableAmount)}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-700 mb-3">6단계: 세율 적용</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">과세표준:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.taxableAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">적용 세율:</span>
                            <span className="text-slate-900">{calculationResult.taxRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">누진공제:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.progressiveDeduction)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">산출세액:</span>
                            <span className="text-blue-700">
                              {convertWonToKoreanAmount(calculationResult.calculatedTax)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 bg-slate-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <h4 className="font-medium text-indigo-700 mb-3">7단계: 세액공제</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">증여세액공제:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.giftTaxCredit)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">신고세액공제:</span>
                            <span className="text-slate-900">
                              {convertWonToKoreanAmount(calculationResult.reportTaxCredit)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                            <span className="text-slate-600">세액공제 합계:</span>
                            <span className="text-indigo-700">
                              {convertWonToKoreanAmount(calculationResult.totalTaxCredit)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                            <span className="text-slate-600">최종 상속세:</span>
                            <span className="text-indigo-700">
                              {convertWonToKoreanAmount(calculationResult.finalTax)}
                            </span>
                          </div>
                        </div>
                      </div>

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
                          <div>✓ 배우자공제: 최소 5억원 ~ 최대 30억원</div>
                          <div>✓ 동거주택 상속공제: 최대 6억원</div>
                          <div>✓ 금융자산 상속공제: 순금융자산의 20% (최대 2억원)</div>
                          <div>✓ 종합한도: 상속세 과세가액 5억원 초과시 적용</div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 text-center text-white">
                        <div className="flex items-center justify-center mb-2">
                          <span className="mr-2"></span>
                          <span className="font-semibold">최종 상속세</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {convertWonToKoreanAmount(calculationResult.finalTax)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={consultationData}
      />

      <Footer />
    </div>
  )
}
