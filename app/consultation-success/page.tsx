"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function ConsultationSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // 5초 후 메인 페이지로 리다이렉트
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

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
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

            <h1 className="text-3xl font-bold text-slate-900 mb-4">상담 신청이 완료되었습니다!</h1>

            <p className="text-lg text-slate-600 mb-8">빠른 시일 내에 전문 세무사가 연락드리겠습니다.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">📞 긴급 상담이 필요하신가요?</h2>
              <p className="text-slate-600 mb-4">평일 09:00 - 18:00 직통 전화 상담 가능</p>
              <a
                href="tel:02-336-0309"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                02-336-0309
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/")} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3">
                계산기로 돌아가기
              </Button>
              <Button
                onClick={() => window.open("https://blog.naver.com/l77155", "_blank")}
                variant="outline"
                className="px-8 py-3"
              >
                세무 정보 블로그 보기
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-8">5초 후 자동으로 메인 페이지로 이동합니다.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
