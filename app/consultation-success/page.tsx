import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Phone, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function ConsultationSuccessPage() {
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
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">상담 신청 완료</h2>
              <p className="text-sm text-slate-600">전문가가 빠른 시일 내에 연락드리겠습니다</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4">상담 신청이 완료되었습니다!</h1>

            <p className="text-slate-600 mb-8 leading-relaxed">
              세무법인 더봄의 전문가가 영업일 기준 1-2일 내에
              <br />
              연락드려 상세한 상담을 진행하겠습니다.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">📞 긴급 상담이 필요하신가요?</h3>
              <p className="text-blue-800 text-sm mb-4">급하게 상담이 필요하시면 직접 전화주시기 바랍니다.</p>
              <div className="flex items-center justify-center space-x-2 text-blue-900 font-semibold">
                <Phone className="w-5 h-5" />
                <span className="text-lg">02-336-0309</span>
              </div>
              <p className="text-blue-700 text-xs mt-2">평일 09:00 - 18:00</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="flex items-center bg-transparent">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  계산기로 돌아가기
                </Link>
              </Button>
              <Button asChild className="bg-slate-700 hover:bg-slate-800">
                <a href="tel:02-336-0309">
                  <Phone className="w-4 h-4 mr-2" />
                  지금 전화하기
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
