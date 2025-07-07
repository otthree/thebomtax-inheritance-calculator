"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home } from "lucide-react"

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
}

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [url, setUrl] = useState<ShortenedUrl | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const shortCode = params.shortCode as string

    // 로컬스토리지에서 URL 찾기
    const saved = localStorage.getItem("shortenedUrls")
    if (saved) {
      const urls: ShortenedUrl[] = JSON.parse(saved)
      const foundUrl = urls.find((item) => item.shortCode === shortCode)

      if (foundUrl) {
        setUrl(foundUrl)

        // 클릭 수 증가
        const updatedUrls = urls.map((item) =>
          item.shortCode === shortCode ? { ...item, clicks: item.clicks + 1 } : item,
        )
        localStorage.setItem("shortenedUrls", JSON.stringify(updatedUrls))

        // 카운트다운 시작
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              window.location.href = foundUrl.originalUrl
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }
    }

    setIsLoading(false)
  }, [params.shortCode])

  const redirectNow = () => {
    if (url) {
      window.location.href = url.originalUrl
    }
  }

  const goHome = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">URL을 찾는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">링크를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-6">요청하신 단축 URL이 존재하지 않거나 삭제되었습니다.</p>
            <Button onClick={goHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">리다이렉트 중...</h1>
          <p className="text-gray-600 mb-4">{countdown}초 후 다음 페이지로 이동합니다:</p>
          <div className="bg-gray-100 p-3 rounded-lg mb-6">
            <p className="text-sm text-gray-800 break-all">{url.originalUrl}</p>
          </div>
          <div className="space-y-2">
            <Button onClick={redirectNow} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              지금 이동하기
            </Button>
            <Button onClick={goHome} variant="outline" className="w-full bg-transparent">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
