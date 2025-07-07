"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Phone, Mail, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: {
    totalAssets: number
    totalDebt: number
    netAssets: number
    taxableAmount: number
    taxRate: number
    progressiveDeduction: number
    finalTax: number
    basicDeduction: boolean
    spouseDeduction: boolean
    housingDeduction: boolean
    realEstateTotal: number
    financialAssetsTotal: number
    giftAssetsTotal: number
    otherAssetsTotal: number
    financialDebtTotal: number
    funeralExpenseTotal: number
    taxArrearsTotal: number
    otherDebtTotal: number
    totalDeductions: number
    financialDeduction: number
    calculatedTax: number
    giftTaxCredit: number
    reportTaxCredit: number
    totalTaxCredit: number
    spouseDeductionAmount: number
  }
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const convertWonToKoreanAmount = (amount: number): string => {
    amount = amount / 10000
    if (amount === 0) return "0만원"

    const units = ["", "만", "억", "조"]
    const result = []
    let tempAmount = Math.abs(amount)

    for (let i = 0; i < units.length && tempAmount > 0; i++) {
      const remainder = tempAmount % 10000
      if (remainder > 0) {
        result.unshift(`${remainder.toLocaleString("ko-KR")}${units[i]}`)
      }
      tempAmount = Math.floor(tempAmount / 10000)
    }

    const koreanAmount = result.join(" ")
    return `${amount < 0 ? "-" : ""}${koreanAmount}원`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const consultationPayload = {
        ...formData,
        calculationData: calculationData
          ? {
              ...calculationData,
              // 계산 결과를 한국어 형식으로 변환
              finalTaxFormatted: convertWonToKoreanAmount(calculationData.finalTax * 10000),
              totalAssetsFormatted: convertWonToKoreanAmount(calculationData.totalAssets * 10000),
              netAssetsFormatted: convertWonToKoreanAmount(calculationData.netAssets * 10000),
              taxableAmountFormatted: convertWonToKoreanAmount(calculationData.taxableAmount * 10000),
            }
          : null,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "상담 신청에 실패했습니다.")
      }

      setSubmitStatus("success")

      // 성공 후 2초 뒤에 상담 완료 페이지로 이동
      setTimeout(() => {
        onClose()
        router.push("/consultation-success")
      }, 2000)
    } catch (error) {
      console.error("상담 신청 오류:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "상담 신청 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDirectCall = () => {
    window.location.href = "tel:02-336-0309"
  }

  if (submitStatus === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">상담 신청이 완료되었습니다!</h3>
            <p className="text-gray-600 mb-4">
              빠른 시일 내에 연락드리겠습니다.
              <br />
              <span className="text-sm text-gray-500">잠시 후 상담 완료 페이지로 이동합니다...</span>
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">무료 상속세 상담 신청</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 연락처 정보 */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">📞 직접 상담 문의</h3>
            <div className="space-y-2">
              <div className="flex items-center text-slate-700">
                <Phone className="w-4 h-4 mr-2" />
                <span className="font-medium">02-336-0309</span>
                <Button
                  onClick={handleDirectCall}
                  size="sm"
                  className="ml-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  전화걸기
                </Button>
              </div>
              <div className="flex items-center text-slate-700">
                <Mail className="w-4 h-4 mr-2" />
                <span>deobom@naver.com</span>
              </div>
            </div>
          </div>

          {/* 계산 결과 요약 */}
          {calculationData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">📊 계산 결과 요약</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">최종 상속세:</span>
                  <div className="font-bold text-blue-600">
                    {convertWonToKoreanAmount(calculationData.finalTax * 10000)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">순 재산가액:</span>
                  <div className="font-medium">{convertWonToKoreanAmount(calculationData.netAssets * 10000)}</div>
                </div>
              </div>
            </div>
          )}

          {/* 상담 신청 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="홍길동"
                />
              </div>
              <div>
                <Label htmlFor="phone">연락처 *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label htmlFor="message">상담 내용</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="상속세 관련 궁금한 점이나 상담받고 싶은 내용을 자유롭게 작성해주세요."
                rows={4}
              />
            </div>

            {submitStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>상담 신청 실패</strong>
                  <br />
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1 bg-slate-700 hover:bg-slate-800" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    신청 중...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    상담 신청하기
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500 text-center">
            * 개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
