import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Phone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ConsultationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center">
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">상담 신청이 완료되었습니다</h1>

              <p className="text-gray-600 mb-6">
                빠른 시일 내에 담당자가 연락드리겠습니다.
                <br />
                <span className="text-sm text-gray-500">평일 오전 9시 ~ 오후 6시 내 연락드립니다.</span>
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">연락처 정보</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>02-1234-5678</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>info@deobom.co.kr</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    메인으로 돌아가기
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/result">계산 결과 다시 보기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
