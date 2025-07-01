"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  FileText,
  Share2,
  Download,
  Home,
  Calculator,
  AlertTriangle,
  Check,
  MessageCircle,
  Phone,
  Clock,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

interface CalculationData {
  formData: any
  calculationResult: {
    totalAssets: number
    totalDebt: number
    netAssets: number
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
    taxableAmount: number
    taxRate: number
    progressiveDeduction: number
    calculatedTax: number
    giftTaxCredit: number
    reportTaxCredit: number
    totalTaxCredit: number
    finalTax: number
  }
  timestamp: string
}

export default function ResultPage() {
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // localStorage에서 계산 결과 가져오기
    const savedData = localStorage.getItem("inheritanceTaxCalculation")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setCalculationData(data)
      } catch (error) {
        console.error("데이터 파싱 오류:", error)
      }
    }
    setLoading(false)
  }, [])

  const formatNumber = (num: number) => {
    const rounded = Math.round(num / 10000)
    return rounded.toLocaleString("ko-KR")
  }

  const shareResult = async () => {
    const shareText = calculationData
      ? `🧮 상속세 계산 결과
      
📊 총 재산: ${formatNumber(calculationData.calculationResult.totalAssets)}만원
💰 최종 상속세: ${formatNumber(calculationData.calculationResult.finalTax)}만원
📈 세율: ${calculationData.calculationResult.taxRate}%

세무법인 더봄에서 정확한 상속세를 계산해보세요!
https://taxcalc.deobom.co.kr`
      : ""

    if (navigator.share) {
      try {
        await navigator.share({
          title: "상속세 계산 결과",
          text: shareText,
        })
      } catch (error) {
        console.log("공유 취소됨")
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!calculationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">계산 결과를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">계산기를 다시 사용해서 상속세를 계산해보세요.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Calculator className="w-4 h-4 mr-2" />
              계산기로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const result = calculationData.calculationResult
  const isHighTax = result.finalTax > result.totalAssets * 0.1 // 총 재산의 10% 이상이면 높은 세율

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logo-deobom-blue.png"
                  alt="세무법인 더봄"
                  width={240}
                  height={72}
                  className="h-10 w-auto cursor-pointer"
                />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-slate-600">
                <Phone className="w-5 h-5" />
                <span className="font-medium text-base">02-336-0309</span>
              </div>
              <Link href="/">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent">
                  <Calculator className="w-4 h-4 mr-2" />
                  다시 계산하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 결과 요약 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">상속세 계산 결과</h1>
            <p className="text-blue-100 text-lg">2025년 기준 · 전문 세무사 검증</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 메인 결과 카드 */}
        <Card className="mb-8 bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              {isHighTax ? (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-green-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl text-slate-900">예상 상속세</CardTitle>
            <div className="text-5xl font-bold text-blue-600 mt-4 mb-2">{formatNumber(result.finalTax)}만원</div>
            <p className="text-slate-600">
              과세표준: {formatNumber(result.taxableAmount)}만원 (세율: {result.taxRate}%)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">총 재산가액</p>
                <p className="text-xl font-semibold text-slate-900">{formatNumber(result.totalAssets)}만원</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">총 공제액</p>
                <p className="text-xl font-semibold text-slate-900">{formatNumber(result.totalDeductions)}만원</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">누진공제</p>
                <p className="text-xl font-semibold text-slate-900">{formatNumber(result.progressiveDeduction)}만원</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={shareResult} className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {copied ? "복사됨!" : "결과 공유하기"}
              </Button>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1 sm:flex-none bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 계산 과정 상세 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                계산 과정 상세
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 1단계: 총 재산가액 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-700 mb-3">1단계: 총 재산가액</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">부동산</span>
                    <span>{formatNumber(result.realEstateTotal)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">금융자산</span>
                    <span>{formatNumber(result.financialAssetsTotal)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">사전증여자산</span>
                    <span>{formatNumber(result.giftAssetsTotal)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">기타자산</span>
                    <span>{formatNumber(result.otherAssetsTotal)}만원</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>합계</span>
                    <span className="text-blue-700">{formatNumber(result.totalAssets)}만원</span>
                  </div>
                </div>
              </div>

              {/* 2단계: 채무 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-3">2단계: 총 채무</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">장례비</span>
                    <span>{formatNumber(result.funeralExpenseTotal)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">금융채무</span>
                    <span>{formatNumber(result.financialDebtTotal)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">세금미납</span>
                    <span>{formatNumber(result.taxArrearsTotal)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">기타채무</span>
                    <span>{formatNumber(result.otherDebtTotal)}만원</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>합계</span>
                    <span className="text-red-700">{formatNumber(result.totalDebt)}만원</span>
                  </div>
                </div>
              </div>

              {/* 3단계: 순 재산가액 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-700 mb-3">3단계: 순 재산가액</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>총 재산 - 총 채무</span>
                    <span className="text-green-700">{formatNumber(result.netAssets)}만원</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatNumber(result.totalAssets)} - {formatNumber(result.totalDebt)} ={" "}
                    {formatNumber(result.netAssets)}
                  </div>
                </div>
              </div>

              {/* 4단계: 공제 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-purple-700 mb-3">4단계: 공제액</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">금융자산 상속공제</span>
                    <span>{formatNumber(result.financialDeduction)}만원</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>총 공제액</span>
                    <span className="text-purple-700">{formatNumber(result.totalDeductions)}만원</span>
                  </div>
                </div>
              </div>

              {/* 5단계: 과세표준 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-orange-700 mb-3">5단계: 과세표준</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>순 재산 - 공제액</span>
                    <span className="text-orange-700">{formatNumber(result.taxableAmount)}만원</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatNumber(result.netAssets)} - {formatNumber(result.totalDeductions)} ={" "}
                    {formatNumber(result.taxableAmount)}
                  </div>
                </div>
              </div>

              {/* 6단계: 세액 계산 */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-indigo-700 mb-3">6단계: 세액 계산</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">적용 세율</span>
                    <span>{result.taxRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">누진공제</span>
                    <span>{formatNumber(result.progressiveDeduction)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">산출세액</span>
                    <span>{formatNumber(result.calculatedTax)}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">세액공제</span>
                    <span>{formatNumber(result.totalTaxCredit)}만원</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>최종 상속세</span>
                    <span className="text-indigo-700">{formatNumber(result.finalTax)}만원</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상담 및 추가 정보 */}
          <div className="space-y-6">
            {/* 전문가 상담 */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  전문가 무료 상담
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 mb-4 text-sm">
                  계산 결과에 대한 정확한 분석과 절세 방안을 전문 세무사가 무료로 상담해드립니다.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-blue-700">
                    <UserCheck className="w-4 h-4 mr-2" />
                    <span>세무법인 더봄 전문 세무사</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>평일 09:00 - 18:00 상담 가능</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-700">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>02-336-0309</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    상담 신청
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 절세 팁 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
                  절세 방안
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">💡 공제 혜택 활용</h4>
                    <p className="text-green-700">동거주택 상속공제, 배우자 공제 등 추가 공제 혜택을 검토해보세요.</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📋 신고 기한 준수</h4>
                    <p className="text-blue-700">상속개시일로부터 6개월 내 신고 시 3% 세액공제 혜택이 있습니다.</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">🏠 부동산 평가</h4>
                    <p className="text-purple-700">공시지가 기준 평가로 절세가 가능할 수 있습니다.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 추가 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>참고 사항</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-sm">
                    <strong>주의:</strong> 이 계산 결과는 일반적인 기준으로 산출된 예상값입니다. 실제 상속세는 개별
                    상황에 따라 달라질 수 있으므로 정확한 신고를 위해서는 전문가와 상담하시기 바랍니다.
                  </AlertDescription>
                </Alert>
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  <p>• 계산일: {new Date(calculationData.timestamp).toLocaleDateString("ko-KR")}</p>
                  <p>• 적용 기준: 2025년 상속세법</p>
                  <p>• 제공: 세무법인 더봄</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Calculator className="w-4 h-4 mr-2" />
                다시 계산하기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
