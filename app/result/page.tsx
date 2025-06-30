"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, ArrowLeft, FileText, Users } from "lucide-react"
import ConsultationModal from "@/components/consultation-modal"
import Footer from "@/components/footer"

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [calculationData, setCalculationData] = useState<any>(null)

  // URL 파라미터에서 데이터 추출
  const totalAssets = Number(searchParams.get("totalAssets")) || 0
  const totalDebt = Number(searchParams.get("totalDebt")) || 0
  const netAssets = Number(searchParams.get("netAssets")) || 0
  const taxableAmount = Number(searchParams.get("taxableAmount")) || 0
  const finalTax = Number(searchParams.get("finalTax")) || 0
  const realEstateTotal = Number(searchParams.get("realEstateTotal")) || 0
  const financialAssetsTotal = Number(searchParams.get("financialAssetsTotal")) || 0
  const giftAssetsTotal = Number(searchParams.get("giftAssetsTotal")) || 0
  const otherAssetsTotal = Number(searchParams.get("otherAssetsTotal")) || 0
  const financialDebtTotal = Number(searchParams.get("financialDebtTotal")) || 0
  const funeralExpenseTotal = Number(searchParams.get("funeralExpenseTotal")) || 0
  const taxArrearsTotal = Number(searchParams.get("taxArrearsTotal")) || 0
  const otherDebtTotal = Number(searchParams.get("otherDebtTotal")) || 0
  const totalDeductions = Number(searchParams.get("totalDeductions")) || 0
  const financialDeduction = Number(searchParams.get("financialDeduction")) || 0
  const basicDeduction = searchParams.get("basicDeduction") === "true"
  const spouseDeduction = searchParams.get("spouseDeduction") === "true"
  const housingDeduction = searchParams.get("housingDeduction") === "true"
  const taxRate = Number(searchParams.get("taxRate")) || 0
  const progressiveDeduction = Number(searchParams.get("progressiveDeduction")) || 0
  const calculatedTax = Number(searchParams.get("calculatedTax")) || 0
  const giftTaxCredit = Number(searchParams.get("giftTaxCredit")) || 0
  const reportTaxCredit = Number(searchParams.get("reportTaxCredit")) || 0
  const totalTaxCredit = Number(searchParams.get("totalTaxCredit")) || 0

  useEffect(() => {
    // 계산 데이터 설정
    setCalculationData({
      totalAssets,
      totalDebt,
      netAssets,
      taxableAmount,
      finalTax,
      realEstateTotal,
      financialAssetsTotal,
      giftAssetsTotal,
      otherAssetsTotal,
      financialDebtTotal,
      funeralExpenseTotal,
      taxArrearsTotal,
      otherDebtTotal,
      totalDeductions,
      financialDeduction,
      basicDeduction,
      spouseDeduction,
      housingDeduction,
      taxRate,
      progressiveDeduction,
      calculatedTax,
      giftTaxCredit,
      reportTaxCredit,
      totalTaxCredit,
    })
  }, [searchParams])

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num)
  }

  // 만원 단위로 변환
  const toManWon = (num: number) => {
    return Math.round(num / 10000)
  }

  // 상담 신청 모달 열기
  const handleConsultationRequest = () => {
    setIsConsultationModalOpen(true)
  }

  // 홈으로 돌아가기
  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">상속세 계산 결과</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleGoHome} className="flex items-center space-x-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                <span>돌아가기</span>
              </Button>
              <Button
                onClick={handleConsultationRequest}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Users className="h-4 w-4" />
                <span>전문가 상담</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 최종 결과 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardHeader>
                <CardTitle className="text-center">총 재산가액</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-4xl font-bold">{formatNumber(toManWon(totalAssets))}만원</p>
                <p className="text-sm opacity-90 mt-2">({formatNumber(totalAssets)}원)</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-center">최종 상속세</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-4xl font-bold">{formatNumber(toManWon(finalTax))}만원</p>
                <p className="text-sm opacity-90 mt-2">({formatNumber(finalTax)}원)</p>
              </CardContent>
            </Card>
          </div>

          {/* 상세보기 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>상세보기</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 재산 내역 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-700">재산 내역</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {realEstateTotal > 0 && (
                    <div className="flex justify-between">
                      <span>부동산:</span>
                      <span className="font-medium">{formatNumber(toManWon(realEstateTotal))}만원</span>
                    </div>
                  )}
                  {financialAssetsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>금융자산:</span>
                      <span className="font-medium">{formatNumber(toManWon(financialAssetsTotal))}만원</span>
                    </div>
                  )}
                  {giftAssetsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>사전증여자산:</span>
                      <span className="font-medium">{formatNumber(toManWon(giftAssetsTotal))}만원</span>
                    </div>
                  )}
                  {otherAssetsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>기타자산:</span>
                      <span className="font-medium">{formatNumber(toManWon(otherAssetsTotal))}만원</span>
                    </div>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>총 재산가액:</span>
                  <span>{formatNumber(toManWon(totalAssets))}만원</span>
                </div>
              </div>

              {/* 채무 내역 */}
              {totalDebt > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-700">채무 내역</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {financialDebtTotal > 0 && (
                      <div className="flex justify-between">
                        <span>금융채무:</span>
                        <span className="font-medium">{formatNumber(toManWon(financialDebtTotal))}만원</span>
                      </div>
                    )}
                    {funeralExpenseTotal > 0 && (
                      <div className="flex justify-between">
                        <span>장례비:</span>
                        <span className="font-medium">{formatNumber(toManWon(funeralExpenseTotal))}만원</span>
                      </div>
                    )}
                    {taxArrearsTotal > 0 && (
                      <div className="flex justify-between">
                        <span>세금미납:</span>
                        <span className="font-medium">{formatNumber(toManWon(taxArrearsTotal))}만원</span>
                      </div>
                    )}
                    {otherDebtTotal > 0 && (
                      <div className="flex justify-between">
                        <span>기타채무:</span>
                        <span className="font-medium">{formatNumber(toManWon(otherDebtTotal))}만원</span>
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>총 채무:</span>
                    <span>{formatNumber(toManWon(totalDebt))}만원</span>
                  </div>
                </div>
              )}

              {/* 공제 내역 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-700">공제 내역</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {basicDeduction && (
                    <div className="flex justify-between">
                      <span>일괄공제:</span>
                      <span className="font-medium">5,000만원</span>
                    </div>
                  )}
                  {spouseDeduction && (
                    <div className="flex justify-between">
                      <span>배우자공제:</span>
                      <Badge variant="secondary">적용</Badge>
                    </div>
                  )}
                  {housingDeduction && (
                    <div className="flex justify-between">
                      <span>동거주택 상속공제:</span>
                      <span className="font-medium">6,000만원</span>
                    </div>
                  )}
                  {financialDeduction > 0 && (
                    <div className="flex justify-between">
                      <span>금융자산 상속공제:</span>
                      <span className="font-medium">{formatNumber(toManWon(financialDeduction))}만원</span>
                    </div>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>총 공제액:</span>
                  <span>{formatNumber(toManWon(totalDeductions))}만원</span>
                </div>
              </div>

              {/* 세액 계산 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-700">세액 계산</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>과세표준:</span>
                    <span className="font-medium">{formatNumber(toManWon(taxableAmount))}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>적용 세율:</span>
                    <span className="font-medium">{taxRate}%</span>
                  </div>
                  {progressiveDeduction > 0 && (
                    <div className="flex justify-between">
                      <span>누진공제:</span>
                      <span className="font-medium">{formatNumber(toManWon(progressiveDeduction))}만원</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>산출세액:</span>
                    <span className="font-medium">{formatNumber(toManWon(calculatedTax))}만원</span>
                  </div>
                </div>
              </div>

              {/* 세액공제 */}
              {totalTaxCredit > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-700">세액공제</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {giftTaxCredit > 0 && (
                      <div className="flex justify-between">
                        <span>증여세액공제:</span>
                        <span className="font-medium">{formatNumber(toManWon(giftTaxCredit))}만원</span>
                      </div>
                    )}
                    {reportTaxCredit > 0 && (
                      <div className="flex justify-between">
                        <span>신고세액공제:</span>
                        <span className="font-medium">{formatNumber(toManWon(reportTaxCredit))}만원</span>
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>세액공제 합계:</span>
                    <span>{formatNumber(toManWon(totalTaxCredit))}만원</span>
                  </div>
                </div>
              )}

              {/* 최종 결과 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>최종 상속세:</span>
                  <span className="text-blue-600">{formatNumber(toManWon(finalTax))}만원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 안내사항 */}
          <Card>
            <CardHeader>
              <CardTitle>안내사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• 본 계산 결과는 참고용이며, 실제 세액과 차이가 있을 수 있습니다.</p>
              <p>• 정확한 세액 계산 및 신고를 위해서는 세무 전문가의 상담을 받으시기 바랍니다.</p>
              <p>• 상속세 신고는 상속개시일로부터 6개월 이내에 해야 합니다.</p>
              <p>• 신고기한 내 신고 시 신고세액공제 혜택을 받을 수 있습니다.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 상담 모달 */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={calculationData}
      />

      <Footer />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}
