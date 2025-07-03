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

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: any
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

      let result
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        // If response is not JSON, treat as success
        result = { success: true }
      }

      if (result.success) {
        setSubmitStatus("success")
        setFormData({ name: "", phone: "", email: "", message: "" })
        setTimeout(() => {
          onClose()
          setSubmitStatus("idle")
        }, 2000)
      } else {
        setSubmitStatus("error")
        setErrorMessage(result.message || "상담 신청 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Consultation submission error:", error)
      setSubmitStatus("error")
      setErrorMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">전문가 상담 신청</DialogTitle>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">상담 신청이 완료되었습니다!</h3>
            <p className="text-slate-600 mb-4">빠른 시일 내에 연락드리겠습니다.</p>
            <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-900 text-white">
              확인
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                성함 *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                연락처 *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                상담 내용
              </Label>
              <Textarea
                id="message"
                placeholder="상담받고 싶은 내용을 자유롭게 작성해주세요."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            {submitStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
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
              <Button
                type="submit"
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isSubmitting}
              >
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

            <div className="text-xs text-slate-500 text-center pt-2">
              개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
