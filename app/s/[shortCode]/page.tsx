"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ShortUrlRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(2)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const shortCode = params.shortCode as string

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/shorten?code=${shortCode}`)

        // 응답 상태 확인
        if (!response.ok) {
          // JSON 응답인지 확인
          const contentType = response.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const data = await response.json()
            setError(data.error || "존재하지 않거나 만료된 링크입니다.")
          } else {
            // JSON이 아닌 응답 (HTML 오류 페이지 등)
            const text = await response.text()
            console.error("Non-JSON response:", text)
            setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
          }
          return
        }

        // 성공 응답 처리
        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          const text = await response.text()
          console.error("Expected JSON, got:", text)
          setError("서버 응답 형식이 올바르지 않습니다.")
          return
        }

        const data = await response.json()

        if (!data.originalUrl) {
          setError("링크 데이터가 올바르지 않습니다.")
          return
        }

        setOriginalUrl(data.originalUrl)
        console.log(`🔗 단축 링크 해석: ${shortCode} -> ${data.originalUrl}`)
      } catch (error) {
        console.error("링크 조회 오류:", error)

        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          setError("서버에서 올바르지 않은 응답을 받았습니다.")
        } else if (error instanceof TypeError && error.message.includes("fetch")) {
          setError("네트워크 연결을 확인해주세요.")
        } else {
          setError("링크를 불러오는 중 오류가 발생했습니다.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (shortCode) {
      fetchOriginalUrl()
    } else {
      setError("잘못된 링크입니다.")
      setIsLoading(false)
    }
  }, [shortCode])

  useEffect(() => {
    if (!originalUrl || error || isLoading) return

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
  }, [originalUrl, error, isLoading])

  const handleRedirectNow = () => {
    if (originalUrl) {
      setIsRedirecting(true)
      window.location.href = originalUrl
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center">
            <CardContent className="py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">링크 확인 중...</h1>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
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

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md mx-auto px-4">
            <Card className="text-center">
              <CardContent className="py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">링크를 찾을 수 없습니다</h1>
                <p className="text-gray-600 mb-2">{error}</p>
                <p className="text-sm text-gray-500 mb-6">
                  링크가 만료되었거나 존재하지 않을 수 있습니다.
                  <br />
                  <span className="text-xs">💡 공유 링크는 24시간 후 자동으로 만료됩니다.</span>
                </p>
                <div className="space-y-3">
                  <Button onClick={() => router.push("/")} className="w-full bg-slate-700 hover:bg-slate-800">
                    상속세 계산기로 이동
                  </Button>
                  <Button variant="outline" onClick={() => router.back()} className="w-full">
                    이전 페이지로
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                  <p className="text-gray-600 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{countdown}</span>초 후 자동으로 이동됩니다.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-6">
                    <p className="text-sm text-gray-600 mb-1">📊 공유받은 상속세 계산 결과</p>
                    <p className="text-xs text-gray-500 break-all">{originalUrl}</p>
                  </div>

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
                    <div className="flex items-center justify-center text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      24시간 후 자동 만료
                    </div>
                    <p className="text-xs text-gray-400">
                      🔗 {window.location.hostname}/s/{shortCode}
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
