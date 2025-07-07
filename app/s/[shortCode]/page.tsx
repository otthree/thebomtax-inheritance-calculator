"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ShortUrlRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const shortCode = params.shortCode as string

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        const response = await fetch(`/api/shorten?code=${shortCode}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "존재하지 않는 링크입니다.")
          return
        }

        setOriginalUrl(data.originalUrl)
      } catch (error) {
        setError("링크를 불러오는 중 오류가 발생했습니다.")
      }
    }

    fetchOriginalUrl()
  }, [shortCode])

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

  const handleRedirectNow = () => {
    if (originalUrl) {
      setIsRedirecting(true)
      window.location.href = originalUrl
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center">
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">링크를 찾을 수 없습니다</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push("/")} className="bg-slate-700 hover:bg-slate-800">
                상속세 계산기로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {isRedirecting ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <ArrowRight className="w-8 h-8 text-blue-600" />
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {isRedirecting ? "페이지로 이동 중..." : "상속세 계산 결과로 이동합니다"}
              </h1>

              {!isRedirecting && (
                <>
                  <p className="text-gray-600 mb-6">
                    {countdown}초 후 자동으로 이동됩니다.
                    <br />
                    <span className="text-sm text-gray-500">공유받은 상속세 계산 결과를 확인하세요.</span>
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={handleRedirectNow}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!originalUrl}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      지금 이동하기
                    </Button>

                    <Button variant="outline" onClick={() => router.push("/")} className="w-full bg-transparent">
                      새로 계산하기
                    </Button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      🔗 단축 링크: {window.location.hostname}/s/{shortCode}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
