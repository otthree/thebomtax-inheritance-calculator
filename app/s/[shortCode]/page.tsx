"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const shortCode = params.shortCode as string

    if (!shortCode) {
      setError("잘못된 링크입니다.")
      return
    }

    // 원본 URL 가져오기
    fetch(`/api/shorten?code=${shortCode}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setOriginalUrl(data.originalUrl)
        }
      })
      .catch(() => {
        setError("링크를 불러오는 중 오류가 발생했습니다.")
      })
  }, [params.shortCode])

  useEffect(() => {
    if (!originalUrl || error) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true)
          window.location.href = originalUrl
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [originalUrl, error])

  const handleImmediateRedirect = () => {
    if (originalUrl) {
      setIsRedirecting(true)
      window.location.href = originalUrl
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-red-600 mb-2">링크 오류</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="bg-slate-700 hover:bg-slate-800 text-white">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!originalUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
            <p className="text-gray-600">링크를 확인하는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          {isRedirecting ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-xl font-bold text-blue-600 mb-2">리다이렉트 중...</h1>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🔗</div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">링크 리다이렉트</h1>
              <p className="text-gray-600 mb-4">{countdown}초 후 자동으로 이동합니다.</p>
              <p className="text-sm text-gray-500 mb-6 break-all">이동할 페이지: {originalUrl}</p>
              <div className="space-y-3">
                <Button onClick={handleImmediateRedirect} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  지금 이동하기
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    홈으로 돌아가기
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
