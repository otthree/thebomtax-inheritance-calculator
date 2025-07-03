"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Phone, MessageCircle } from "lucide-react"

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
  giftAssetsTotal?: number
  otherAssetsTotal: number
  financialDebtTotal: number
  funeralExpenseTotal: number
  taxArrearsTotal: number
  otherDebtTotal: number
  totalDeductions: number
  financialDeduction: number
  calculatedTax?: number
  giftTaxCredit?: number
  reportTaxCredit?: number
  totalTaxCredit?: number
  spouseDeductionAmount?: number
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      console.log("상담 신청 데이터 전송 시작:", {
        formData,
        calculationData: calculationData ? "있음" : "없음",
      })

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

      console.log("API 응답 상태:", response.status, response.statusText)
      console.log("응답 헤더:", Object.fromEntries(response.headers.entries()))

      let responseData
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
        console.log("JSON 응답 데이터:", responseData)
      } else {
        const textResponse = await response.text()
        console.log("텍스트 응답:", textResponse)
        responseData = { message: textResponse }
      }

      if (response.ok) {
        console.log("상담 신청 성공")
        setSubmitStatus("success")
        setFormData({ name: "", phone: "", email: "", message: "" })

        // 3초 후 모달 닫기
        setTimeout(() => {
          onClose()
          setSubmitStatus("idle")
        }, 3000)
      } else {
        console.error("상담 신청 실패:", response.status, responseData)
        setSubmitStatus("error")
        setErrorMessage(responseData.message || `서버 오류 (${response.status})`)
      }
    } catch (error) {
      console.error("상담 신청 중 오류 발생:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num === 0) return "0만원"
    const inTenThousands = Math.round(num / 10000)
    return `${inTenThousands.toLocaleString()}만원`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">전문가 상담 신청</DialogTitle>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">상담 신청이 완료되었습니다!</h3>
            <p className="text-slate-600 mb-4">
              빠른 시일 내에 전문 세무사가 연락드리겠습니다.
              <br />
              평일 오전 9시~오후 6시 내에 연락드립니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Phone className="w-4 h-4" />
                <span className="font-medium">긴급 상담: 02-336-0309</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {calculationData && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">계산 결과 요약</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>상속재산 총액:</span>
                    <span className="font-medium">{formatNumber(calculationData.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>예상 상속세:</span>
                    <span className="font-medium text-blue-600">{formatNumber(calculationData.finalTax)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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
                  <br />
                  <br />
                  문제가 지속되면 직접 연락주세요: 02-336-0309
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    상담 신청
                  </>
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
