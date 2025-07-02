"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData: any
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!privacyAgreed) {
      setSubmitStatus("error")
      setErrorMessage("개인정보 수집 및 이용에 동의해주세요.")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const submissionData = {
        ...formData,
        calculationData,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      let result
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        try {
          result = await response.json()
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError)
          if (response.ok) {
            result = { success: true, message: "상담 신청이 완료되었습니다." }
          } else {
            throw new Error("서버 응답을 처리할 수 없습니다.")
          }
        }
      } else {
        const textResponse = await response.text()
        console.log("Non-JSON response received:", textResponse)

        if (response.ok) {
          result = { success: true, message: "상담 신청이 완료되었습니다." }
        } else {
          throw new Error("서버에서 오류가 발생했습니다.")
        }
      }

      if (result.success) {
        setSubmitStatus("success")
        setFormData({ name: "", phone: "", email: "", message: "" })
        setPrivacyAgreed(false)
      } else {
        setSubmitStatus("error")
        setErrorMessage(result.message || "상담 신청 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Consultation submission error:", error)
      setSubmitStatus("error")
      setErrorMessage("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">전문가 상담 신청</DialogTitle>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">상담 신청이 완료되었습니다!</h3>
            <p className="text-gray-600 mb-6">
              빠른 시일 내에 연락드리겠습니다.
              <br />
              추가 문의사항이 있으시면 02-336-0309로 연락해주세요.
            </p>
            <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-800">
              확인
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <Label htmlFor="message">상담 내용</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="상담받고 싶은 내용을 자세히 적어주세요."
                  rows={4}
                />
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="privacy-agreement"
                  checked={privacyAgreed}
                  onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="privacy-agreement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    개인정보 수집 및 이용에 동의합니다 *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    수집된 개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.
                  </p>
                </div>
              </div>

              {submitStatus === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
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
                  className="flex-1 bg-slate-700 hover:bg-slate-800"
                  disabled={isSubmitting || !privacyAgreed}
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
            </form>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">개인정보 처리 안내</p>
              <p>
                • 수집항목: 이름, 연락처, 이메일, 상담내용
                <br />• 수집목적: 상속세 관련 전문 상담 제공
                <br />• 보유기간: 상담 완료 후 1년 (관련 법령에 따라 연장 가능)
                <br />• 귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으나, 동의를 거부할 경우 상담 서비스
                이용이 제한될 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
