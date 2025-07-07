"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calculator, Users, Building, Coins, FileText, Phone, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"

// 숫자 포맷팅 함수 (천 단위 콤마)
const formatNumber = (num: number): string => {
  return num.toLocaleString("ko-KR")
}

// 숫자 파싱 함수 (콤마 제거)
const parseNumber = (str: string): number => {
  return Number.parseInt(str.replace(/,/g, "")) || 0
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

export default function InheritanceTaxCalculator() {
  const router = useRouter()

  // 입력 상태
  const [totalAssets, setTotalAssets] = useState("")
  const [totalDebts, setTotalDebts] = useState("")
  const [funeralExpenses, setFuneralExpenses] = useState("")
  const [spouseExists, setSpouseExists] = useState(false)
  const [numChildren, setNumChildren] = useState("")
  const [numOtherHeirs, setNumOtherHeirs] = useState("")

  // 실시간 계산 결과 상태
  const [realTimeResults, setRealTimeResults] = useState({
    netAssets: 0,
    basicDeduction: 0,
    spouseDeduction: 0,
    childDeduction: 0,
    otherDeduction: 0,
    totalDeduction: 0,
    taxableAssets: 0,
    grossTax: 0,
    taxDeduction: 0,
    finalTax: 0,
  })

  // 실시간 계산 함수
  const calculateRealTime = () => {
    const assets = parseNumber(totalAssets)
    const debts = parseNumber(totalDebts)
    const funeral = parseNumber(funeralExpenses)
    const children = Number.parseInt(numChildren) || 0
    const others = Number.parseInt(numOtherHeirs) || 0

    // 순자산 계산
    const netAssets = assets - debts - funeral

    // 기초공제 (2억원)
    const basicDeduction = 200000000

    // 배우자 공제 (최소 5억원, 실제 상속분과 5억원 중 큰 금액)
    let spouseDeduction = 0
    if (spouseExists) {
      const totalHeirs = 1 + children + others // 배우자 + 자녀 + 기타 상속인
      const spouseShare = netAssets / totalHeirs
      spouseDeduction = Math.max(500000000, spouseShare)
    }

    // 자녀공제 (1인당 5천만원)
    const childDeduction = children * 50000000

    // 기타 인적공제 (1인당 5천만원)
    const otherDeduction = others * 50000000

    // 총 공제액
    const totalDeduction = basicDeduction + spouseDeduction + childDeduction + otherDeduction

    // 상속세 과세표준
    const taxableAssets = Math.max(0, netAssets - totalDeduction)

    // 상속세 계산 (누진세율 적용)
    let grossTax = 0
    if (taxableAssets > 0) {
      if (taxableAssets <= 100000000) {
        // 1억 이하
        grossTax = taxableAssets * 0.1
      } else if (taxableAssets <= 500000000) {
        // 5억 이하
        grossTax = 10000000 + (taxableAssets - 100000000) * 0.2
      } else if (taxableAssets <= 1000000000) {
        // 10억 이하
        grossTax = 90000000 + (taxableAssets - 500000000) * 0.3
      } else if (taxableAssets <= 3000000000) {
        // 30억 이하
        grossTax = 240000000 + (taxableAssets - 1000000000) * 0.4
      } else {
        // 30억 초과
        grossTax = 1040000000 + (taxableAssets - 3000000000) * 0.5
      }
    }

    // 세액공제 (자녀수에 따른 세액공제)
    let taxDeduction = 0
    if (children >= 1) {
      taxDeduction = Math.min(grossTax * 0.05, 20000000) // 5% 또는 2천만원 중 작은 금액
    }

    // 최종 상속세
    const finalTax = Math.max(0, grossTax - taxDeduction)

    setRealTimeResults({
      netAssets,
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
  }

  // 입력값 변경시 실시간 계산
  useEffect(() => {
    calculateRealTime()
  }, [totalAssets, totalDebts, funeralExpenses, spouseExists, numChildren, numOtherHeirs])

  const handleCalculate = () => {
    // 필수 입력값 검증
    if (!totalAssets) {
      alert("총 자산을 입력해주세요.")
      return
    }

    // 계산 결과를 URL 파라미터로 전달
    const params = new URLSearchParams({
      totalAssets,
      totalDebts: totalDebts || "0",
      funeralExpenses: funeralExpenses || "0",
      spouseExists: spouseExists.toString(),
      numChildren: numChildren || "0",
      numOtherHeirs: numOtherHeirs || "0",
    })

    router.push(`/result?${params.toString()}`)
  }

  const handleInputChange = (value: string, setter: (value: string) => void) => {
    // 숫자만 입력 허용하고 콤마 추가
    const numericValue = value.replace(/[^0-9]/g, "")
    const formattedValue = numericValue ? formatNumber(Number.parseInt(numericValue)) : ""
    setter(formattedValue)
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
            <nav className="hidden md:flex space-x-8">
              <Link href="#calculator" className="text-gray-700 hover:text-blue-600 font-medium">
                계산기
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-blue-600 font-medium">
                서비스 소개
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">
                상담 문의
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">상속세 계산기</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">정확하고 빠른 상속세 계산 서비스</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Calculator className="mr-2 h-5 w-5" />
              지금 계산하기
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Phone className="mr-2 h-5 w-5" />
              전문가 상담
            </Button>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">상속세 계산</h2>
            <p className="text-lg text-gray-600">아래 정보를 입력하시면 예상 상속세를 계산해드립니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  상속 정보 입력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 자산 정보 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    자산 정보
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="totalAssets">총 자산 (원) *</Label>
                    <Input
                      id="totalAssets"
                      type="text"
                      placeholder="예: 1,000,000,000"
                      value={totalAssets}
                      onChange={(e) => handleInputChange(e.target.value, setTotalAssets)}
                      className="number-input"
                    />
                    {totalAssets && (
                      <p className="text-sm text-gray-500">{formatToManWon(parseNumber(totalAssets))}만원 (원)</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalDebts">총 부채 (원)</Label>
                    <Input
                      id="totalDebts"
                      type="text"
                      placeholder="예: 100,000,000"
                      value={totalDebts}
                      onChange={(e) => handleInputChange(e.target.value, setTotalDebts)}
                      className="number-input"
                    />
                    {totalDebts && (
                      <p className="text-sm text-gray-500">{formatToManWon(parseNumber(totalDebts))}만원 (원)</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funeralExpenses">장례비용 (원)</Label>
                    <Input
                      id="funeralExpenses"
                      type="text"
                      placeholder="예: 10,000,000"
                      value={funeralExpenses}
                      onChange={(e) => handleInputChange(e.target.value, setFuneralExpenses)}
                      className="number-input"
                    />
                    {funeralExpenses && (
                      <p className="text-sm text-gray-500">{formatToManWon(parseNumber(funeralExpenses))}만원 (원)</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 상속인 정보 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    상속인 정보
                  </h3>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="spouseExists"
                      checked={spouseExists}
                      onChange={(e) => setSpouseExists(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="spouseExists">배우자 있음</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numChildren">자녀 수 (명)</Label>
                    <Input
                      id="numChildren"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={numChildren}
                      onChange={(e) => setNumChildren(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numOtherHeirs">기타 상속인 수 (명)</Label>
                    <Input
                      id="numOtherHeirs"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={numOtherHeirs}
                      onChange={(e) => setNumOtherHeirs(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <Calculator className="mr-2 h-5 w-5" />
                  상속세 계산하기
                </Button>
              </CardContent>
            </Card>

            {/* 실시간 계산 결과 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  실시간 계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">예상 상속세</div>
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(realTimeResults.finalTax)}원</div>
                    <div className="text-sm text-gray-500">({formatToManWon(realTimeResults.finalTax)}만원)</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">순자산</span>
                      <div className="text-right">
                        <div>{formatNumber(realTimeResults.netAssets)}원</div>
                        <div className="text-xs text-gray-500">({formatToManWon(realTimeResults.netAssets)}만원)</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">총 공제액</span>
                      <div className="text-right">
                        <div>{formatNumber(realTimeResults.totalDeduction)}원</div>
                        <div className="text-xs text-gray-500">
                          ({formatToManWon(realTimeResults.totalDeduction)}만원)
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">과세표준</span>
                      <div className="text-right">
                        <div>{formatNumber(realTimeResults.taxableAssets)}원</div>
                        <div className="text-xs text-gray-500">
                          ({formatToManWon(realTimeResults.taxableAssets)}만원)
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">산출세액</span>
                      <div className="text-right">
                        <div>{formatNumber(realTimeResults.grossTax)}원</div>
                        <div className="text-xs text-gray-500">({formatToManWon(realTimeResults.grossTax)}만원)</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    * 이 계산 결과는 참고용이며, 실제 세액과 다를 수 있습니다. 정확한 계산을 위해서는 전문가 상담을
                    받으시기 바랍니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">서비스 특징</h2>
            <p className="text-lg text-gray-600">세무법인 더봄의 전문적인 상속세 계산 서비스</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">정확한 계산</h3>
              <p className="text-gray-600">최신 세법을 반영한 정확한 상속세 계산 결과를 제공합니다.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">전문가 상담</h3>
              <p className="text-gray-600">세무 전문가의 1:1 맞춤 상담을 통해 최적의 절세 방안을 제시합니다.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">상세한 분석</h3>
              <p className="text-gray-600">계산 과정과 절세 포인트를 상세히 분석하여 제공합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">전문가 상담 문의</h2>
          <p className="text-lg text-gray-600 mb-8">상속세에 대한 궁금한 점이 있으시면 언제든 연락주세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">전화 상담</h3>
              <p className="text-gray-600 mb-4">평일 09:00 - 18:00</p>
              <p className="text-2xl font-bold text-blue-600">02-1234-5678</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">온라인 상담</h3>
              <p className="text-gray-600 mb-4">24시간 접수 가능</p>
              <Button className="bg-green-600 hover:bg-green-700">
                상담 신청하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
