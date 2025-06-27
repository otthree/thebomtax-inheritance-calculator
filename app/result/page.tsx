import type { Metadata } from "next"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calculator, FileText, Users, Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { ConsultationModal } from "@/components/consultation-modal"

export const metadata: Metadata = {
  title: "상속세 계산기 | 세무법인 더봄",
  description: "상속세 계산 결과를 확인하고 전문가 상담을 받아보세요.",
}

function ResultContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">상속세 계산기</h1>
                <p className="text-sm text-slate-600">세무법인 더봄</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                다시 계산하기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 계산 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 상속세 총액 */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calculator className="w-5 h-5" />
                  상속세 계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-blue-900 mb-2">123,456,789원</div>
                  <p className="text-slate-600">예상 상속세 총액</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-semibold text-slate-900">987,654,321원</div>
                    <div className="text-sm text-slate-600">과세표준</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-semibold text-slate-900">12.5%</div>
                    <div className="text-sm text-slate-600">실효세율</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 재산 분류 내역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  재산 분류 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700">부동산</span>
                    <span className="font-semibold">500,000,000원</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700">금융자산</span>
                    <span className="font-semibold">300,000,000원</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700">기타자산</span>
                    <span className="font-semibold">200,000,000원</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700">부채</span>
                    <span className="font-semibold text-red-600">-50,000,000원</span>
                  </div>
                  <Separator className="border-slate-400" />
                  <div className="flex justify-between items-center py-2 text-lg font-bold">
                    <span>총 상속재산</span>
                    <span>950,000,000원</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 공제 내역 */}
            <Card>
              <CardHeader>
                <CardTitle>적용된 공제 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>기초공제</span>
                    </div>
                    <span className="font-semibold">200,000,000원</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>배우자공제</span>
                    </div>
                    <span className="font-semibold">500,000,000원</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>자녀공제</span>
                    </div>
                    <span className="font-semibold">100,000,000원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 전문가 상담 */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Users className="w-5 h-5" />
                  전문가 상담
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  정확한 상속세 계산과 절세 방안을 위해 전문가 상담을 받아보세요.
                </p>
                <ConsultationModal />
              </CardContent>
            </Card>

            {/* 주의사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-700">주의사항</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <p>• 본 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다.</p>
                  <p>• 정확한 세액 계산을 위해서는 전문가 상담을 받으시기 바랍니다.</p>
                  <p>• 상속세 신고 기한은 상속개시일로부터 6개월입니다.</p>
                </div>
              </CardContent>
            </Card>

            {/* 연락처 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>세무법인 더봄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>02-1234-5678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>info@thebom.co.kr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>서울시 강남구 테헤란로 123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>평일 09:00 - 18:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
            <p className="text-slate-600">계산 결과를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
