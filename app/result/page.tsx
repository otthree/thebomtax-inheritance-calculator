"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Share2, Copy, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ConsultationModal from "@/components/consultation-modal"
import { Footer } from "@/components/footer"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string"

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface FormData {
  realEstate: string
  businessProperty: string
  land: string
  otherRealEstate: string
  giftRealEstate: string
  giftOther: string
  deposit: string
  savings: string
  stocks: string
  funds: string
  bonds: string
  crypto: string
  vehicle: string
  lifeInsurance: string
  pensionInsurance: string
  jewelry: string
  otherAssets: string
  mortgageLoan: string
  creditLoan: string
  cardDebt: string
  funeralExpense: string
  taxArrears: string
  otherDebt: string
  basicDeduction: boolean
  spouseDeduction: boolean
  housingDeduction: boolean
}

interface CalculationResult {
  realEstateTotal: number
  financialAssetsTotal: number
  insuranceTotal: number
  businessAssetsTotal: number
  movableAssetsTotal: number
  otherAssetsTotal: number
  totalAssets: number
  financialDebtTotal: number
  funeralExpenseTotal: number
  taxArrearsTotal: number
  otherDebtTotal: number
  totalDebt: number
  netAssets: number
  totalDeductions: number
  financialDeduction: number
  taxableAmount: number
  taxRate: number
  progressiveDeduction: number
  finalTax: number
  calculatedTax?: number
  giftTaxCredit?: number
  reportTaxCredit?: number
  totalTaxCredit?: number
  giftAssetsTotal?: number
  spouseDeductionAmount?: number
}

interface CalculationData {
  formData: FormData
  calculationResult: CalculationResult
  timestamp: string
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [calculationData, setCalculationData] = useState<CalculationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [shareButtonText, setShareButtonText] = useState("📤 공유")
  const [isSharing, setIsSharing] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  /* ------------------------------------------------------------------------ */
  /*                          Load data on first render                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const loadCalculationData = () => {
      // 1. Compressed data in URL (new approach)
      const compressedParam = searchParams.get("c")
      if (compressedParam) {
        try {
          const json = decompressFromEncodedURIComponent(compressedParam)
          if (json) {
            const parsed = JSON.parse(json)
            console.log("Compressed URL 데이터 로드:", parsed)
            setCalculationData(parsed)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error("Compressed URL 데이터 파싱 실패:", err)
        }
      }

      // 2. Uncompressed legacy ?data=
      const dataParam = searchParams.get("data")
      if (dataParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(dataParam))
          console.log("URL 파라미터에서 데이터 로드:", decoded)
          setCalculationData(decoded)
          setLoading(false)
          return
        } catch (error) {
          console.error("URL 파라미터 데이터 파싱 실패:", error)
        }
      }

      // 3. localStorage fallback
      try {
        const saved = localStorage.getItem("inheritanceTaxCalculation")
        if (saved) {
          const parsed = JSON.parse(saved)
          console.log("localStorage에서 데이터 로드:", parsed)
          setCalculationData(parsed)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("localStorage 데이터 파싱 실패:", error)
      }

      // 4. No data found – redirect home
      console.log("계산 데이터를 찾을 수 없음, 홈으로 리다이렉트")
      router.replace("/")
    }

    loadCalculationData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only once

  /* ------------------------------------------------------------------------ */
  /*                           Helper / share functions                       */
  /* ------------------------------------------------------------------------ */

  const convertWonToKoreanAmount = (amount: number): string => {
    amount /= 10000 // 1만원 단위
    if (amount === 0) return "0원"

    const units = ["", "만", "억", "조"]
    const result: string[] = []
    let tmp = Math.abs(amount)

    units.forEach((u, i) => {
      if (tmp <= 0) return
      const rem = tmp % 10000
      if (rem) result.unshift(`${rem.toLocaleString("ko-KR")}${u}`)
      tmp = Math.floor(tmp / 10000)
    })

    return `${amount < 0 ? "-" : ""}${result.join(" ")}원`
  }

