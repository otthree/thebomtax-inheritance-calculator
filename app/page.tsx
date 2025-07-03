"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Phone, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  childrenCount: string
  parentsCount: string
  spouseExpectedInheritance: string
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
  giftAssetsTotal?: number
  spouseDeductionAmount?: number
}

export default function InheritanceTaxCalculator() {
  const router = useRouter()
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
    childrenCount: "",
    parentsCount: "",
    spouseExpectedInheritance: "",
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
    giftAssetsTotal: 0,
    spouseDeductionAmount: 0,
  })

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const parseNumber = (value: string): number => {
    const cleanValue = value.replace(/[^0-9]/g, "")
    return cleanValue ? Number.parseInt(cleanValue) * 10000 : 0
  }

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
    const cleanValue = value.replace(/[^0-9]/g, "")
    if (!cleanValue) return ""
    return Number.parseInt(cleanValue).toLocaleString("ko-KR")
  }

  const calculateSpouseDeduction = (
    childrenCount: number,
    parentsCount: number,
    spouseExpectedInheritance: number,
  ): number => {
    let a = childrenCount
    const b = parentsCount
    const c = spouseExpectedInheritance

    if (a === 0) {
      a = b // 자녀수가 0이면 부모수를 자녀수로 설정
    }

    const calculatedDeduction = (1.5 * c) / (1.5 + a)
    const spouseDeduction = Math.max(500000000, Math.min(3000000000, calculatedDeduction))

    // 만원 단위로 반올림
    return Math.round(spouseDeduction / 10000) * 10000
  }

  const calculateTax = () => {
    // 자산 계산
    const realEstateTotal =
      parseNumber(formData.realEstate) +
      parseNumber(formData.businessProperty) +
      parseNumber(formData.land) +
      parseNumber(formData.otherRealEstate)
    const financialAssetsTotal =
      parseNumber(formData.deposit) +
      parseNumber(formData.savings) +
      parseNumber(formData.stocks) +
      parseNumber(formData.funds) +
      parseNumber(formData.bonds) +
      parseNumber(formData.crypto)
    const insuranceTotal = parseNumber(formData.lifeInsurance) + parseNumber(formData.pensionInsurance)
    const movableAssetsTotal = parseNumber(formData.vehicle) + parseNumber(formData.jewelry)
    const otherAssetsTotal = parseNumber(formData.otherAssets)
    const giftAssetsTotal = parseNumber(formData.giftRealEstate) + parseNumber(formData.giftOther)

    const totalAssets =
      realEstateTotal + financialAssetsTotal + insuranceTotal + movableAssetsTotal + otherAssetsTotal + giftAssetsTotal

    // 부채 계산
    const financialDebtTotal =
      parseNumber(formData.mortgageLoan) + parseNumber(formData.creditLoan) + parseNumber(formData.cardDebt)
    const funeralExpenseTotal = parseNumber(formData.funeralExpense)
    const taxArrearsTotal = parseNumber(formData.taxArrears)
    const otherDebtTotal = parseNumber(formData.otherDebt)

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
      const childrenCount = Number.parseInt(formData.childrenCount) || 0
      const parentsCount = Number.parseInt(formData.parentsCount) || 0
      const spouseExpectedInheritance = parseNumber(formData.spouseExpectedInheritance)

      spouseDeductionAmount = calculateSpouseDeduction(childrenCount, parentsCount, spouseExpectedInheritance)
      totalDeductions += spouseDeductionAmount
    }

    if (formData.housingDeduction) {
      totalDeductions += 600000000 // 가업상속공제 6억 (간소화)
    }

    // 금융재산 공제 (2천만원 또는 순금융재산의 20% 중 큰 금액, 최대 2억)
    const financialDeduction = Math.min(200000000, Math.max(20000000, financialAssetsTotal * 0.2))
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

    // 최종 상속세
    const finalTax = Math.max(0, Math.round(taxableAmount * (taxRate / 100)) - progressiveDeduction)

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
      giftAssetsTotal,
      spouseDeductionAmount,
    }

    setCalculationResult(result)
  }

  useEffect(() => {
    calculateTax()
  }, [formData])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCalculate = () => {
    const calculationData = {
      formData,
      calculationResult,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("inheritanceTaxCalculation", JSON.stringify(calculationData))
    router.push("/result")
  }

  const consultationCalculationData = {
    totalAssets: calculationResult.totalAssets || 0,
    totalDebt: calculationResult.totalDebt || 0,
    netAssets: calculationResult.netAssets || 0,
    taxableAmount: calculationResult.taxableAmount || 0,
    taxRate: calculationResult.taxRate || 0,
    progressiveDeduction: calculationResult.progressiveDeduction || 0,
    finalTax: calculationResult.finalTax || 0,
    basicDeduction: formData.basicDeduction || false,
    spouseDeduction: formData.spouseDeduction || false,
    housingDeduction: formData.housingDeduction || false,
    realEstateTotal: calculationResult.realEstateTotal || 0,
    financialAssetsTotal: calculationResult.financialAssetsTotal || 0,
    giftAssetsTotal: calculationResult.giftAssetsTotal || 0,
    otherAssetsTotal: calculationResult.otherAssetsTotal || 0,
    financialDebtTotal: calculationResult.financialDebtTotal || 0,
    funeralExpenseTotal: calculationResult.funeralExpenseTotal || 0,
    taxArrearsTotal: calculationResult.taxArrearsTotal || 0,
    otherDebtTotal: calculationResult.otherDebtTotal || 0,
    totalDeductions: calculationResult.totalDeductions || 0,
    financialDeduction: calculationResult.financialDeduction || 0,
    calculatedTax: Math.round(calculationResult.taxableAmount * (calculationResult.taxRate / 100)) || 0,
    giftTaxCredit: 0,
    reportTaxCredit: 0,
    totalTaxCredit: 0,
    spouseDeductionAmount: calculationResult.spouseDeductionAmount || 0,
  }

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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">부동산</CardTitle>
                <p className="text-sm text-slate-600">주거용, 상업용, 토지 등 부동산 자산을 입력해주세요</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="realEstate" className="text-sm font-medium text-slate-700">
                      주거용 부동산 (단독, 아파트)
                    </Label>
                    <Input
                      id="realEstate"
                      placeholder="예: 80,000"
                      value={formatInputValue(formData.realEstate)}
                      onChange={(e) => handleInputChange("realEstate", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.realEstate))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="businessProperty" className="text-sm font-medium text-slate-700">
                      상업용 부동산 (상가, 오피스)
                    </Label>
                    <Input
                      id="businessProperty"
                      placeholder="예: 50,000"
                      value={formatInputValue(formData.businessProperty)}
                      onChange={(e) => handleInputChange("businessProperty", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.businessProperty))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="land" className="text-sm font-medium text-slate-700">
                      토지 (대지, 전답, 임야 등)
                    </Label>
                    <Input
                      id="land"
                      placeholder="예: 30,000"
                      value={formatInputValue(formData.land)}
                      onChange={(e) => handleInputChange("land", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.land))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="otherRealEstate" className="text-sm font-medium text-slate-700">
                      기타 부동산 (펜션, 창고 등)
                    </Label>
                    <Input
                      id="otherRealEstate"
                      placeholder="예: 10,000"
                      value={formatInputValue(formData.otherRealEstate)}
                      onChange={(e) => handleInputChange("otherRealEstate", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.otherRealEstate))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">금융자산</CardTitle>
                <p className="text-sm text-slate-600">예금, 주식, 펀드 등 금융자산을 입력해주세요</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deposit" className="text-sm font-medium text-slate-700">
                      예금 (단위: 만원)
                    </Label>
                    <Input
                      id="deposit"
                      placeholder="예: 5,000"
                      value={formatInputValue(formData.deposit)}
                      onChange={(e) => handleInputChange("deposit", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.deposit))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="savings" className="text-sm font-medium text-slate-700">
                      적금 (단위: 만원)
                    </Label>
                    <Input
                      id="savings"
                      placeholder="예: 3,000"
                      value={formatInputValue(formData.savings)}
                      onChange={(e) => handleInputChange("savings", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.savings))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="stocks" className="text-sm font-medium text-slate-700">
                      주식 (단위: 만원)
                    </Label>
                    <Input
                      id="stocks"
                      placeholder="예: 2,000"
                      value={formatInputValue(formData.stocks)}
                      onChange={(e) => handleInputChange("stocks", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.stocks))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="funds" className="text-sm font-medium text-slate-700">
                      펀드 (단위: 만원)
                    </Label>
                    <Input
                      id="funds"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.funds)}
                      onChange={(e) => handleInputChange("funds", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.funds))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="bonds" className="text-sm font-medium text-slate-700">
                      채권 (단위: 만원)
                    </Label>
                    <Input
                      id="bonds"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.bonds)}
                      onChange={(e) => handleInputChange("bonds", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.bonds))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="crypto" className="text-sm font-medium text-slate-700">
                      가상화폐 (단위: 만원)
                    </Label>
                    <Input
                      id="crypto"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.crypto)}
                      onChange={(e) => handleInputChange("crypto", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.crypto))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">기타 자산</CardTitle>
                <p className="text-sm text-slate-600">보험, 차량, 귀금속 등 기타 자산을 입력해주세요</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle" className="text-sm font-medium text-slate-700">
                      차량 (단위: 만원)
                    </Label>
                    <Input
                      id="vehicle"
                      placeholder="예: 5,000"
                      value={formatInputValue(formData.vehicle)}
                      onChange={(e) => handleInputChange("vehicle", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.vehicle))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="lifeInsurance" className="text-sm font-medium text-slate-700">
                      생명보험 (단위: 만원)
                    </Label>
                    <Input
                      id="lifeInsurance"
                      placeholder="예: 3,000"
                      value={formatInputValue(formData.lifeInsurance)}
                      onChange={(e) => handleInputChange("lifeInsurance", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.lifeInsurance))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="pensionInsurance" className="text-sm font-medium text-slate-700">
                      연금보험 (단위: 만원)
                    </Label>
                    <Input
                      id="pensionInsurance"
                      placeholder="예: 2,000"
                      value={formatInputValue(formData.pensionInsurance)}
                      onChange={(e) => handleInputChange("pensionInsurance", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.pensionInsurance))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="jewelry" className="text-sm font-medium text-slate-700">
                      귀금속 (단위: 만원)
                    </Label>
                    <Input
                      id="jewelry"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.jewelry)}
                      onChange={(e) => handleInputChange("jewelry", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.jewelry))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="otherAssets" className="text-sm font-medium text-slate-700">
                      기타 자산 (단위: 만원)
                    </Label>
                    <Input
                      id="otherAssets"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.otherAssets)}
                      onChange={(e) => handleInputChange("otherAssets", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.otherAssets))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">증여받은 재산</CardTitle>
                <p className="text-sm text-slate-600">상속개시 전 10년 이내 증여받은 재산을 입력해주세요</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="giftRealEstate" className="text-sm font-medium text-slate-700">
                      증여 부동산 (단위: 만원)
                    </Label>
                    <Input
                      id="giftRealEstate"
                      placeholder="예: 10,000"
                      value={formatInputValue(formData.giftRealEstate)}
                      onChange={(e) => handleInputChange("giftRealEstate", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.giftRealEstate))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="giftOther" className="text-sm font-medium text-slate-700">
                      증여 기타재산 (단위: 만원)
                    </Label>
                    <Input
                      id="giftOther"
                      placeholder="예: 5,000"
                      value={formatInputValue(formData.giftOther)}
                      onChange={(e) => handleInputChange("giftOther", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.giftOther))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">부채</CardTitle>
                <p className="text-sm text-slate-600">대출, 카드빚, 장례비용 등 부채를 입력해주세요</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mortgageLoan" className="text-sm font-medium text-slate-700">
                      주택담보대출 (단위: 만원)
                    </Label>
                    <Input
                      id="mortgageLoan"
                      placeholder="예: 20,000"
                      value={formatInputValue(formData.mortgageLoan)}
                      onChange={(e) => handleInputChange("mortgageLoan", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.mortgageLoan))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="creditLoan" className="text-sm font-medium text-slate-700">
                      신용대출 (단위: 만원)
                    </Label>
                    <Input
                      id="creditLoan"
                      placeholder="예: 5,000"
                      value={formatInputValue(formData.creditLoan)}
                      onChange={(e) => handleInputChange("creditLoan", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.creditLoan))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="cardDebt" className="text-sm font-medium text-slate-700">
                      카드빚 (단위: 만원)
                    </Label>
                    <Input
                      id="cardDebt"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.cardDebt)}
                      onChange={(e) => handleInputChange("cardDebt", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.cardDebt))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="funeralExpense" className="text-sm font-medium text-slate-700">
                      장례비용 (단위: 만원)
                    </Label>
                    <Input
                      id="funeralExpense"
                      placeholder="예: 500"
                      value={formatInputValue(formData.funeralExpense)}
                      onChange={(e) => handleInputChange("funeralExpense", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.funeralExpense))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="taxArrears" className="text-sm font-medium text-slate-700">
                      세금체납액 (단위: 만원)
                    </Label>
                    <Input
                      id="taxArrears"
                      placeholder="예: 200"
                      value={formatInputValue(formData.taxArrears)}
                      onChange={(e) => handleInputChange("taxArrears", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.taxArrears))}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="otherDebt" className="text-sm font-medium text-slate-700">
                      기타 부채 (단위: 만원)
                    </Label>
                    <Input
                      id="otherDebt"
                      placeholder="예: 1,000"
                      value={formatInputValue(formData.otherDebt)}
                      onChange={(e) => handleInputChange("otherDebt", e.target.value)}
                      className="text-left"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {convertWonToKoreanAmount(parseNumber(formData.otherDebt))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">공제 항목</CardTitle>
                <p className="text-sm text-slate-600">해당하는 공제 항목을 선택해주세요</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="basicDeduction"
                    checked={formData.basicDeduction}
                    onCheckedChange={(checked) => handleInputChange("basicDeduction", checked as boolean)}
                  />
                  <Label htmlFor="basicDeduction" className="text-sm font-medium text-slate-700">
                    기초공제 (2억원)
                  </Label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spouseDeduction"
                      checked={formData.spouseDeduction}
                      onCheckedChange={(checked) => handleInputChange("spouseDeduction", checked as boolean)}
                    />
                    <Label htmlFor="spouseDeduction" className="text-sm font-medium text-slate-700">
                      배우자공제 (최소 5억원, 최대 30억원)
                    </Label>
                  </div>

                  {formData.spouseDeduction && (
                    <div className="ml-6 space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="childrenCount" className="text-sm font-medium text-slate-700">
                            자녀 수
                          </Label>
                          <Input
                            id="childrenCount"
                            type="number"
                            placeholder="0"
                            value={formData.childrenCount}
                            onChange={(e) => handleInputChange("childrenCount", e.target.value)}
                            className="text-left"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="parentsCount" className="text-sm font-medium text-slate-700">
                            부모 수
                          </Label>
                          <Input
                            id="parentsCount"
                            type="number"
                            placeholder="0"
                            value={formData.parentsCount}
                            onChange={(e) => handleInputChange("parentsCount", e.target.value)}
                            className="text-left"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="spouseExpectedInheritance" className="text-sm font-medium text-slate-700">
                            배우자 예상 실제 상속재산 (만원)
                          </Label>
                          <Input
                            id="spouseExpectedInheritance"
                            placeholder="예: 10,000"
                            value={formatInputValue(formData.spouseExpectedInheritance)}
                            onChange={(e) => handleInputChange("spouseExpectedInheritance", e.target.value)}
                            className="text-left"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {convertWonToKoreanAmount(parseNumber(formData.spouseExpectedInheritance))}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded">
                        <p className="font-medium mb-1">
                          배우자 공제액: {convertWonToKoreanAmount(calculationResult.spouseDeductionAmount || 0)}
                        </p>
                        <p className="text-xs">• 자녀수가 0인 경우 부모수를 자녀수로 적용합니다</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="housingDeduction"
                    checked={formData.housingDeduction}
                    onCheckedChange={(checked) => handleInputChange("housingDeduction", checked as boolean)}
                  />
                  <Label htmlFor="housingDeduction" className="text-sm font-medium text-slate-700">
                    가업상속공제 (6억원)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">실시간 계산 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-600 mb-2">예상 상속세</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {convertWonToKoreanAmount(calculationResult.finalTax * 10000)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
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
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-slate-600">순 재산가액</span>
                      <span className="font-medium">
                        {convertWonToKoreanAmount(calculationResult.netAssets * 10000)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">총 공제액</span>
                      <span className="font-medium text-green-600">
                        -{convertWonToKoreanAmount(calculationResult.totalDeductions * 10000)}
                      </span>
                    </div>
                    <hr className="my-2" />
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
                        {convertWonToKoreanAmount(
                          Math.round(calculationResult.taxableAmount * (calculationResult.taxRate / 100)) * 10000,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">세액공제</span>
                      <span className="font-medium text-green-600">
                        -
                        {convertWonToKoreanAmount(
                          (Math.round(calculationResult.taxableAmount * (calculationResult.taxRate / 100)) -
                            calculationResult.finalTax) *
                            10000,
                        )}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-600">최종 상속세</span>
                      <span className="text-blue-600">
                        {convertWonToKoreanAmount(calculationResult.finalTax * 10000)}
                      </span>
                    </div>
                  </div>

                  <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full mt-4 text-slate-600 hover:text-slate-900">
                        상세보기
                        {showDetails ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-4 text-xs">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-slate-900 mb-2">자산 상세</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">부동산</span>
                            <span>{convertWonToKoreanAmount(calculationResult.realEstateTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융자산</span>
                            <span>{convertWonToKoreanAmount(calculationResult.financialAssetsTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">보험</span>
                            <span>{convertWonToKoreanAmount(calculationResult.insuranceTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">동산</span>
                            <span>{convertWonToKoreanAmount(calculationResult.movableAssetsTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">증여재산</span>
                            <span>{convertWonToKoreanAmount((calculationResult.giftAssetsTotal || 0) * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">기타자산</span>
                            <span>{convertWonToKoreanAmount(calculationResult.otherAssetsTotal * 10000)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-slate-900 mb-2">부채 상세</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융부채</span>
                            <span>{convertWonToKoreanAmount(calculationResult.financialDebtTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">장례비용</span>
                            <span>{convertWonToKoreanAmount(calculationResult.funeralExpenseTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">세금체납</span>
                            <span>{convertWonToKoreanAmount(calculationResult.taxArrearsTotal * 10000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">기타부채</span>
                            <span>{convertWonToKoreanAmount(calculationResult.otherDebtTotal * 10000)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-slate-900 mb-2">공제 상세</h4>
                        <div className="space-y-1">
                          {formData.basicDeduction && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">기초공제</span>
                              <span>{convertWonToKoreanAmount(200000000)}</span>
                            </div>
                          )}
                          {formData.spouseDeduction && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">배우자공제</span>
                              <span>
                                {convertWonToKoreanAmount((calculationResult.spouseDeductionAmount || 0) * 10000)}
                              </span>
                            </div>
                          )}
                          {formData.housingDeduction && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">가업상속공제</span>
                              <span>{convertWonToKoreanAmount(600000000)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-600">금융재산공제</span>
                            <span>{convertWonToKoreanAmount(calculationResult.financialDeduction * 10000)}</span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Alert className="mt-4 bg-yellow-50 border-yellow-300">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      이 결과는 참고용이며, 실제 상속세는 전문가와 상담하시기 바랍니다.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleCalculate}
                    className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white py-3 text-base font-medium"
                  >
                    상세결과 보기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
        calculationData={consultationCalculationData}
      />

      <Footer />
    </div>
  )
}
