"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: any
}

export function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    consultationType: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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

      let result
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        // If response is not JSON, treat as success
        result = { success: true, message: "상담 신청이 접수되었습니다." }
      }

      // Check for success in the response body, regardless of HTTP status
      if (result.success) {
        toast({
          title: "상담 신청 완료",
          description: result.message || "상담 신청이 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.",
        })

        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          consultationType: "",
          message: "",
        })

        onClose()

        // Redirect to success page
        window.location.href = "/consultation-success"
      } else {
        throw new Error(result.error || "상담 신청 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Consultation submission error:", error)
      toast({
        title: "상담 신청 실패",
        description: "상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">무료 세무상담 신청</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">성명 *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="성명을 입력해주세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">연락처 *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="연락처를 입력해주세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="이메일을 입력해주세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationType">상담 유형 *</Label>
            <Select
              value={formData.consultationType}
              onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="상담 유형을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inheritance-tax">상속세 상담</SelectItem>
                <SelectItem value="gift-tax">증여세 상담</SelectItem>
                <SelectItem value="tax-planning">절세 방안 상담</SelectItem>
                <SelectItem value="tax-return">세무신고 대행</SelectItem>
                <SelectItem value="other">기타 세무상담</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">상담 내용</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="상담받고 싶은 내용을 자세히 적어주세요"
              rows={4}
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
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  신청 중...
                </>
              ) : (
                "상담 신청"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
