"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, User, MessageSquare, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: any
}

export function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      toast({
        title: "입력 오류",
        description: "이름과 연락처는 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData = {
        ...formData,
        calculationData: calculationData
          ? {
              totalAssets: calculationData.totalAssets,
              totalDebts: calculationData.totalDebts,
              funeralExpenses: calculationData.funeralExpenses,
              netAssets: calculationData.netAssets,
              spouseExists: calculationData.spouseExists,
              numChildren: calculationData.numChildren,
              numOtherHeirs: calculationData.numOtherHeirs,
              finalTax: calculationData.finalTax,
            }
          : null,
        submittedAt: new Date().toISOString(),
      }

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "상담 신청 완료",
          description: "상담 신청이 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.",
        })

        // 폼 초기화
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: "",
        })

        onClose()

        // 성공 페이지로 이동
        window.location.href = "/consultation-success"
      } else {
        throw new Error(result.error || "상담 신청에 실패했습니다.")
      }
    } catch (error) {
      console.error("상담 신청 오류:", error)
      toast({
        title: "상담 신청 실패",
        description: error instanceof Error ? error.message : "상담 신청 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            전문가 상담 신청
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              이름 *
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

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="mr-1 h-4 w-4" />
              연락처 *
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

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="mr-1 h-4 w-4" />
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

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4" />
              상담 내용
            </Label>
            <Textarea
              id="message"
              placeholder="상담받고 싶은 내용을 자유롭게 작성해주세요."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={4}
            />
          </div>

          {calculationData && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">📊 계산 결과 포함</p>
              <p className="text-xs text-blue-600">방금 계산하신 상속세 결과가 상담 신청과 함께 전송됩니다.</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  신청 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  상담 신청
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded mt-4">
          <p className="font-medium mb-1">📞 연락 안내</p>
          <p>• 평일 오전 9시 ~ 오후 6시 내 연락드립니다.</p>
          <p>• 상담은 무료이며, 개인정보는 안전하게 보호됩니다.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
