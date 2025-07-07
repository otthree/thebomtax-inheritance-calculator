"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Share2, Copy, Phone } from "lucide-react"
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

interface CalculationData {
  formData: FormData
  calculationResult: CalculationResult
  timestamp: string
}

export default function ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [shareButtonText, setShareButtonText] = useState("📤 공유")
  const [isSharing, setIsSharing] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  // URL 파라미터에서 data 값 또는 share ID 가져오기
  const dataParam = searchParams.get("data")
  const shareId = searchParams.get("s")

  useEffect(() => {
    const loadCalculationData = async () => {
      // 1. 먼저 단축 URL ID 확인 (새로운 공유 방식)
      if (shareId) {
        try {
          const response = await fetch(`/api/share?id=${shareId}`)
          if (response.ok) {
            const result = await response.json()
            console.log("단축 URL에서 데이터 로드:", result.data)
            setCalculationData(result.data)
            setLoading(false)
            return
          } else {
            console.error("단축 URL 데이터 로드 실패:", response.status)
          }
        } catch (error) {
          console.error("단축 URL 데이터 로드 오류:", error)
        }
      }

      // 2. URL 파라미터 확인 (기존 공유 방식)
      if (dataParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(dataParam))
          console.log("URL 파라미터에서 데이터 로드:", decoded)
          setCalculationData(decoded)
          setLoading(false)
          return
        } catch (error) {
          console.error("URL 파라미터 데이터 파싱 실패:", error)
        }
      }

      // 3. localStorage에서 데이터 확인 (일반적인 계산 결과의 경우)
      try {
        const saved = localStorage.getItem("inheritanceTaxCalculation")
        if (saved) {
          const parsed = JSON.parse(saved)
          console.log("localStorage에서 데이터 로드:", parsed)
          setCalculationData(parsed)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("localStorage 데이터 파싱 실패:", error)
      }

      // 4. 데이터가 없으면 홈으로 리다이렉트
      console.log("계산 데이터를 찾을 수 없음, 홈으로 리다이렉트")
      router.replace("/")
    }

    loadCalculationData()
  }, [dataParam, shareId, router])

  const convertWonToKoreanAmount = (amount: number): string => {
    amount = amount / 10000
    if (amount === 0) return "0원"

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
    return `${amount < 0 ? "-" : ""}${koreanAmount}원`
  }

  const handleFeeCheck = () => {
    window.open("https://blog.naver.com/l77155/223777746014", "_blank")
  }

  const handleBackToCalculator = () => {
    window.location.href = "/"
  }

  const generateShareUrl = async () => {
    if (!calculationData) return ""

    try {
      // 단축 URL 생성
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculationData),
      })

      if (response.ok) {
        const result = await response.json()
        return `${window.location.origin}/result?s=${result.shortId}`
      } else {
        // 실패 시 기존 방식으로 폴백
        const encodedData = encodeURIComponent(JSON.stringify(calculationData))
        return `${window.location.origin}/result?data=${encodedData}`
      }
    } catch (error) {
      console.error("단축 URL 생성 실패:", error)
      // 실패 시 기존 방식으로 폴백
      const encodedData = encodeURIComponent(JSON.stringify(calculationData))
      return `${window.location.origin}/result?data=${encodedData}`
    }
  }

  const handleCopyLink = async () => {
    if (!calculationData) return

    setIsSharing(true)

    try {
      const shareUrl = await generateShareUrl()
      await navigator.clipboard.writeText(shareUrl)

      setShareButtonText("✅ 복사완료!")
      setTimeout(() => {
        setShareButtonText("📤 공유")
        setShowShareOptions(false)
      }, 2000)
    } catch (error) {
      alert("링크 복사에 실패했습니다.")
    } finally {
      setIsSharing(false)
    }
  }

  const handleShare = () => {
    setShowShareOptions(!showShareOptions)
  }

  const handleWebShare = async () => {
    if (!calculationData) return

    const shareUrl = await generateShareUrl()
    const shareData = {
      title: "상속세 계산 결과",
      text: `상속세 계산 결과: ${convertWonToKoreanAmount(calculationData.calculationResult.finalTax * 10000)}`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await handleCopyLink()
      }
    } catch (error) {
      // 공유 실패 시 무시
    }
  }

  const consultationCalculationData = calculationData
    ? {
        totalAssets: calculationData.calculationResult.totalAssets || 0,
        totalDebt: calculationData.calculationResult.totalDebt || 0,
        netAssets: calculationData.calculationResult.netAssets || 0,
        taxableAmount: calculationData.calculationResult.taxableAmount || 0,
        taxRate: calculationData.calculationResult.taxRate || 0,
        progressiveDeduction: calculationData.calculationResult.progressiveDeduction || 0,
        finalTax: calculationData.calculationResult.finalTax || 0,
        basicDeduction: calculationData.formData.basicDeduction || false,
        spouseDeduction: calculationData.formData.spouseDeduction || false,
        housingDeduction: calculationData.formData.housingDeduction || false,
        realEstateTotal: calculationData.calculationResult.realEstateTotal || 0,
        financialAssetsTotal: calculationData.calculationResult.financialAssetsTotal || 0,
        giftAssetsTotal: calculationData.calculationResult.giftAssetsTotal || 0,
        otherAssetsTotal: calculationData.calculationResult.otherAssetsTotal || 0,
        financialDebtTotal: calculationData.calculationResult.financialDebtTotal || 0,
        funeralExpenseTotal: calculationData.calculationResult.funeralExpenseTotal || 0,
        taxArrearsTotal: calculationData.calculationResult.taxArrearsTotal || 0,
        otherDebtTotal: calculationData.calculationResult.otherDebtTotal || 0,
        totalDeductions: calculationData.calculationResult.totalDeductions || 0,
        financialDeduction: calculationData.calculationResult.financialDeduction || 0,
        calculatedTax: calculationData.calculationResult.calculatedTax || 0,
        giftTaxCredit: calculationData.calculationResult.giftTaxCredit || 0,
        reportTaxCredit: calculationData.calculationResult.reportTaxCredit || 0,
        totalTaxCredit: calculationData.calculationResult.totalTaxCredit || 0,
        spouseDeductionAmount: calculationData.calculationResult.spouseDeductionAmount || 0,
      }
    : undefined

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!calculationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">계산 데이터를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            계산기로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const { calculationResult } = calculationData

  // 산출세액 계산 (과세표준 × 세율)
  const calculatedTax = Math.round(calculationResult.taxableAmount * (calculationResult.taxRate / 100))

  // 세액공제 계산 (산출세액 - 최종상속세)
  const taxCredit = calculatedTax - calculationResult.finalTax

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
                상담신청
              </Button>
            </div>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">상속세 계산 결과</h1>
          <Button
            onClick={handleBackToCalculator}
            variant="outline"
            className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600"
          >
            다시 계산하기
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <p className="text-lg text-slate-600 mb-2">최종 상속세</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {convertWonToKoreanAmount(calculationData.calculationResult.finalTax * 10000)}
            </p>
            <p className="text-sm text-slate-500">
              과세표준 {convertWonToKoreanAmount(calculationData.calculationResult.taxableAmount * 10000)} ×{" "}
              {calculationData.calculationResult.taxRate}% - 누진공제{" "}
              {convertWonToKoreanAmount(calculationData.calculationResult.progressiveDeduction * 10000)}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">상속세 계산 과정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">순 재산가액</span>
                <span className="font-medium">
                  {convertWonToKoreanAmount(calculationData.calculationResult.netAssets * 10000)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">총 공제액</span>
                <span className="font-medium text-green-600">
                  -{convertWonToKoreanAmount(calculationData.calculationResult.totalDeductions * 10000)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between py-2">
                <span className="text-slate-600">과세표준</span>
                <span className="font-medium">
                  {convertWonToKoreanAmount(calculationData.calculationResult.taxableAmount * 10000)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">적용 세율</span>
                <span className="font-medium">{calculationData.calculationResult.taxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">산출세액</span>
                <span className="font-medium">{convertWonToKoreanAmount(calculatedTax * 10000)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">세액공제</span>
                <span className="font-medium text-green-600">-{convertWonToKoreanAmount(taxCredit * 10000)}</span>
              </div>
              <hr />
              <div className="flex justify-between py-2 font-bold text-lg">
                <span className="text-slate-600">최종 상속세</span>
                <span className="text-blue-600">
                  {convertWonToKoreanAmount(calculationData.calculationResult.finalTax * 10000)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2"
            onClick={() => setIsConsultationModalOpen(true)}
          >
            상담신청 하기
          </Button>

          <div className="relative">
            <Button
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  생성중...
                </>
              ) : (
                shareButtonText
              )}
            </Button>

            {showShareOptions && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-50"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    링크 복사
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-50"
                    onClick={handleWebShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </Button>
                </div>
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{shareId ? "단축 URL로 공유됨" : "일반 URL로 공유됨"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {shareId && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <Share2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🔗 단축 URL로 공유됨</strong>
              <br />이 페이지는 단축 URL을 통해 공유된 계산 결과입니다. (24시간 유효)
            </AlertDescription>
          </Alert>
        )}

        {searchParams.get("data") && (
          <Alert className="mb-8 bg-blue-50 border-blue-200">
            <Share2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>📤 공유된 계산 결과</strong>
              <br />이 페이지는 다른 사용자가 공유한 상속세 계산 결과입니다. 본인의 계산을 원하시면 "다시 계산하기"를
              클릭해주세요.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">상속세 수수료가 궁금하신가요?</h3>
            <p className="text-sm text-slate-600 mb-4">세무법인 더봄은 수수료를 투명하게 공개합니다.</p>
            <Button onClick={handleFeeCheck} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              💰 수수료 확인하러가기
            </Button>
          </CardContent>
        </Card>

        <Alert className="bg-yellow-50 border-yellow-300 mb-8">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-2">⚠️ 주의사항</div>
            <ul className="text-sm space-y-1">
              <li>• 이 결과는 참고용이며, 실제 상속세는 세무사와 상담하시기 바랍니다.</li>
              <li>• 증여 합산, 특수관계인 공제 등 추가적인 요소가 있을 수 있습니다.</li>
              <li>• 세법 개정에 따라 계산 기준이 변경될 수 있습니다.</li>
            </ul>
          </AlertDescription>
        </Alert>
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
