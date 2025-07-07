"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Share2, Download, ArrowLeft, Building, Users, Coins, Phone, Copy, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ConsultationModal } from "@/components/consultation-modal"
import { useToast } from "@/hooks/use-toast"

// 숫자 포맷팅 함수 (천 단위 콤마)
const formatNumber = (num: number): string => {
  return num.toLocaleString("ko-KR")
}

// 만원 단위로 변환하는 함수
const formatToManWon = (amount: number): string => {
  if (amount === 0) return "0"

  const manWon = Math.floor(amount / 10000)

  if (manWon >= 100000000) {
    // 1조 이상
    const jo = Math.floor(manWon / 100000000)
    const remainder = manWon % 100000000
    if (remainder === 0) {
      return `${jo}조`
    } else {
      const eok = Math.floor(remainder / 10000)
      if (eok === 0) {
        return `${jo}조 ${remainder}`
      } else {
        const man = remainder % 10000
        if (man === 0) {
          return `${jo}조 ${eok}억`
        } else {
          return `${jo}조 ${eok}억 ${man}`
        }
      }
    }
  } else if (manWon >= 10000) {
    // 1억 이상
    const eok = Math.floor(manWon / 10000)
    const man = manWon % 10000
    if (man === 0) {
      return `${eok}억`
    } else {
      return `${eok}억 ${man}`
    }
  } else {
    return `${manWon}`
  }
}

interface CalculationResults {
  totalAssets: number
  totalDebts: number
  funeralExpenses: number
  netAssets: number
  spouseExists: boolean
  numChildren: number
  numOtherHeirs: number
  basicDeduction: number
  spouseDeduction: number
  childDeduction: number
  otherDeduction: number
  totalDeduction: number
  taxableAssets: number
  grossTax: number
  taxDeduction: number
  finalTax: number
}

function ResultPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // URL 파라미터에서 계산 데이터 추출
    const totalAssets = Number.parseInt(searchParams.get("totalAssets")?.replace(/,/g, "") || "0")
    const totalDebts = Number.parseInt(searchParams.get("totalDebts")?.replace(/,/g, "") || "0")
    const funeralExpenses = Number.parseInt(searchParams.get("funeralExpenses")?.replace(/,/g, "") || "0")
    const spouseExists = searchParams.get("spouseExists") === "true"
    const numChildren = Number.parseInt(searchParams.get("numChildren") || "0")
    const numOtherHeirs = Number.parseInt(searchParams.get("numOtherHeirs") || "0")

    if (totalAssets === 0) {
      router.push("/")
      return
    }

    // 계산 수행
    const netAssets = totalAssets - totalDebts - funeralExpenses
    const basicDeduction = 200000000

    let spouseDeduction = 0
    if (spouseExists) {
      const totalHeirs = 1 + numChildren + numOtherHeirs
      const spouseShare = netAssets / totalHeirs
      spouseDeduction = Math.max(500000000, spouseShare)
    }

    const childDeduction = numChildren * 50000000
    const otherDeduction = numOtherHeirs * 50000000
    const totalDeduction = basicDeduction + spouseDeduction + childDeduction + otherDeduction
    const taxableAssets = Math.max(0, netAssets - totalDeduction)

    let grossTax = 0
    if (taxableAssets > 0) {
      if (taxableAssets <= 100000000) {
        grossTax = taxableAssets * 0.1
      } else if (taxableAssets <= 500000000) {
        grossTax = 10000000 + (taxableAssets - 100000000) * 0.2
      } else if (taxableAssets <= 1000000000) {
        grossTax = 90000000 + (taxableAssets - 500000000) * 0.3
      } else if (taxableAssets <= 3000000000) {
        grossTax = 240000000 + (taxableAssets - 1000000000) * 0.4
      } else {
        grossTax = 1040000000 + (taxableAssets - 3000000000) * 0.5
      }
    }

    let taxDeduction = 0
    if (numChildren >= 1) {
      taxDeduction = Math.min(grossTax * 0.05, 20000000)
    }

    const finalTax = Math.max(0, grossTax - taxDeduction)

    setResults({
      totalAssets,
      totalDebts,
      funeralExpenses,
      netAssets,
      spouseExists,
      numChildren,
      numOtherHeirs,
      basicDeduction,
      spouseDeduction,
      childDeduction,
      otherDeduction,
      totalDeduction,
      taxableAssets,
      grossTax,
      taxDeduction,
      finalTax,
    })
  }, [searchParams, router])

  const handleShare = async () => {
    if (!results) return

    try {
      setIsSharing(true)

      // URL 단축 API 호출
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "링크 생성에 실패했습니다.")
      }

      const data = await response.json()

      // 단축 URL을 클립보드에 복사
      await navigator.clipboard.writeText(data.shortUrl)

      toast({
        title: "링크가 복사되었습니다!",
        description: `${data.cached ? "기존" : "새로운"} 단축 링크가 클립보드에 복사되었습니다. (${data.expiresIn} 유효)`,
      })

      console.log("📋 단축 링크 복사:", data.shortUrl)
    } catch (error) {
      console.error("❌ URL 단축 오류:", error)
      toast({
        title: "링크 생성 실패",
        description: error instanceof Error ? error.message : "링크 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast({
        title: "링크가 복사되었습니다!",
        description: "계산 결과 링크가 클립보드에 복사되었습니다.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "링크 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!results) return

    const content = `
상속세 계산 결과

=== 입력 정보 ===
총 자산: ${formatNumber(results.totalAssets)}원 (${formatToManWon(results.totalAssets)}만원)
총 부채: ${formatNumber(results.totalDebts)}원 (${formatToManWon(results.totalDebts)}만원)
장례비용: ${formatNumber(results.funeralExpenses)}원 (${formatToManWon(results.funeralExpenses)}만원)
배우자: ${results.spouseExists ? "있음" : "없음"}
자녀 수: ${results.numChildren}명
기타 상속인: ${results.numOtherHeirs}명

=== 계산 결과 ===
순자산: ${formatNumber(results.netAssets)}원 (${formatToManWon(results.netAssets)}만원)

공제 내역:
- 기초공제: ${formatNumber(results.basicDeduction)}원 (${formatToManWon(results.basicDeduction)}만원)
- 배우자공제: ${formatNumber(results.spouseDeduction)}원 (${formatToManWon(results.spouseDeduction)}만원)
- 자녀공제: ${formatNumber(results.childDeduction)}원 (${formatToManWon(results.childDeduction)}만원)
- 기타공제: ${formatNumber(results.otherDeduction)}원 (${formatToManWon(results.otherDeduction)}만원)
- 총 공제액: ${formatNumber(results.totalDeduction)}원 (${formatToManWon(results.totalDeduction)}만원)

상속세 과세표준: ${formatNumber(results.taxableAssets)}원 (${formatToManWon(results.taxableAssets)}만원)
산출세액: ${formatNumber(results.grossTax)}원 (${formatToManWon(results.grossTax)}만원)
세액공제: ${formatNumber(results.taxDeduction)}원 (${formatToManWon(results.taxDeduction)}만원)

최종 상속세: ${formatNumber(results.finalTax)}원 (${formatToManWon(results.finalTax)}만원)

* 본 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다.
* 정확한 계산을 위해서는 전문가 상담을 받으시기 바랍니다.

계산일시: ${new Date().toLocaleString("ko-KR")}
제공: 세무법인 더봄
    `.trim()

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `상속세계산결과_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "파일이 다운로드되었습니다!",
      description: "계산 결과가 텍스트 파일로 저장되었습니다.",
    })
  }

  if (!results) {
    return <div>계산 중...</div>
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
            <Button variant="outline" onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              다시 계산하기
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상속세 계산 결과</h1>
          <p className="text-gray-600">아래는 입력하신 정보를 바탕으로 계산된 예상 상속세입니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Summary & Deductions */}
          <div className="space-y-6">
            {/* 입력 정보 요약 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  입력 정보 요약
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 자산</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.totalAssets)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.totalAssets)}만원)</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 부채</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.totalDebts)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.totalDebts)}만원)</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">장례비용</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.funeralExpenses)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.funeralExpenses)}만원)</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>순자산</span>
                    <div className="text-right">
                      <div>{formatNumber(results.netAssets)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.netAssets)}만원)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상속인 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  상속인 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">배우자</span>
                    <span className="font-semibold">{results.spouseExists ? "있음" : "없음"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">자녀 수</span>
                    <span className="font-semibold">{results.numChildren}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">기타 상속인</span>
                    <span className="font-semibold">{results.numOtherHeirs}명</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 공제 내역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  공제 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">기초공제</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.basicDeduction)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.basicDeduction)}만원)</div>
                    </div>
                  </div>
                  {results.spouseExists && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">배우자공제</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(results.spouseDeduction)}원</div>
                        <div className="text-sm text-gray-500">({formatToManWon(results.spouseDeduction)}만원)</div>
                      </div>
                    </div>
                  )}
                  {results.numChildren > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">자녀공제</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(results.childDeduction)}원</div>
                        <div className="text-sm text-gray-500">({formatToManWon(results.childDeduction)}만원)</div>
                      </div>
                    </div>
                  )}
                  {results.numOtherHeirs > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">기타 인적공제</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(results.otherDeduction)}원</div>
                        <div className="text-sm text-gray-500">({formatToManWon(results.otherDeduction)}만원)</div>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>총 공제액</span>
                    <div className="text-right">
                      <div>{formatNumber(results.totalDeduction)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.totalDeduction)}만원)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tax Calculation & Actions */}
          <div className="space-y-6">
            {/* 상속세 계산 결과 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  상속세 계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-6 rounded-lg mb-6 text-center">
                  <div className="text-sm text-gray-600 mb-2">최종 상속세</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{formatNumber(results.finalTax)}원</div>
                  <div className="text-lg text-gray-600">({formatToManWon(results.finalTax)}만원)</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">과세표준</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.taxableAssets)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.taxableAssets)}만원)</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">산출세액</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.grossTax)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.grossTax)}만원)</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">세액공제</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(results.taxDeduction)}원</div>
                      <div className="text-sm text-gray-500">({formatToManWon(results.taxDeduction)}만원)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼들 */}
            <Card>
              <CardHeader>
                <CardTitle>결과 활용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button onClick={handleShare} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSharing}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {isSharing ? "링크 생성 중..." : "단축 링크로 공유하기"}
                  </Button>

                  <Button onClick={handleCopyLink} variant="outline" className="w-full bg-transparent">
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        복사됨!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        링크 복사하기
                      </>
                    )}
                  </Button>

                  <Button onClick={handleDownload} variant="outline" className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    결과 다운로드
                  </Button>

                  <Button
                    onClick={() => setIsConsultationModalOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    전문가 상담 신청
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 주의사항 */}
            <Card>
              <CardContent className="pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 본 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다.</li>
                    <li>• 각종 특례 및 감면 규정이 적용되지 않았습니다.</li>
                    <li>• 정확한 계산을 위해서는 전문가 상담을 받으시기 바랍니다.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 상담 신청 모달 */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={results}
      />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ResultPageContent />
    </Suspense>
  )
}
