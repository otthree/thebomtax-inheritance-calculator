"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Share2, Copy } from "lucide-react"
import Image from "next/image"
import ConsultationModal from "@/components/consultation-modal"

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
  businessShare: string
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

  useEffect(() => {
    // URL 파라미터에서 데이터 확인
    const sharedData = searchParams.get("data")

    if (sharedData) {
      try {
        // URL에서 공유된 데이터 디코딩
        const decodedData = JSON.parse(decodeURIComponent(sharedData))
        setCalculationData(decodedData)
      } catch (error) {
        console.error("공유된 데이터 파싱 오류:", error)
        router.push("/")
        return
      }
    } else {
      // localStorage에서 계산 데이터 가져오기
      const savedData = localStorage.getItem("inheritanceTaxCalculation")
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setCalculationData(data)
        } catch (error) {
          console.error("데이터 파싱 오류:", error)
          router.push("/")
          return
        }
      } else {
        // 데이터가 없으면 메인 페이지로 리다이렉트
        router.push("/")
        return
      }
    }
    setLoading(false)
  }, [])

  const formatNumber = (num: number) => {
    // 10원 단위까지 반올림
    const rounded = Math.round(num / 10) * 10
    return rounded.toLocaleString("ko-KR")
  }

  const handleFeeCheck = () => {
    window.open("https://blog.naver.com/l77155/223777746014", "_blank")
  }

  const handleBackToCalculator = () => {
    window.location.href = "/"
  }

  const generateShareUrl = () => {
    if (!calculationData) return ""

    const encodedData = encodeURIComponent(JSON.stringify(calculationData))
    return `${window.location.origin}/result?data=${encodedData}`
  }

  const handleCopyLink = async () => {
    if (!calculationData) return

    setIsSharing(true)

    try {
      const shareUrl = generateShareUrl()
      await navigator.clipboard.writeText(shareUrl)

      setShareButtonText("✅ 복사완료!")
      setTimeout(() => {
        setShareButtonText("📤 공유")
        setShowShareOptions(false)
      }, 2000)
    } catch (error) {
      console.error("링크 복사 실패:", error)
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

    const shareUrl = generateShareUrl()
    const shareData = {
      title: "상속세 계산 결과",
      text: `상속세 계산 결과: ${formatNumber(calculationData.calculationResult.finalTax)}원`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // 폴백: 클립보드 복사
        await handleCopyLink()
      }
    } catch (error) {
      console.error("공유 실패:", error)
    }
  }

  // 상담 모달에 전달할 계산 데이터 (모든 상세 정보 포함)
  const consultationCalculationData = calculationData
    ? {
        totalAssets: calculationData.calculationResult.totalAssets,
        totalDebt: calculationData.calculationResult.totalDebt,
        basicDeduction: calculationData.formData.basicDeduction,
        spouseDeduction: calculationData.formData.spouseDeduction,
        housingDeduction: calculationData.formData.housingDeduction,
        financialDeduction: calculationData.calculationResult.financialDeduction,
        finalTax: calculationData.calculationResult.finalTax,
        realEstateTotal: calculationData.calculationResult.realEstateTotal,
        financialAssetsTotal: calculationData.calculationResult.financialAssetsTotal,
        insuranceTotal: calculationData.calculationResult.insuranceTotal,
        businessAssetsTotal: calculationData.calculationResult.businessAssetsTotal,
        movableAssetsTotal: calculationData.calculationResult.movableAssetsTotal,
        otherAssetsTotal: calculationData.calculationResult.otherAssetsTotal,
        financialDebtTotal: calculationData.calculationResult.financialDebtTotal,
        funeralExpenseTotal: calculationData.calculationResult.funeralExpenseTotal,
        taxArrearsTotal: calculationData.calculationResult.taxArrearsTotal,
        otherDebtTotal: calculationData.calculationResult.otherDebtTotal,
        netAssets: calculationData.calculationResult.netAssets,
        totalDeductions: calculationData.calculationResult.totalDeductions,
        taxableAmount: calculationData.calculationResult.taxableAmount,
        taxRate: calculationData.calculationResult.taxRate,
        progressiveDeduction: calculationData.calculationResult.progressiveDeduction,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image src="/logo-deobom.png" alt="세무법인 더봄" width={200} height={60} className="h-10 w-auto" />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="font-medium">02-336-0309</span>
              </div>
              <Button
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-sm font-medium rounded-md"
                onClick={() => setIsConsultationModalOpen(true)}
              >
                전문가 상담
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

      {/* Sub Header */}
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

      {/* 결과 페이지 */}
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

        {/* 최종 상속세 결과 */}
        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <p className="text-lg text-slate-600 mb-2">최종 상속세</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {formatNumber(calculationData.calculationResult.finalTax)}원
            </p>
            <p className="text-sm text-slate-500">
              과세표준 {formatNumber(calculationData.calculationResult.taxableAmount)}원 ×{" "}
              {calculationData.calculationResult.taxRate}% - 누진공제{" "}
              {formatNumber(calculationData.calculationResult.progressiveDeduction)}원
            </p>
          </CardContent>
        </Card>

        {/* 상속세 계산 과정 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">상속세 계산 과정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">총 재산가액</span>
                <span className="font-medium">{formatNumber(calculationData.calculationResult.totalAssets)}원</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">총 공제액</span>
                <span className="font-medium text-green-600">
                  -{formatNumber(calculationData.calculationResult.totalDeductions)}원
                </span>
              </div>
              <hr />
              <div className="flex justify-between py-2">
                <span className="text-slate-600">과세표준</span>
                <span className="font-medium">{formatNumber(calculationData.calculationResult.taxableAmount)}원</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">적용 세율</span>
                <span className="font-medium">{calculationData.calculationResult.taxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">누진공제</span>
                <span className="font-medium text-green-600">
                  -{formatNumber(calculationData.calculationResult.progressiveDeduction)}원
                </span>
              </div>
              <hr />
              <div className="flex justify-between py-2 font-bold text-lg">
                <span className="text-slate-600">최종 상속세</span>
                <span className="text-blue-600">{formatNumber(calculationData.calculationResult.finalTax)}원</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2"
            onClick={() => setIsConsultationModalOpen(true)}
          >
            💬 전문가상담
          </Button>

          {/* 공유 버튼 그룹 */}
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

            {/* 공유 옵션 드롭다운 */}
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
                  <p className="text-xs text-gray-500">현재 도메인: {window.location.hostname}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 공유 안내 */}
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

        {/* 수수료 안내 섹션 */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">상속세 수수료가 궁금하신가요?</h3>
            <p className="text-sm text-slate-600 mb-4">세무법인 더봄은 수수료를 투명하게 공개합니다.</p>
            <Button onClick={handleFeeCheck} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              💰 수수료 확인하러가기
            </Button>
          </CardContent>
        </Card>

        {/* 주의사항 */}
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

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 세무법인 더봄. 이 계산기는 참고용이며, 실제 상속세는 전문가와 상담하시기 바랍니다.
          </p>
        </div>
      </footer>

      {/* 상담 모달 */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={consultationCalculationData}
      />
    </div>
  )
}
