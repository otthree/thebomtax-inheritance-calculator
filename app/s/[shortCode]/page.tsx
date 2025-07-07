"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink, Clock } from "lucide-react"
import Link from "next/link"

interface ShortUrlData {
  originalUrl: string
  shortCode: string
  createdAt: string
  clicks: number
}

export default function ShortUrlRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<ShortUrlData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  const shortCode = params.shortCode as string

  useEffect(() => {
    if (!shortCode) {
      setError("잘못된 단축 코드입니다.")
      setLoading(false)
      return
    }

    fetchShortUrlData()
  }, [shortCode])

  const fetchShortUrlData = async () => {
    try {
      const response = await fetch(`/api/shorten?code=${shortCode}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("존재하지 않거나 만료된 링크입니다.")
        } else {
          setError("링크를 불러오는 중 오류가 발생했습니다.")
        }
        setLoading(false)
        return
      }

      const result = await response.json()
      setData(result)

      // 3초 후 자동 리다이렉트
      setTimeout(() => {
        setRedirecting(true)
        window.location.href = result.originalUrl
      }, 3000)
    } catch (error) {
      console.error("단축 URL 조회 오류:", error)
      setError("링크를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleManualRedirect = () => {
    if (data) {
      setRedirecting(true)
      window.location.href = data.originalUrl
    }
  }

  const getKoreanDomain = (url: string) => {
    return `https://상속세더봄.com/s/${shortCode}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">링크를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">링크 오류</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="text-center py-8">
          <div className="mb-6">
            <ExternalLink className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">리다이렉트 중...</h1>
            <p className="text-gray-600">잠시 후 원본 페이지로 이동합니다.</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-2">단축 URL</div>
            <div className="font-mono text-blue-600 break-all">{getKoreanDomain(data.originalUrl)}</div>
          </div>

          <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
            <Clock className="w-4 h-4 mr-2" />
            {redirecting ? "리다이렉트 중..." : "2초 후 자동 이동"}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleManualRedirect}
              disabled={redirecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {redirecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  이동 중...
                </>
              ) : (
                "지금 이동하기"
              )}
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-400 space-y-1">
              <div>조회수: {data.clicks}회</div>
              <div>생성일: {new Date(data.createdAt).toLocaleDateString("ko-KR")}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
