"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"

interface CalculationData {
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

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: CalculationData
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("이름과 전화번호를 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setError("")

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

      if (response.ok) {
        onClose()
        router.push("/consultation-success")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "상담 신청 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("상담 신청 오류:", error)
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
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
          <DialogTitle className="text-xl font-bold text-slate-900">전문가 상담 신청</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {calculationData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">계산 결과 요약</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">총 재산가액:</span>
                  <div className="font-medium">{convertWonToKoreanAmount(calculationData.totalAssets * 10000)}</div>
                </div>
                <div>
                  <span className="text-slate-600">총 부채:</span>
                  <div className="font-medium">{convertWonToKoreanAmount(calculationData.totalDebt * 10000)}</div>
                </div>
                <div>
                  <span className="text-slate-600">순 재산가액:</span>
                  <div className="font-medium">{convertWonToKoreanAmount(calculationData.netAssets * 10000)}</div>
                </div>
                <div>
                  <span className="text-slate-600">예상 상속세:</span>
                  <div className="font-bold text-blue-600">
                    {convertWonToKoreanAmount(calculationData.finalTax * 10000)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                이름 *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="이름을 입력해주세요"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                전화번호 *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                상담 내용 (선택사항)
              </Label>
              <Textarea
                id="message"
                placeholder="상담받고 싶은 내용을 자유롭게 작성해주세요"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
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
              <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900" disabled={isSubmitting}>
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

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
            <p className="font-medium mb-1">개인정보 처리 안내</p>
            <p>
              입력하신 개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 삭제됩니다. 자세한 내용은
              개인정보처리방침을 확인해주세요.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
