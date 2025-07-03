"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Share2,
  Calculator,
  Users,
  Building,
  Calendar,
  ChevronDown,
  Copy,
  MessageCircle,
  ExternalLink,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ConsultationModal } from "@/components/consultation-modal"
import { Footer } from "@/components/footer"

// 타입 정의
interface CalculationData {
  totalAssets: number
  totalDebts: number
  netAssets: number
  deductions: {
    basic: number
    spouse: number
    children: number
    other: number
    total: number
  }
  taxableAssets: number
  inheritanceTax: number
  details: {
    taxBrackets: Array<{
      min: number
      max: number | null
      rate: number
      amount: number
    }>
  }
}

// 숫자 포맷팅 함수 (만원 단위)
function formatNumber(num: number): string {
  const inManWon = Math.round(num / 10000)
  return inManWon.toLocaleString("ko-KR")
}

// 세율 구간별 계산 함수
function calculateTaxBrackets(taxableAmount: number) {
  const brackets = [
    { min: 0, max: 100000000, rate: 0.1 },
    { min: 100000000, max: 500000000, rate: 0.2 },
    { min: 500000000, max: 1000000000, rate: 0.3 },
    { min: 1000000000, max: 3000000000, rate: 0.4 },
    { min: 3000000000, max: null, rate: 0.5 },
  ]

  const result = []
  let remainingAmount = taxableAmount
  let cumulativeTax = 0

  for (const bracket of brackets) {
    if (remainingAmount <= 0) break

    const bracketAmount = bracket.max ? Math.min(remainingAmount, bracket.max - bracket.min) : remainingAmount

    if (bracketAmount > 0) {
      const tax = bracketAmount * bracket.rate
      cumulativeTax += tax

      result.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
        amount: tax,
      })

      remainingAmount -= bracketAmount
    }
  }

  return result
}

function ResultPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)

  useEffect(() => {
    // URL 파라미터에서 데이터 파싱
    const totalAssets = Number(searchParams.get("totalAssets")) || 0
    const totalDebts = Number(searchParams.get("totalDebts")) || 0
    const basicDeduction = Number(searchParams.get("basicDeduction")) || 0
    const spouseDeduction = Number(searchParams.get("spouseDeduction")) || 0
    const childrenDeduction = Number(searchParams.get("childrenDeduction")) || 0
    const otherDeduction = Number(searchParams.get("otherDeduction")) || 0

    const netAssets = totalAssets - totalDebts
    const totalDeductions = basicDeduction + spouseDeduction + childrenDeduction + otherDeduction
    const taxableAssets = Math.max(0, netAssets - totalDeductions)

    // 세율 구간별 계산
    const taxBrackets = calculateTaxBrackets(taxableAssets)
    const inheritanceTax = taxBrackets.reduce((sum, bracket) => sum + bracket.amount, 0)

    setCalculationData({
      totalAssets,
      totalDebts,
      netAssets,
      deductions: {
        basic: basicDeduction,
        spouse: spouseDeduction,
        children: childrenDeduction,
        other: otherDeduction,
        total: totalDeductions,
      },
      taxableAssets,
      inheritanceTax,
      details: {
        taxBrackets,
      },
    })
  }, [searchParams])

  const handleShare = async (type: "copy" | "native" | "kakao") => {
    const currentUrl = window.location.href

    if (type === "copy") {
      try {
        await navigator.clipboard.writeText(currentUrl)
        toast({
          title: "링크가 복사되었습니다",
          description: "클립보드에 저장된 링크를 공유해보세요.",
        })
      } catch (err) {
        toast({
          title: "복사 실패",
          description: "링크 복사에 실패했습니다.",
          variant: "destructive",
        })
      }
    } else if (type === "native") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "상속세 계산 결과",
            text: `상속세 계산 결과를 확인해보세요. 상속세: ${formatNumber(calculationData?.inheritanceTax || 0)}만원`,
            url: currentUrl,
          })
        } catch (err) {
          // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
          if ((err as Error).name !== "AbortError") {
            toast({
              title: "공유 실패",
              description: "공유에 실패했습니다.",
              variant: "destructive",
            })
          }
        }
      } else {
        // Web Share API를 지원하지 않는 경우 링크 복사로 대체
        handleShare("copy")
      }
    } else if (type === "kakao") {
      handleKakaoShare()
    }
  }

  const handleKakaoShare = () => {
    if (typeof window === "undefined" || !window.Kakao) {
      toast({
        title: "카카오톡 공유 실패",
        description: "카카오 SDK를 불러올 수 없습니다. 링크를 복사합니다.",
        variant: "destructive",
      })
      handleShare("copy")
      return
    }

    if (!window.Kakao.isInitialized()) {
      toast({
        title: "카카오톡 공유 실패",
        description: "카카오 SDK가 초기화되지 않았습니다. 링크를 복사합니다.",
        variant: "destructive",
      })
      handleShare("copy")
      return
    }

    const currentUrl = window.location.href
    const inheritanceTax = calculationData?.inheritanceTax || 0
    const netAssets = calculationData?.netAssets || 0

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "상속세 계산 결과",
        description: `순상속재산: ${formatNumber(netAssets)}만원\n상속세: ${formatNumber(inheritanceTax)}만원`,
        imageUrl: `${window.location.origin}/logo-thebom-square-blue.png`,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: "상속세 계산하기",
          link: {
            mobileWebUrl: window.location.origin,
            webUrl: window.location.origin,
          },
        },
        {
          title: "계산 결과 보기",
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
    })
  }

  if (!calculationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">상속세 계산 결과</h1>
          </div>
          <p className="text-gray-600">정확한 계산 결과를 확인하고 전문가 상담을 받아보세요</p>
        </div>

        {/* 메인 결과 카드 */}
        <Card className="mb-6 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              최종 상속세 계산 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 상속재산</span>
                  <span className="font-semibold">{formatNumber(calculationData.totalAssets)}만원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 부채</span>
                  <span className="font-semibold text-red-600">-{formatNumber(calculationData.totalDebts)}만원</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">순상속재산</span>
                  <span className="font-bold text-lg">{formatNumber(calculationData.netAssets)}만원</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 공제액</span>
                  <span className="font-semibold text-green-600">
                    -{formatNumber(calculationData.deductions.total)}만원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">과세표준</span>
                  <span className="font-bold">{formatNumber(calculationData.taxableAssets)}만원</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-bold text-lg">상속세</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {formatNumber(calculationData.inheritanceTax)}만원
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 공제 내역 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              공제 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calculationData.deductions.basic > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>기초공제</span>
                  <Badge variant="secondary">{formatNumber(calculationData.deductions.basic)}만원</Badge>
                </div>
              )}
              {calculationData.deductions.spouse > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>배우자공제</span>
                  <Badge variant="secondary">{formatNumber(calculationData.deductions.spouse)}만원</Badge>
                </div>
              )}
              {calculationData.deductions.children > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>자녀공제</span>
                  <Badge variant="secondary">{formatNumber(calculationData.deductions.children)}만원</Badge>
                </div>
              )}
              {calculationData.deductions.other > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>기타공제</span>
                  <Badge variant="secondary">{formatNumber(calculationData.deductions.other)}만원</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 상세보기 */}
        <Card className="mb-6">
          <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    세율 구간별 상세 계산
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isDetailsOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-3">
                  {calculationData.details.taxBrackets.map((bracket, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <span className="font-medium">
                          {formatNumber(bracket.min)}만원
                          {bracket.max ? ` ~ ${formatNumber(bracket.max)}만원` : " 초과"}
                        </span>
                        <span className="text-gray-500 ml-2">({bracket.rate * 100}%)</span>
                      </div>
                      <span className="font-semibold">{formatNumber(bracket.amount)}만원</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
            <Calculator className="h-4 w-4 mr-2" />
            다시 계산하기
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                공유하기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare("kakao")}>
                <MessageCircle className="h-4 w-4 mr-2" />
                카카오톡 공유
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("copy")}>
                <Copy className="h-4 w-4 mr-2" />
                링크 복사
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("native")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                공유하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsConsultationModalOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            전문가 상담 신청
          </Button>
        </div>

        {/* 주의사항 */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 본 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다.</li>
              <li>• 정확한 세액 계산을 위해서는 전문가 상담을 받으시기 바랍니다.</li>
              <li>• 상속세 신고 및 납부 기한을 반드시 확인하시기 바랍니다.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={calculationData}
      />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">계산 결과를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  )
}

declare global {
  interface Window {
    Kakao: any
  }
}
