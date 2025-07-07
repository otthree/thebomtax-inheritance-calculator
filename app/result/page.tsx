"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  Share2,
  Copy,
  ArrowLeft,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ConsultationModal from "@/components/consultation-modal"
import { Footer } from "@/components/footer"

interface CalculationData {
  totalAssets: number
  totalDebt: number
  netAssets: number
  taxableAmount: number
  taxRate: number
  progressiveDeduction: number
  finalTax: number
  basicDeduction: boolean
  spouseDeduction: boolean
  housingDeduction: boolean
  realEstateTotal: number
  financialAssetsTotal: number
  giftAssetsTotal: number
  otherAssetsTotal: number
  financialDebtTotal: number
  funeralExpenseTotal: number
  taxArrearsTotal: number
  otherDebtTotal: number
  totalDeductions: number
  financialDeduction: number
  calculatedTax: number
  giftTaxCredit: number
  reportTaxCredit: number
  totalTaxCredit: number
  spouseDeductionAmount: number
}

export default function ResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [shareMessage, setShareMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadCalculationData = async () => {
      try {
        setIsLoading(true)
        setError("")

        // 단축 URL (s 파라미터) 확인
        const shortId = searchParams.get("s")
        if (shortId) {
          console.log("단축 URL로 접속:", shortId)

          const response = await fetch(`/api/share?id=${shortId}`)
          const result = await response.json()

          if (result.success && result.data) {
            setCalculationData(result.data)
            console.log("단축 URL 데이터 로드 성공")
            return
          } else {
            throw new Error(result.error || "단축 URL 데이터를 찾을 수 없습니다.")
          }
        }

        // 기존 방식 (data 파라미터) 확인
        const dataParam = searchParams.get("data")
        if (dataParam) {
          console.log("기존 URL로 접속")
          const decodedData = JSON.parse(decodeURIComponent(dataParam))
          setCalculationData(decodedData)
          return
        }

        // 파라미터가 없는 경우
        throw new Error("계산 데이터가 없습니다. 다시 계산해주세요.")
      } catch (err) {
        console.error("데이터 로드 오류:", err)
        setError(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCalculationData()
  }, [searchParams])

  const formatNumber = (num: number): string => {
    if (num === 0) return "0만원"
    const inTenThousands = Math.round(num / 10000)
    return `${inTenThousands.toLocaleString()}만원`
  }

  const generateShareUrl = async (): Promise<string> => {
    if (!calculationData) return window.location.href

    try {
      // 단축 URL 생성 시도
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculationData),
      })

      const result = await response.json()

      if (result.success && result.shortId) {
        const baseUrl = window.location.origin + window.location.pathname
        return `${baseUrl}?s=${result.shortId}`
      }
    } catch (error) {
      console.warn("단축 URL 생성 실패, 기존 방식 사용:", error)
    }

    // 폴백: 기존 긴 URL 방식
    const dataParam = encodeURIComponent(JSON.stringify(calculationData))
    return `${window.location.origin}${window.location.pathname}?data=${dataParam}`
  }

  const handleCopyLink = async () => {
    try {
      setShareStatus("loading")
      setShareMessage("링크 생성 중...")

      const shareUrl = await generateShareUrl()
      await navigator.clipboard.writeText(shareUrl)

      setShareStatus("success")
      setShareMessage("링크가 복사되었습니다!")

      setTimeout(() => {
        setShareStatus("idle")
        setShareMessage("")
      }, 3000)
    } catch (error) {
      console.error("링크 복사 실패:", error)
      setShareStatus("error")
      setShareMessage("링크 복사에 실패했습니다.")

      setTimeout(() => {
        setShareStatus("idle")
        setShareMessage("")
      }, 3000)
    }
  }

  const handleWebShare = async () => {
    if (!navigator.share) {
      handleCopyLink()
      return
    }

    try {
      setShareStatus("loading")
      setShareMessage("공유 준비 중...")

      const shareUrl = await generateShareUrl()

      await navigator.share({
        title: "상속세 계산 결과",
        text: `상속세 계산 결과: ${formatNumber(calculationData?.finalTax || 0)}`,
        url: shareUrl,
      })

      setShareStatus("success")
      setShareMessage("공유가 완료되었습니다!")

      setTimeout(() => {
        setShareStatus("idle")
        setShareMessage("")
      }, 3000)
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("웹 공유 실패:", error)
        setShareStatus("error")
        setShareMessage("공유에 실패했습니다.")

        setTimeout(() => {
          setShareStatus("idle")
          setShareMessage("")
        }, 3000)
      } else {
        setShareStatus("idle")
        setShareMessage("")
      }
    }
  }

  const handleBackToCalculator = () => {
    router.push("/")
  }

  const handleGoToWebsite = () => {
    window.open("https://thebomtax.com", "_blank")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">데이터를 찾을 수 없습니다</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={handleBackToCalculator} className="bg-slate-700 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              다시 계산하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!calculationData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span className="font-medium">02-336-0309</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Result Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">상속세 계산 결과</h1>
          <p className="text-slate-600">아래 결과는 추정치이며, 정확한 세액은 전문가 상담을 받아보세요.</p>
        </div>

        {/* Main Result Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Calculator className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-semibold mb-2">최종 상속세</h2>
            </div>
            <div className="text-5xl font-bold mb-4">{formatNumber(calculationData.finalTax)}</div>
            <p className="text-blue-100 text-lg">
              세율: {calculationData.taxRate}% | 과세표준: {formatNumber(calculationData.taxableAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => setIsConsultationModalOpen(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white py-6 text-lg font-medium"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            전문가 상담 신청
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="py-6 text-lg font-medium bg-white"
            size="lg"
            disabled={shareStatus === "loading"}
          >
            {shareStatus === "loading" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Copy className="w-5 h-5 mr-2" />
            )}
            링크 복사
          </Button>

          <Button
            onClick={handleWebShare}
            variant="outline"
            className="py-6 text-lg font-medium bg-white"
            size="lg"
            disabled={shareStatus === "loading"}
          >
            {shareStatus === "loading" ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5 mr-2" />
            )}
            공유하기
          </Button>
        </div>

        {/* Share Status Message */}
        {shareMessage && (
          <Alert
            className={`mb-6 ${
              shareStatus === "success"
                ? "bg-green-50 border-green-200"
                : shareStatus === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-blue-50 border-blue-200"
            }`}
          >
            {shareStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {shareStatus === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
            {shareStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            <AlertDescription
              className={
                shareStatus === "success"
                  ? "text-green-800"
                  : shareStatus === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }
            >
              {shareMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 재산 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">재산 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">부동산</span>
                  <span className="font-medium">{formatNumber(calculationData.realEstateTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">금융자산</span>
                  <span className="font-medium">{formatNumber(calculationData.financialAssetsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">증여재산</span>
                  <span className="font-medium">{formatNumber(calculationData.giftAssetsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">기타재산</span>
                  <span className="font-medium">{formatNumber(calculationData.otherAssetsTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>총 재산가액</span>
                  <span className="text-blue-600">{formatNumber(calculationData.totalAssets)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 부채 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">부채 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">금융부채</span>
                  <span className="font-medium">{formatNumber(calculationData.financialDebtTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">장례비용</span>
                  <span className="font-medium">{formatNumber(calculationData.funeralExpenseTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">세금체납액</span>
                  <span className="font-medium">{formatNumber(calculationData.taxArrearsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">기타부채</span>
                  <span className="font-medium">{formatNumber(calculationData.otherDebtTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>총 부채</span>
                  <span className="text-red-600">{formatNumber(calculationData.totalDebt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 세액 계산 과정 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">세액 계산 과정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 재산가액</span>
                    <span className="font-medium">{formatNumber(calculationData.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 부채</span>
                    <span className="font-medium text-red-600">-{formatNumber(calculationData.totalDebt)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>상속재산가액</span>
                    <span>{formatNumber(calculationData.netAssets)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">상속재산가액</span>
                    <span className="font-medium">{formatNumber(calculationData.netAssets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">인적공제</span>
                    <span className="font-medium text-red-600">-{formatNumber(calculationData.totalDeductions)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>과세표준</span>
                    <span>{formatNumber(calculationData.taxableAmount)}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">산출세액</span>
                    <span className="font-medium">{formatNumber(calculationData.calculatedTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">세액공제</span>
                    <span className="font-medium text-red-600">-{formatNumber(calculationData.totalTaxCredit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>최종 상속세</span>
                    <span className="text-blue-600">{formatNumber(calculationData.finalTax)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 mb-2">적용된 공제</h4>
                  <div className="space-y-2">
                    {calculationData.basicDeduction && (
                      <Badge variant="secondary" className="mr-2 mb-1">
                        기초공제
                      </Badge>
                    )}
                    {calculationData.spouseDeduction && (
                      <Badge variant="secondary" className="mr-2 mb-1">
                        배우자공제
                      </Badge>
                    )}
                    {calculationData.housingDeduction && (
                      <Badge variant="secondary" className="mr-2 mb-1">
                        주택공제
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleBackToCalculator} variant="outline" className="bg-white hover:bg-slate-50" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            다시 계산하기
          </Button>
          <Button onClick={handleGoToWebsite} variant="outline" className="bg-white hover:bg-slate-50" size="lg">
            <ExternalLink className="w-4 h-4 mr-2" />
            세무법인 더봄 바로가기
          </Button>
        </div>
      </div>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={calculationData}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}
