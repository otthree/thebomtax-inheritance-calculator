import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Phone, MessageCircle } from "lucide-react"
import Image from "next/image"

export default function ConsultationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Image src="/logo-deobom-blue.png" alt="세무법인 더봄" width={200} height={60} className="h-12 w-auto" />
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">상담 신청이 완료되었습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              전문 세무사가 빠른 시일 내에 연락드리겠습니다.
              <br />
              추가 문의사항이 있으시면 언제든 연락해주세요.
            </p>
            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full bg-slate-700 hover:bg-slate-800">상속세 계산기로 돌아가기</Button>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="tel:02-336-0309">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    전화 상담
                  </Button>
                </Link>
                <Link href="https://blog.naver.com/l77155/223777746014" target="_blank">
                  <Button variant="outline" className="w-full bg-transparent">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    블로그
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
