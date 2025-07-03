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
import { AlertCircle, Loader2, CheckCircle, WifiOff } from "lucide-react"

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
    // 입력 시 에러 상태 초기화
    if (submitStatus === "error") {
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!privacyAgreed) {
      setSubmitStatus("error")
      setErrorMessage("개인정보 수집 및 이용에 동의해주세요.")
      return
    }

    // 전화번호 형식 간단 검증
    const phoneRegex = /^[0-9-+\s()]+$/
    if (!phoneRegex.test(formData.phone)) {
      setSubmitStatus("error")
      setErrorMessage("올바른 전화번호 형식을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      console.log("상담 신청 시작:", { name: formData.name, phone: formData.phone })

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          calculationData,
          timestamp: new Date().toISOString(),
        }),
      })

      console.log("API 응답 상태:", response.status)

      // ---------- 응답 본문 및 타입 확인 ----------
      let responseData: any = {}
      let responseText = ""

      const isJson = response.headers.get("content-type")?.toLowerCase().includes("application/json")

      try {
        if (isJson) {
          // JSON 응답인 경우
          responseData = await response.json()
          console.log("API JSON 응답:", responseData)
        } else {
          // JSON 이 아닌 경우 (예: 내부 서버 오류 HTML, 일반 텍스트 등)
          responseText = await response.text()
          console.warn("API 비-JSON 응답:", responseText.substring(0, 200))
          responseData = {
            success: false,
            message: responseText || "서버 응답 형식 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          }
        }
      } catch (parseError) {
        // JSON 파싱 실패 등 예외 처리
        console.error("응답 처리 실패:", parseError)
        responseData = {
          success: false,
          message: "서버 응답 처리 중 오류가 발생했습니다.",
        }
      }

      // 성공 처리
      if (response.ok && responseData.success !== false) {
        console.log("상담 신청 성공")
        setSubmitStatus("success")

        // 1초 후 성공 페이지로 이동
        setTimeout(() => {
          onClose()
          router.push("/consultation-success")
        }, 1000)
        return
      }

      // 실패 처리
      console.error("상담 신청 실패:", responseData)
      setSubmitStatus("error")

      // 구체적인 오류 메시지 설정
      let errorMsg = responseData.message || "상담 신청에 실패했습니다."

      // 상태 코드별 메시지 커스터마이징
      if (response.status === 400) {
        errorMsg = responseData.message || "입력하신 정보를 확인해주세요."
      } else if (response.status === 408) {
        errorMsg = "요청 시간이 초과되었습니다. 다시 시도해주세요."
      } else if (response.status === 503) {
        errorMsg = "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요."
      } else if (response.status >= 500) {
        errorMsg = "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      }

      setErrorMessage(errorMsg)
    } catch (err) {
      console.error("상담 신청 네트워크 오류:", err)
      setSubmitStatus("error")

      if (err instanceof TypeError && err.message.includes("fetch")) {
        setErrorMessage("네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.")
      } else if (err instanceof Error && err.name === "AbortError") {
        setErrorMessage("요청 시간이 초과되었습니다. 다시 시도해주세요.")
      } else {
        setErrorMessage("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorIcon = () => {
    if (errorMessage.includes("네트워크") || errorMessage.includes("인터넷")) {
      return <WifiOff className="h-4 w-4 text-red-600" />
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="privacy-agreement"
                checked={privacyAgreed}
                onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)}
                disabled={isSubmitting}
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

            {submitStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  상담 신청이 완료되었습니다! 곧 성공 페이지로 이동합니다.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                {getErrorIcon()}
                <AlertDescription className="text-red-800">
                  {errorMessage}
                  {errorMessage.includes("네트워크") && (
                    <div className="mt-2 text-sm">
                      • Wi-Fi 또는 모바일 데이터 연결을 확인해주세요
                      <br />• 잠시 후 다시 시도해주세요
                    </div>
                  )}
                </AlertDescription>
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
                disabled={isSubmitting || !privacyAgreed || submitStatus === "success"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    신청 중...
                  </>
                ) : submitStatus === "success" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    완료
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
