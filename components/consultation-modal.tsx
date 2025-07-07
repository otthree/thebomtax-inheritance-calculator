"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          calculationData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "서버 오류가 발생했습니다." }))
        throw new Error(errorData.error || "상담 신청에 실패했습니다.")
      }

      setSubmitStatus("success")
      setTimeout(() => {
        onClose()
        setFormData({ name: "", phone: "", email: "", message: "" })
        setSubmitStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("상담 신청 오류:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "상담 신청 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const convertWonToKoreanAmount = (amount: number): string => {
    amount = amount / 10000
    if (amount === 0) return "0(원)"

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
    return `${amount < 0 ? "-" : ""}${koreanAmount}(원)`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">상속세 전문 상담 신청</DialogTitle>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">상담 신청이 완료되었습니다!</h3>
            <p className="text-gray-600">빠른 시일 내에 전문 세무사가 연락드리겠습니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {calculationData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">📊 계산 결과 요약</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">총 재산가액:</span>
                    <span className="font-medium ml-2">
                      {convertWonToKoreanAmount(calculationData.totalAssets * 10000)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">총 채무:</span>
                    <span className="font-medium ml-2">
                      {convertWonToKoreanAmount(calculationData.totalDebt * 10000)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">순 재산가액:</span>
                    <span className="font-medium ml-2">
                      {convertWonToKoreanAmount(calculationData.netAssets * 10000)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">최종 상속세:</span>
                    <span className="font-bold text-blue-900 ml-2">
                      {convertWonToKoreanAmount(calculationData.finalTax * 10000)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  성명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  연락처 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                상담 내용
              </Label>
              <Textarea
                id="message"
                placeholder="상속세 관련 궁금한 사항이나 상담받고 싶은 내용을 자유롭게 작성해주세요."
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>

            {submitStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                <div className="font-medium mb-1">📞 개인정보 수집 및 이용 안내</div>
                <ul className="text-xs space-y-1">
                  <li>• 수집목적: 상속세 상담 서비스 제공</li>
                  <li>• 수집항목: 성명, 연락처, 이메일, 상담내용</li>
                  <li>• 보유기간: 상담 완료 후 1년</li>
                  <li>• 상담 신청 시 개인정보 수집에 동의한 것으로 간주됩니다.</li>
                </ul>
              </AlertDescription>
            </Alert>

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
              <Button
                type="submit"
                className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                disabled={isSubmitting || !formData.name || !formData.phone}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    신청 중...
                  </>
                ) : (
                  "상담 신청하기"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
