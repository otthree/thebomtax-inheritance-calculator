"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  Share2,
  MessageCircle,
  ArrowLeft,
  Info,
  TrendingUp,
  PieChart,
  FileText,
  Phone,
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the data parameter from URL
  const dataParam = searchParams.get("data")

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam))
        setCalculationData(decodedData)
        setError(null)
      } catch (err) {
        console.error("Failed to parse calculation data:", err)
        setError("계산 데이터를 불러오는데 실패했습니다.")
      }
    } else {
      setError("계산 데이터가 없습니다.")
    }
    setIsLoading(false)
  }, [dataParam])

  const formatNumber = (num: number): string => {
    if (num === 0) return "0만원"
    const inTenThousands = Math.round(num / 10000)
    return `${inTenThousands.toLocaleString()}만원`
  }

  const formatNumberForShare = (num: number): string => {
    if (num === 0) return "0만원"
    const inTenThousands = Math.round(num / 10000)
    return `${inTenThousands.toLocaleString()}만원`
  }

  const shareText = useMemo(() => {
    if (!calculationData) return ""

    return `🏠 상속세 계산 결과

📊 상속재산 총액: ${formatNumberForShare(calculationData.totalAssets)}
💰 상속세 예상액: ${formatNumberForShare(calculationData.finalTax)}

💡 정확한 상속세 계산과 절세 방안은 전문가와 상담하세요!

🔗 상속세 계산기: ${typeof window !== "undefined" ? window.location.origin : ""}`
  }, [calculationData])

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator.share) {
        await navigator.share({
          title: "상속세 계산 결과",
          text: shareText,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`)
        alert("링크가 클립보드에 복사되었습니다!")
      }
    } catch (err) {
      console.error("Share failed:", err)
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`)
        alert("링크가 클립보드에 복사되었습니다!")
      } catch (clipboardErr) {
        alert("공유에 실패했습니다. 브라우저가 공유 기능을 지원하지 않습니다.")
      }
    }
  }

  const handleBackToCalculator = () => {
    router.push("/")
  }

  const handleConsultation = () => {
    setIsConsultationModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !calculationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Info className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={handleBackToCalculator} className="bg-slate-700 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              계산기로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
        {/* Result Summary */}
        <Card className="mb-8 bg-white shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Calculator className="w-6 h-6 mr-2" />
              상속세 계산 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-slate-600">상속재산 총액</span>
                  <span className="font-semibold text-lg">{formatNumber(calculationData.totalAssets)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-slate-600">부채 총액</span>
                  <span className="font-semibold text-lg text-red-600">-{formatNumber(calculationData.totalDebt)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-slate-600">순상속재산</span>
                  <span className="font-semibold text-lg">{formatNumber(calculationData.netAssets)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-slate-600">과세표준</span>
                  <span className="font-semibold text-lg">{formatNumber(calculationData.taxableAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-slate-600">세율</span>
                  <span className="font-semibold text-lg">{calculationData.taxRate}%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-slate-600 font-medium">상속세 예상액</span>
                  <span className="font-bold text-2xl text-blue-600">{formatNumber(calculationData.finalTax)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={handleConsultation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                전문가 상담 신청
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-base font-medium bg-transparent"
                size="lg"
              >
                <Share2 className="w-4 h-4 mr-2" />
                결과 공유하기
              </Button>
              <Button
                onClick={handleBackToCalculator}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-base font-medium bg-transparent"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                다시 계산하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="details" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              상세보기
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center">
              <PieChart className="w-4 h-4 mr-2" />
              구성비
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              절세 팁
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets Breakdown */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <CardTitle className="text-lg text-green-800">상속재산 상세</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {calculationData.realEstateTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">부동산</span>
                      <span className="font-medium">{formatNumber(calculationData.realEstateTotal)}</span>
                    </div>
                  )}
                  {calculationData.financialAssetsTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">금융재산</span>
                      <span className="font-medium">{formatNumber(calculationData.financialAssetsTotal)}</span>
                    </div>
                  )}
                  {calculationData.giftAssetsTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">증여재산</span>
                      <span className="font-medium">{formatNumber(calculationData.giftAssetsTotal)}</span>
                    </div>
                  )}
                  {calculationData.otherAssetsTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">기타재산</span>
                      <span className="font-medium">{formatNumber(calculationData.otherAssetsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200">
                    <span className="font-semibold text-slate-800">총 상속재산</span>
                    <span className="font-bold text-green-600">{formatNumber(calculationData.totalAssets)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Debts Breakdown */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-red-50 border-b border-red-100">
                  <CardTitle className="text-lg text-red-800">부채 상세</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {calculationData.financialDebtTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">금융부채</span>
                      <span className="font-medium">{formatNumber(calculationData.financialDebtTotal)}</span>
                    </div>
                  )}
                  {calculationData.funeralExpenseTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">장례비용</span>
                      <span className="font-medium">{formatNumber(calculationData.funeralExpenseTotal)}</span>
                    </div>
                  )}
                  {calculationData.taxArrearsTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">세금체납액</span>
                      <span className="font-medium">{formatNumber(calculationData.taxArrearsTotal)}</span>
                    </div>
                  )}
                  {calculationData.otherDebtTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">기타부채</span>
                      <span className="font-medium">{formatNumber(calculationData.otherDebtTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200">
                    <span className="font-semibold text-slate-800">총 부채</span>
                    <span className="font-bold text-red-600">{formatNumber(calculationData.totalDebt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="text-lg text-blue-800">공제 내역</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {calculationData.basicDeduction && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">기초공제</span>
                      <Badge variant="secondary">적용</Badge>
                    </div>
                  )}
                  {calculationData.spouseDeduction && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">배우자공제</span>
                      <div className="text-right">
                        <Badge variant="secondary">적용</Badge>
                        <div className="text-sm text-slate-500 mt-1">
                          {formatNumber(calculationData.spouseDeductionAmount)}
                        </div>
                      </div>
                    </div>
                  )}
                  {calculationData.housingDeduction && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">주택공제</span>
                      <Badge variant="secondary">적용</Badge>
                    </div>
                  )}
                  {calculationData.financialDeduction > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">금융재산공제</span>
                      <span className="font-medium">{formatNumber(calculationData.financialDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200">
                    <span className="font-semibold text-slate-800">총 공제액</span>
                    <span className="font-bold text-blue-600">{formatNumber(calculationData.totalDeductions)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Calculation */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-purple-50 border-b border-purple-100">
                  <CardTitle className="text-lg text-purple-800">세액 계산</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-slate-600">산출세액</span>
                    <span className="font-medium">{formatNumber(calculationData.calculatedTax)}</span>
                  </div>
                  {calculationData.giftTaxCredit > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">증여세액공제</span>
                      <span className="font-medium text-green-600">-{formatNumber(calculationData.giftTaxCredit)}</span>
                    </div>
                  )}
                  {calculationData.reportTaxCredit > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-slate-600">신고세액공제</span>
                      <span className="font-medium text-green-600">
                        -{formatNumber(calculationData.reportTaxCredit)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200">
                    <span className="font-semibold text-slate-800">최종 상속세</span>
                    <span className="font-bold text-2xl text-purple-600">{formatNumber(calculationData.finalTax)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">재산 구성비</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Assets Composition */}
                  <div>
                    <h3 className="font-semibold mb-4 text-slate-800">상속재산 구성</h3>
                    <div className="space-y-3">
                      {calculationData.realEstateTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                            <span>부동산</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(calculationData.realEstateTotal)}</div>
                            <div className="text-sm text-slate-500">
                              {((calculationData.realEstateTotal / calculationData.totalAssets) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                      {calculationData.financialAssetsTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                            <span>금융재산</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(calculationData.financialAssetsTotal)}</div>
                            <div className="text-sm text-slate-500">
                              {((calculationData.financialAssetsTotal / calculationData.totalAssets) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                      {calculationData.giftAssetsTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                            <span>증여재산</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(calculationData.giftAssetsTotal)}</div>
                            <div className="text-sm text-slate-500">
                              {((calculationData.giftAssetsTotal / calculationData.totalAssets) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                      {calculationData.otherAssetsTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                            <span>기타재산</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(calculationData.otherAssetsTotal)}</div>
                            <div className="text-sm text-slate-500">
                              {((calculationData.otherAssetsTotal / calculationData.totalAssets) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Tax Rate Information */}
                  <div>
                    <h3 className="font-semibold mb-4 text-slate-800">세율 정보</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>적용 세율</span>
                        <span className="font-bold text-lg">{calculationData.taxRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>누진공제액</span>
                        <span className="font-medium">{formatNumber(calculationData.progressiveDeduction)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <CardTitle className="text-lg">절세 방안</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium mb-1">생전증여 활용</h4>
                        <p className="text-sm text-slate-600">
                          연간 증여한도를 활용하여 미리 재산을 이전하면 상속세를 절약할 수 있습니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium mb-1">공제 항목 최대 활용</h4>
                        <p className="text-sm text-slate-600">
                          배우자공제, 자녀공제 등 각종 공제 항목을 최대한 활용하세요.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium mb-1">부채 정리</h4>
                        <p className="text-sm text-slate-600">
                          상속재산에서 공제되는 부채를 정확히 파악하고 정리하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="text-lg">주의사항</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium mb-1">신고 기한 준수</h4>
                        <p className="text-sm text-slate-600">상속개시일로부터 6개월 이내에 신고해야 합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium mb-1">정확한 재산 평가</h4>
                        <p className="text-sm text-slate-600">부동산, 주식 등의 정확한 평가가 중요합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium mb-1">전문가 상담</h4>
                        <p className="text-sm text-slate-600">복잡한 상속 상황에서는 반드시 전문가와 상담하세요.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">정확한 상속세 계산이 필요하신가요?</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              이 계산기는 간단한 추정치를 제공합니다. 정확한 상속세 계산과 절세 방안을 위해서는 전문 세무사와의 상담이
              필요합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleConsultation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                무료 상담 신청
              </Button>
              <Button
                onClick={() => window.open("https://thebomtax.com", "_blank")}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-base font-medium bg-transparent"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                세무법인 더봄 바로가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={calculationData}
      />
    </div>
  )
}
