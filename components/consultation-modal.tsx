"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Phone, Mail, MessageSquare, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: {
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
    giftAssetsTotal: number
    otherAssetsTotal: number
    financialDebtTotal: number
    funeralExpenseTotal: number
    taxArrearsTotal: number
    otherDebtTotal: number
    totalDeductions: number
    financialDeduction: number
    calculatedTax: number
    giftTaxCredit: number
    reportTaxCredit: number
    totalTaxCredit: number
    spouseDeductionAmount: number
  }
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    consultationType: "inheritance", // 'inheritance' | 'gift' | 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")

  // 네트워크 상태 확인
  const checkNetworkStatus = () => {
    setNetworkStatus(navigator.onLine ? "online" : "offline")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatNumber = (num: number): string => {
    if (num === 0) return "0만원"
    const inTenThousands = Math.round(num / 10000)
    return `${inTenThousands.toLocaleString()}만원`
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("이름을 입력해주세요.")
      return false
    }
    if (!formData.phone.trim()) {
      setErrorMessage("연락처를 입력해주세요.")
      return false
    }
    if (!/^[0-9-+\s()]+$/.test(formData.phone)) {
      setErrorMessage("올바른 연락처 형식을 입력해주세요.")
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("올바른 이메일 형식을 입력해주세요.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 네트워크 상태 확인
    checkNetworkStatus()
    if (networkStatus === "offline") {
      setErrorMessage("인터넷 연결을 확인해주세요.")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const submitData = {
        ...formData,
        calculationData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      console.log("상담 신청 데이터:", submitData)

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      console.log("응답 상태:", response.status)
      console.log("응답 헤더:", Object.fromEntries(response.headers.entries()))

      let responseData
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
        console.log("JSON 응답:", responseData)
      } else {
        const textResponse = await response.text()
        console.log("텍스트 응답:", textResponse)
        responseData = { message: textResponse }
      }

      if (response.ok) {
        setSubmitStatus("success")
        setTimeout(() => {
          onClose()
          setSubmitStatus("idle")
          setFormData({
            name: "",
            phone: "",
            email: "",
            message: "",
            consultationType: "inheritance",
          })
        }, 2000)
      } else {
        throw new Error(responseData.message || `서버 오류 (${response.status})`)
      }
    } catch (error) {
      console.error("상담 신청 오류:", error)
      setSubmitStatus("error")

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          setErrorMessage("네트워크 연결을 확인해주세요.")
        } else if (error.message.includes("timeout")) {
          setErrorMessage("요청 시간이 초과되었습니다. 다시 시도해주세요.")
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage("상담 신청 중 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-bold text-slate-900">전문가 상담 신청</CardTitle>
          <p className="text-sm text-slate-600">
            상속세 전문 세무사가 직접 상담해드립니다. 상담은 무료이며, 개인정보는 안전하게 보호됩니다.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {calculationData && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-slate-900">계산 결과 요약</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">총 재산가액:</span>
                  <span className="font-medium ml-2">{formatNumber(calculationData.totalAssets)}</span>
                </div>
                <div>
                  <span className="text-slate-600">최종 상속세:</span>
                  <span className="font-bold text-blue-600 ml-2">{formatNumber(calculationData.finalTax)}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                이메일 (선택)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="consultationType" className="text-sm font-medium">
                상담 유형
              </Label>
              <select
                id="consultationType"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.consultationType}
                onChange={(e) => handleInputChange("consultationType", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="inheritance">상속세 상담</option>
                <option value="gift">증여세 상담</option>
                <option value="general">일반 세무 상담</option>
              </select>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                상담 내용 (선택)
              </Label>
              <Textarea
                id="message"
                placeholder="상담받고 싶은 내용을 자세히 적어주세요..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            {errorMessage && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {submitStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  상담 신청이 완료되었습니다! 곧 연락드리겠습니다.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    신청 중...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    상담 신청하기
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                취소
              </Button>
            </div>
          </form>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-slate-900">다른 연락 방법</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="tel:02-336-0309"
                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-slate-600 mr-3" />
                <div>
                  <div className="font-medium text-slate-900">전화 상담</div>
                  <div className="text-sm text-slate-600">02-336-0309</div>
                </div>
              </a>
              <a
                href="mailto:contact@thebomtax.com"
                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-slate-600 mr-3" />
                <div>
                  <div className="font-medium text-slate-900">이메일 상담</div>
                  <div className="text-sm text-slate-600">contact@thebomtax.com</div>
                </div>
              </a>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <p className="mb-1">• 개인정보는 상담 목적으로만 사용되며, 상담 완료 후 안전하게 폐기됩니다.</p>
            <p className="mb-1">• 영업시간: 평일 09:00 - 18:00 (점심시간 12:00 - 13:00)</p>
            <p>• 상담은 무료이며, 추가 서비스 이용 시에만 비용이 발생합니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
