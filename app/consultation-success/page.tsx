"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Phone, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function ConsultationSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoHome = () => {
    router.push("/")
  }

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

      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-slate-900 mb-2">상담 신청 완료!</h1>
              <p className="text-lg text-slate-600">상담 신청이 성공적으로 접수되었습니다.</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">다음 단계</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <p className="text-slate-700">
                    <strong>전문 세무사 검토:</strong> 제출해주신 정보를 바탕으로 전문 세무사가 상속세를 정확히
                    계산합니다.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <p className="text-slate-700">
                    <strong>연락 드림:</strong> 영업일 기준 1-2일 내에 담당 세무사가 직접 연락드립니다.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <p className="text-slate-700">
                    <strong>상담 진행:</strong> 상속세 절세 방안과 신고 절차에 대해 자세히 안내해드립니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                <Phone className="w-5 h-5 inline mr-2" />
                긴급 상담이 필요하신가요?
              </h3>
              <p className="text-slate-600 mb-4">급하게 상담이 필요하시면 언제든지 전화주세요.</p>
              <a
                href="tel:02-336-0309"
                className="inline-flex items-center px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                02-336-0309
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleGoHome} variant="outline" className="flex items-center bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                메인으로 돌아가기
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-6">{countdown}초 후 자동으로 메인 페이지로 이동합니다.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
