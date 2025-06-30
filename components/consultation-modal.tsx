"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ConsultationModalProps {
  calculationData?: any
}

export function ConsultationModal({ calculationData }: ConsultationModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    console.log(`폼 필드 변경: ${field} = ${value}`)
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("=== 상담 신청 시작 ===")
      console.log("폼 데이터:", formData)
      console.log("계산 데이터:", calculationData)

      // 데이터 검증
      if (!formData.name.trim()) {
        toast({
          title: "입력 오류",
          description: "이름을 입력해주세요.",
          variant: "destructive",
        })
        return
      }

      if (!formData.phone.trim()) {
        toast({
          title: "입력 오류",
          description: "전화번호를 입력해주세요.",
          variant: "destructive",
        })
        return
      }

      const submitData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        calculationData: calculationData || null,
        timestamp: new Date().toISOString(),
      }

      console.log("서버로 전송할 데이터:", JSON.stringify(submitData, null, 2))

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      console.log("서버 응답 상태:", response.status)
      console.log("서버 응답 헤더:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      let result

      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        /* 서버가 HTML 500을 돌려줄 가능성은 이제 거의 없지만
           방어적으로 텍스트만 받아서 사용자에게 안내 */
        const raw = await response.text()
        console.error("Non-JSON response:", raw.slice(0, 300))
        alert("서버 오류가 발생했습니다. 다시 시도해 주세요.")
        return
      }

      if (result.success) {
        console.log("상담 신청 성공:", result.message)
        toast({
          title: "신청 완료",
          description: result.message || "상담 신청이 접수되었습니다.",
        })

        // 폼 초기화 및 모달 닫기
        setFormData({ name: "", phone: "", message: "" })
        setOpen(false)
      } else {
        throw new Error(result.message || "상담 신청에 실패했습니다.")
      }
    } catch (error) {
      console.error("상담 신청 오류:", error)
      toast({
        title: "신청 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">상담 신청하기</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>상속세 상담 신청</DialogTitle>
          <DialogDescription>상속세 계산 결과를 바탕으로 전문가 상담을 신청하실 수 있습니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="성함을 입력해주세요"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">연락처 *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="연락 가능한 전화번호를 입력해주세요"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">상담 내용</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="상담받고 싶은 내용을 자세히 적어주세요"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "신청 중..." : "신청하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
