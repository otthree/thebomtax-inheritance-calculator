import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Image src="/logo-deobom-blue.png" alt="세무법인 더봄" width={200} height={60} className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">페이지를 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full bg-slate-700 hover:bg-slate-800">상속세 계산기로 돌아가기</Button>
              </Link>
              <Link href="tel:02-336-0309">
                <Button variant="outline" className="w-full bg-transparent">
                  전화 상담 (02-336-0309)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
