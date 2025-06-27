import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Phone, Mail, MapPin, Clock, Calculator } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "상담 신청 완료 | 세무법인 더봄",
  description: "상담 신청이 완료되었습니다. 곧 연락드리겠습니다.",
}

export default function ConsultationSuccessPage() {
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
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">상담 신청이 완료되었습니다!</h1>
          <p className="text-lg text-slate-600 mb-8">전문 세무사가 영업일 기준 1-2일 내에 연락드리겠습니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 다음 단계 안내 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                다음 단계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">상담 일정 조율</h3>
                    <p className="text-sm text-slate-600">담당 세무사가 연락하여 상담 일정을 조율합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">서류 준비 안내</h3>
                    <p className="text-sm text-slate-600">상담에 필요한 서류 목록을 안내해드립니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">전문가 상담</h3>
                    <p className="text-sm text-slate-600">상속세 계산 및 절세 방안에 대해 상담받으실 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>세무법인 더봄 연락처</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-semibold">02-1234-5678</div>
                    <div className="text-sm text-slate-600">대표 전화</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-semibold">info@thebom.co.kr</div>
                    <div className="text-sm text-slate-600">이메일 문의</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-semibold">서울시 강남구 테헤란로 123</div>
                    <div className="text-sm text-slate-600">사무실 주소</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-semibold">평일 09:00 - 18:00</div>
                    <div className="text-sm text-slate-600">상담 가능 시간</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추가 서비스 안내 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>세무법인 더봄의 상속세 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">정확한 세액 계산</h3>
                <p className="text-sm text-slate-600">복잡한 상속세 계산을 정확하게 처리합니다.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">절세 방안 제시</h3>
                <p className="text-sm text-slate-600">합법적인 절세 방안을 제시해드립니다.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">신고 대행 서비스</h3>
                <p className="text-sm text-slate-600">상속세 신고를 전문적으로 대행합니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/">
            <Button size="lg" className="bg-slate-700 hover:bg-slate-800">
              다시 계산하기
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