  const generateShareUrl = () => {
    if (!calculationData) return ""
    const compressed = compressToEncodedURIComponent(JSON.stringify(calculationData))
    return `${window.location.origin}/result?c=${compressed}`
  }

  const handleCopyLink = async () => {
    if (!calculationData) return
    setIsSharing(true)
    try {
      const url = generateShareUrl()
      await navigator.clipboard.writeText(url)
      setShareButtonText("✅ 복사완료!")
      setTimeout(() => {
        setShareButtonText("📤 공유")
        setShowShareOptions(false)
      }, 2000)
    } catch {
      alert("링크 복사에 실패했습니다.")
    } finally {
      setIsSharing(false)
    }
  }

  const handleWebShare = async () => {
    if (!calculationData) return
    const url = generateShareUrl()
    const shareData = {
      title: "상속세 계산 결과",
      text: `상속세 계산 결과: ${convertWonToKoreanAmount(calculationData.calculationResult.finalTax * 10000)}`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await handleCopyLink()
      }
    } catch {
      /* user cancelled – ignore */
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                          Early-return loading states                     */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-32 w-32 border-b-2 border-slate-900 rounded-full animate-spin" />
          <p className="mt-4 text-slate-600">계산 결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!calculationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-slate-600">계산 데이터를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            계산기로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------------------ */
  /*                              Derived values                              */
  /* ------------------------------------------------------------------------ */

  const { calculationResult } = calculationData
  const calculatedTax = Math.round(calculationResult.taxableAmount * (calculationResult.taxRate / 100))
  const taxCredit = calculatedTax - calculationResult.finalTax

  /* ------------------------------------------------------------------------ */
  /*                                JSX Markup                                */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- Header ---------- */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo-deobom-blue.png" alt="세무법인 더봄" width={240} height={72} className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="font-medium text-base">02-336-0309</span>
            </div>
            <Button
              className="bg-slate-800 hover:bg-slate-900 text-white rounded-md px-6 py-3"
              onClick={() => setIsConsultationModalOpen(true)}
            >
              상담신청
            </Button>
          </div>
        </div>
      </header>

      {/* ---------- Sub-banner ---------- */}
      <div className="bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h2 className="text-lg font-semibold text-slate-900">상속세 계산기</h2>
          <p className="text-sm text-slate-600">2025년 기준 · 전문 세무사 검증 · 무료 서비스</p>
        </div>
      </div>

      {/* ---------- Main content ---------- */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title bar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">상속세 계산 결과</h1>
          <Button
            variant="outline"
            className="bg-slate-600 text-white border-slate-600 hover:bg-slate-700"
            onClick={() => router.push("/")}
          >
            다시 계산하기
          </Button>
        </div>

        {/* Final tax card */}
        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <p className="text-lg text-slate-600 mb-2">최종 상속세</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {convertWonToKoreanAmount(calculationResult.finalTax * 10000)}
            </p>
            <p className="text-sm text-slate-500">
              과세표준 {convertWonToKoreanAmount(calculationResult.taxableAmount * 10000)} × {calculationResult.taxRate}
              % - 누진공제 {convertWonToKoreanAmount(calculationResult.progressiveDeduction * 10000)}
            </p>
          </CardContent>
        </Card>

        {/* Calculation breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">상속세 계산 과정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                ["순 재산가액", calculationResult.netAssets, false],
                ["총 공제액", calculationResult.totalDeductions, true],
                ["과세표준", calculationResult.taxableAmount, false],
                ["적용 세율", `${calculationResult.taxRate.toFixed(1)}%`, false],
                ["산출세액", calculatedTax, false],
                ["세액공제", taxCredit, true],
              ].map(([label, value, minus]) => (
                <div key={label as string} className="flex justify-between py-2">
                  <span className="text-slate-600">{label}</span>
                  <span
                    className={`font-medium ${
                      minus ? "text-green-600" : typeof value === "number" ? "" : "text-slate-600"
                    }`}
                  >
                    {typeof value === "number"
                      ? `${minus ? "-" : ""}${convertWonToKoreanAmount((value as number) * 10000)}`
                      : value}
                  </span>
                </div>
              ))}

              <hr />

              <div className="flex justify-between py-2 font-bold text-lg">
                <span className="text-slate-600">최종 상속세</span>
                <span className="text-blue-600">{convertWonToKoreanAmount(calculationResult.finalTax * 10000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2"
            onClick={() => setIsConsultationModalOpen(true)}
          >
            상담신청 하기
          </Button>

          <div className="relative">
            <Button
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2"
              onClick={() => setShowShareOptions((p) => !p)}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <div className="h-4 w-4 mr-2 border-b-2 border-white rounded-full animate-spin" /> 생성중...
                </>
              ) : (
                shareButtonText
              )}
            </Button>

            {showShareOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <Button variant="ghost" className="w-full justify-start" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" /> 링크 복사
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleWebShare}>
                    <Share2 className="w-4 h-4 mr-2" /> 공유하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notices */}
        {searchParams.get("c") && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <Share2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🔗 압축된 URL로 공유됨</strong>
              <br />이 페이지는 압축 URL을 통해 공유된 계산 결과입니다.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">상속세 수수료가 궁금하신가요?</h3>
            <p className="text-sm text-slate-600 mb-4">세무법인 더봄은 수수료를 투명하게 공개합니다.</p>
            <Button
              onClick={() => window.open("https://blog.naver.com/l77155/223777746014", "_blank", "noopener,noreferrer")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              💰 수수료 확인하러가기
            </Button>
          </CardContent>
        </Card>

        <Alert className="mb-8 bg-yellow-50 border-yellow-300">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-2">⚠️ 주의사항</div>
            <ul className="text-sm space-y-1">
              <li>• 이 결과는 참고용이며, 실제 상속세는 세무사와 상담하시기 바랍니다.</li>
              <li>• 증여 합산, 특수관계인 공제 등 추가적인 요소가 있을 수 있습니다.</li>
              <li>• 세법 개정에 따라 계산 기준이 변경될 수 있습니다.</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* ---------- Mobile phone FAB ---------- */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <a
          href="tel:02-336-0309"
          aria-label="전화걸기"
          className="h-14 w-14 flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>

      {/* ---------- Dialog / Footer ---------- */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={{
          totalAssets: calculationResult.totalAssets,
          totalDebt: calculationResult.totalDebt,
          netAssets: calculationResult.netAssets,
          taxableAmount: calculationResult.taxableAmount,
          taxRate: calculationResult.taxRate,
          progressiveDeduction: calculationResult.progressiveDeduction,
          finalTax: calculationResult.finalTax,
          basicDeduction: calculationData.formData.basicDeduction,
          spouseDeduction: calculationData.formData.spouseDeduction,
          housingDeduction: calculationData.formData.housingDeduction,
          realEstateTotal: calculationResult.realEstateTotal,
          financialAssetsTotal: calculationResult.financialAssetsTotal,
          giftAssetsTotal: calculationResult.giftAssetsTotal ?? 0,
          otherAssetsTotal: calculationResult.otherAssetsTotal,
          financialDebtTotal: calculationResult.financialDebtTotal,
          funeralExpenseTotal: calculationResult.funeralExpenseTotal,
          taxArrearsTotal: calculationResult.taxArrearsTotal,
          otherDebtTotal: calculationResult.otherDebtTotal,
          totalDeductions: calculationResult.totalDeductions,
          financialDeduction: calculationResult.financialDeduction,
          calculatedTax: calculationResult.calculatedTax ?? 0,
          giftTaxCredit: calculationResult.giftTaxCredit ?? 0,
          reportTaxCredit: calculationResult.reportTaxCredit ?? 0,
          totalTaxCredit: calculationResult.totalTaxCredit ?? 0,
          spouseDeductionAmount: calculationResult.spouseDeductionAmount ?? 0,
        }}
      />

      <Footer />
    </div>
  )
}
