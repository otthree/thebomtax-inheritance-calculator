"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface CalculationData {
  totalAssets?: number
  totalDebt?: number
  netAssets?: number
  taxableAmount?: number
  taxRate?: number
  progressiveDeduction?: number
  finalTax?: number
  basicDeduction?: boolean
  spouseDeduction?: boolean
  housingDeduction?: boolean
  realEstateTotal?: number
  financialAssetsTotal?: number
  giftAssetsTotal?: number
  otherAssetsTotal?: number
  financialDebtTotal?: number
  funeralExpenseTotal?: number
  taxArrearsTotal?: number
  otherDebtTotal?: number
  totalDeductions?: number
  financialDeduction?: number
  calculatedTax?: number
  giftTaxCredit?: number
  reportTaxCredit?: number
  totalTaxCredit?: number
}

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: CalculationData
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
        }),
      })

      const responseText = await response.text()
      console.log("서버 응답:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError)
        throw new Error(`서버 응답을 파싱할 수 없습니다: ${responseText}`)
      }

      if (response.ok && result.success) {
        setSubmitStatus("success")
        setFormData({ name: "", phone: "", message: "" })
        setTimeout(() => {
          onClose()
          setSubmitStatus("idle")
        }, 2000)
      } else {
        throw new Error(result.error || result.message || "상담 신청에 실패했습니다.")
      }
    } catch (error) {
      console.error("상담 신청 오류:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "0"
    const rounded = Math.round(num / 10000)
    return rounded.toLocaleString("ko-KR")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">전문가 상담 신청</DialogTitle>
        </DialogHeader>

        {submitStatus === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">상담 신청 실패: {errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                이름 *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                연락처 *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              상담 내용
            </Label>
            <Textarea
              id="message"
              placeholder="상담받고 싶은 내용을 자유롭게 작성해주세요."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {calculationData && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 text-slate-900">계산 결과 요약</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">총 재산가액:</span>
                  <span className="font-medium ml-2">{formatNumber(calculationData.totalAssets)}만원</span>
                </div>
                <div>
                  <span className="text-slate-600">총 채무:</span>
                  <span className="font-medium ml-2">{formatNumber(calculationData.totalDebt)}만원</span>
                </div>
                <div>
                  <span className="text-slate-600">과세표준:</span>
                  <span className="font-medium ml-2">{formatNumber(calculationData.taxableAmount)}만원</span>
                </div>
                <div>
                  <span className="text-slate-600 font-bold">최종 상속세:</span>
                  <span className="font-bold text-blue-600 ml-2">{formatNumber(calculationData.finalTax)}만원</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-transparent"
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-slate-800 hover:bg-slate-900">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  신청 중...
                </>
              ) : (
                "상담 신청"
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-slate-500 mt-4">
          <p>• 상담 신청 후 1-2일 내에 연락드립니다.</p>
          <p>• 개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
