"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, Phone, ArrowLeft, ExternalLink } from "lucide-react"
import { Footer } from "@/components/footer"

export default function ConsultationSuccessPage() {
  const router = useRouter()

  const handleBackToCalculator = () => {
    router.push("/")
  }

  const handleGoToWebsite = () => {
    window.open("https://thebomtax.com", "_blank")
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
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <CardContent className="text-center py-12 px-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">문의가 접수되었습니다</h1>

              <div className="space-y-3 text-slate-700 leading-relaxed">
                <p className="text-lg">
                  안녕하세요 <span className="font-semibold text-blue-600">세무법인 더봄</span> 입니다
                </p>
                <p>저희 더봄을 믿고 의뢰해 주셔서</p>
                <p className="font-semibold">진심으로 감사드립니다</p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-slate-700 leading-relaxed">
                  고객님의 세금고민을
                  <br />
                  빠르게 해결해 드릴 수 있는
                  <br />
                  <span className="font-semibold text-blue-700">전문 세무사님이 곧 연락드릴 예정</span> 입니다
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span className="font-medium">연락처: 02-336-0309</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">평일 09:00 - 18:00 (토요일, 일요일, 공휴일 휴무)</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBackToCalculator}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 text-base font-medium"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                다시 계산하러가기
              </Button>

              <Button
                onClick={handleGoToWebsite}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 py-3 text-base font-medium bg-transparent"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                세무법인 더봄 바로가기
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-slate-500 leading-relaxed">
                ※ 상담 신청 후 1-2일 내에 전문 세무사가 연락드립니다.
                <br />※ 급한 문의사항은 대표번호로 직접 연락 부탁드립니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Services */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="text-center py-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">상속세 신고</h3>
              <p className="text-sm text-slate-600">정확한 신고와 절세 방안</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">증여세 신고</h3>
              <p className="text-sm text-slate-600">합리적인 증여 계획</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="text-center py-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">부동산 세무</h3>
              <p className="text-sm text-slate-600">양도소득세 등 부동산 세무</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer 추가 */}
      <Footer />
    </div>
  )
}
