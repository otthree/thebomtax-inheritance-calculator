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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      alert("이름과 연락처는 필수 입력 항목입니다.")
      return
    }

    setIsSubmitting(true)

    try {
      // 구글 시트로 데이터 전송 → Next.js API Route 경유
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
          calculationData: calculationData,
        }),
      })

      if (!response.ok) {
        throw new Error("API Route Error: " + response.statusText)
      }

      const result = await response.json()

      if (result.success) {
        // 성공 페이지로 이동
        router.push("/consultation-success")
        onClose()
      } else {
        throw new Error(result.message || "데이터 전송에 실패했습니다.")
      }
    } catch (error) {
      console.error("상담 신청 오류:", error)
      alert("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">전문가 상담 신청</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 상담 신청 폼 */}
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
              <Label htmlFor="message" className="text-sm font-medium">
                상담 내용
              </Label>
              <Textarea
                id="message"
                placeholder="상담받고 싶은 내용을 자세히 적어주세요."
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
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
