"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  FileText,
  Share2,
  Download,
  AlertTriangle,
  Phone,
  ArrowLeft,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"

interface CalculationData {
  formData: any
  calculationResult: any
  timestamp: string
}

export default function ResultPage() {
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem("inheritanceTaxCalculation")
    if (data) {
      try {
        const parsedData = JSON.parse(data)
        setCalculationData(parsedData)
      } catch (error) {
        console.error("Failed to parse calculation data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const formatNumber = (num: number) => {
    const rounded = Math.round(num / 10000)
    return rounded.toLocaleString("ko-KR")
  }

  const handleShare = async () => {
    if (!calculationData) return

    const shareText = `상속세 계산 결과
최종 상속세: ${formatNumber(calculationData.calculationResult.finalTax)}만원
과세표준: ${formatNumber(calculationData.calculationResult.taxableAmount)}만원
총 재산가액: ${formatNumber(calculationData.calculationResult.totalAssets)}만원

세무법인 더봄 상속세 계산기로 계산했습니다.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "상속세 계산 결과",
          text: shareText,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareText).then(() => {
        alert("계산 결과가 클립보드에 복사되었습니다.")
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!calculationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">계산 결과를 찾을 수 없습니다</h2>
          <p className="text-slate-600 mb-6">다시 계산해주세요.</p>
          <Link href="/">
            <Button className="bg-slate-800 hover:bg-slate-900 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              계산기로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { calculationResult } = calculationData

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
              <Button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 text-base font-medium rounded-md">
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

      <div className="bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">상속세 계산 결과</h2>
              <p className="text-sm text-slate-600">2025년 기준 · 전문 세무사 검증 · 정확한 계산</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="hidden sm:flex bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                공유하기
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                인쇄하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 최종 결과 카드 */}
            <Card className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Calculator className="w-6 h-6 mr-3" />
                  상속세 계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-lg mb-2 opacity-90">최종 상속세</p>
                  <p className="text-5xl font-bold mb-4">{formatNumber(calculationResult.finalTax)}만원</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="opacity-75">과세표준</p>
                      <p className="text-xl font-semibold">{formatNumber(calculationResult.taxableAmount)}만원</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="opacity-75">적용 세율</p>
                      <p className="text-xl font-semibold">{calculationResult.taxRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 계산 과정 상세 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  계산 과정 상세
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1단계: 총 재산가액 */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-700 mb-3">1단계: 총 재산가액 계산</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">부동산:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.realEstateTotal)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">금융자산:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.financialAssetsTotal)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">사전증여자산:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.giftAssetsTotal)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">기타자산:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.otherAssetsTotal)}만원</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                      <span className="text-slate-600">총 재산가액:</span>
                      <span className="text-blue-700">{formatNumber(calculationResult.totalAssets)}만원</span>
                    </div>
                  </div>
                </div>

                {/* 2단계: 총 채무 */}
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                  <h4 className="font-medium text-red-700 mb-3">2단계: 총 채무 계산</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">장례비:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.funeralExpenseTotal)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">금융채무:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.financialDebtTotal)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">세금미납:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.taxArrearsTotal)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">기타채무:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.otherDebtTotal)}만원</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                      <span className="text-slate-600">총 채무:</span>
                      <span className="text-red-700">{formatNumber(calculationResult.totalDebt)}만원</span>
                    </div>
                  </div>
                </div>

                {/* 3단계: 순 재산가액 */}
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-medium text-green-700 mb-3">3단계: 순 재산가액 계산</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">총 재산가액 - 총 채무:</span>
                      <span className="text-green-700">{formatNumber(calculationResult.netAssets)}만원</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatNumber(calculationResult.totalAssets)} - {formatNumber(calculationResult.totalDebt)} ={" "}
                      {formatNumber(calculationResult.netAssets)}
                    </div>
                  </div>
                </div>

                {/* 4단계: 공제 계산 */}
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-700 mb-3">4단계: 공제 계산</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">금융자산 상속공제:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.financialDeduction)}만원</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                      <span className="text-slate-600">총 공제액:</span>
                      <span className="text-purple-700">{formatNumber(calculationResult.totalDeductions)}만원</span>
                    </div>
                  </div>
                </div>

                {/* 5단계: 과세표준 */}
                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <h4 className="font-medium text-orange-700 mb-3">5단계: 과세표준 계산</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">순 재산가액 - 총 공제액:</span>
                      <span className="text-orange-700">{formatNumber(calculationResult.taxableAmount)}만원</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatNumber(calculationResult.netAssets)} - {formatNumber(calculationResult.totalDeductions)} ={" "}
                      {formatNumber(calculationResult.taxableAmount)}
                    </div>
                  </div>
                </div>

                {/* 6단계: 세율 적용 */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-700 mb-3">6단계: 세율 적용</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">과세표준:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.taxableAmount)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">적용 세율:</span>
                      <span className="text-slate-900">{calculationResult.taxRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">누진공제:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.progressiveDeduction)}만원</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                      <span className="text-slate-600">산출세액:</span>
                      <span className="text-blue-700">{formatNumber(calculationResult.calculatedTax)}만원</span>
                    </div>
                  </div>
                </div>

                {/* 7단계: 세액공제 */}
                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <h4 className="font-medium text-indigo-700 mb-3">7단계: 세액공제</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">증여세액공제:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.giftTaxCredit)}만원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">신고세액공제:</span>
                      <span className="text-slate-900">{formatNumber(calculationResult.reportTaxCredit)}만원</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                      <span className="text-slate-600">세액공제 합계:</span>
                      <span className="text-indigo-700">{formatNumber(calculationResult.totalTaxCredit)}만원</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                      <span className="text-slate-600">최종 상속세:</span>
                      <span className="text-indigo-700">{formatNumber(calculationResult.finalTax)}만원</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 요약 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  계산 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 재산가액</span>
                    <span className="font-medium">{formatNumber(calculationResult.totalAssets)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">총 채무</span>
                    <span className="font-medium text-red-600">-{formatNumber(calculationResult.totalDebt)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">순 재산가액</span>
                    <span className="font-medium">{formatNumber(calculationResult.netAssets)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">공제액</span>
                    <span className="font-medium text-green-600">
                      -{formatNumber(calculationResult.totalDeductions)}만원
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span className="text-slate-600">과세표준</span>
                    <span>{formatNumber(calculationResult.taxableAmount)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">산출세액</span>
                    <span className="font-medium">{formatNumber(calculationResult.calculatedTax)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">세액공제</span>
                    <span className="font-medium text-green-600">
                      -{formatNumber(calculationResult.totalTaxCredit)}만원
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t-2">
                    <span className="text-slate-900">최종 상속세</span>
                    <span className="text-slate-900">{formatNumber(calculationResult.finalTax)}만원</span>
                  </div>
                </div>

                <Alert className="bg-yellow-50 border-yellow-300">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-xs">
                    이 결과는 참고용입니다. 실제 상속세는 전문가와 상담하시기 바랍니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 액션 버튼들 */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button onClick={handleShare} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  결과 공유하기
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  결과 인쇄하기
                </Button>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    다시 계산하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 세율 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  2025년 상속세율
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1억원 이하</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5억원 이하</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10억원 이하</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30억원 이하</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30억원 초과</span>
                    <span className="font-medium">50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      <Footer />
    </div>
  )
}
