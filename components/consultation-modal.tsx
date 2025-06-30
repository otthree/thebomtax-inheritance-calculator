"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: {
    totalAssets: number
    totalDebt: number
    netAssets: number
    taxableAmount: number
    finalTax: number
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
    basicDeduction: boolean
    spouseDeduction: boolean
    housingDeduction: boolean
    taxRate: number
    progressiveDeduction: number
    calculatedTax: number
    giftTaxCredit: number
    reportTaxCredit: number
    totalTaxCredit: number
    [key: string]: any
  }
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })

  const handleInputChange = (field: string, value: string) => {
    console.log(`폼 필드 변경: ${field} = ${value}`)
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== 상담 신청 제출 시작 ===")
    console.log("현재 폼 데이터:", formData)

    if (!formData.name || !formData.phone) {
      alert("이름과 연락처는 필수 입력 항목입니다.")
      return
    }

    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.")
      return
    }

    if (!formData.phone.trim()) {
      alert("연락처를 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        calculationData: calculationData,
      }

      console.log("서버로 전송할 데이터:", JSON.stringify(submitData, null, 2))

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(submitData),
      })

      console.log("서버 응답 상태:", response.status)
      console.log("서버 응답 헤더:", Object.fromEntries(response.headers.entries()))

      // 응답 본문 읽기 ─ content-type 헤더가 없더라도 JSON 문자열이면 직접 파싱
      const contentType = response.headers.get("content-type") || ""
      let result: any = {}

      if (contentType.includes("application/json")) {
        result = await response.json()
      } else {
        const raw = await response.text()
        try {
          result = JSON.parse(raw)
        } catch {
          console.error("Unexpected non-JSON response:", raw)
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
          return
        }
      }

      console.log("서버 응답 데이터:", result)

      if (!response.ok || !result?.success) {
        console.error("상담 신청 실패:", result)

        // 구체적인 오류 메시지 표시
        let errorMessage = result?.message || "상담 신청에 실패했습니다."

        if (result?.debug) {
          console.error("디버그 정보:", result.debug)

          // 개발자를 위한 구체적인 안내
          if (result.debug === "GOOGLE_SCRIPT_URL_NOT_CONFIGURED") {
            errorMessage = "Google Apps Script가 설정되지 않았습니다. 관리자에게 문의하세요."
          } else if (result.debug === "INVALID_GOOGLE_SCRIPT_URL_FORMAT") {
            errorMessage = "Google Apps Script 설정에 문제가 있습니다. 관리자에게 문의하세요."
          } else if (result.debug.includes("FETCH_FAILED")) {
            errorMessage = "Google Apps Script에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
          }
        }

        alert(errorMessage)
        return
      }

      console.log("상담 신청 성공:", result)

      // 폼 초기화
      setFormData({
        name: "",
        phone: "",
        message: "",
      })

      // 성공 시 페이지 이동
      router.push("/consultation-success")
      onClose()
    } catch (error) {
      console.error("상담 신청 오류:", error)
      alert("상담 신청 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">전문가 상담 신청</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  이름 <span className="text-red-500">*</span>
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
                  연락처 <span className="text-red-500">*</span>
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
                placeholder="상담받고 싶은 내용을 자세히 적어주세요."
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

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
                  "상담 신청"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
