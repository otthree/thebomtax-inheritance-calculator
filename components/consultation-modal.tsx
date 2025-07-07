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
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Loader2 } from "lucide-react"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData: any
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
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
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          calculationData,
          timestamp: new Date().toISOString(),
        }),
      })

      // Always attempt to read the body as text first.
      const raw = await response.text()
      console.log("Server response:", raw)

      // If JSON parse succeeds, use it; otherwise fabricate a minimal object.
      let parsed: any
      try {
        parsed = raw ? JSON.parse(raw) : {}
      } catch (parseError) {
        console.log("JSON parse failed:", parseError)
        parsed = {}
      }

      // Normalise the success flag.
      const ok = (response.ok && (parsed.success === undefined ? true : parsed.success)) || parsed.success === true

      if (ok) {
        // 성공 시 consultation-success 페이지로 이동
        onClose()
        router.push("/consultation-success")
      } else {
        // 더 구체적인 오류 메시지 제공
        let errorMsg = "상담 신청에 실패했습니다."

        if (response.status >= 500) {
          errorMsg = "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        } else if (response.status >= 400) {
          errorMsg = parsed.message || "입력하신 정보를 확인해주세요."
        }

        throw new Error(errorMsg)
      }
    } catch (err) {
      console.error("Consultation submission error:", err)
      setSubmitStatus("error")

      if (err instanceof TypeError && err.message.includes("fetch")) {
        setErrorMessage("네트워크 연결을 확인해주세요.")
      } else {
        setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
      }
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
                <p className="text-xs text-muted-foreground">수집된 개인정보는 상담 목적으로만 사용됩니다.</p>
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
              • 수집항목: 이름, 연락처, 상담내용
              <br />• 수집목적: 상속세 관련 전문 상담 제공
              <br />• 보유기간: 상담 완료 후 3년
              <br />• 귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으나, 동의를 거부할 경우 상담 서비스
              이용이 제한될 수 있습니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
