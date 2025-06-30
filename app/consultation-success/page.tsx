"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function ConsultationSuccessPage() {
  const router = useRouter()

  const handleBackToCalculator = () => {
    router.push("/")
  }

  const handleGoToWebsite = () => {
    window.open("https://thebomtax.com", "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">상담 신청 완료</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            상담 신청이 성공적으로 접수되었습니다.
            <br />
            빠른 시일 내에 연락드리겠습니다.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full bg-slate-700 hover:bg-slate-800">홈으로 돌아가기</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
