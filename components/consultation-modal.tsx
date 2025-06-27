"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2 } from "lucide-react"

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  calculationData?: any // 일단 any로 받아서 디버깅
}

export default function ConsultationModal({ isOpen, onClose, calculationData }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    phone1: "010",
    phone2: "",
    phone3: "",
    inquiry: "",
    privacyAgreed: false,
  })

  const [errors, setErrors] = useState({
    companyName: false,
    phone2: false,
    phone3: false,
    inquiry: false,
    privacyAgreed: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 숫자 포맷팅 함수 - 안전하게 처리
  const formatNumber = (num: any) => {
    if (!num || isNaN(num) || num === undefined || num === null) {
      return "0"
    }
    const number = Number(num)
    return Math.round(number / 10) * 10 // 10원 단위 반올림
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    const newErrors = {
      companyName: !formData.companyName.trim(),
      phone2: !formData.phone2.trim(),
      phone3: !formData.phone3.trim(),
      inquiry: !formData.inquiry.trim(),
      privacyAgreed: !formData.privacyAgreed,
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error)) {
      return
    }

    setIsSubmitting(true)

    try {
      // 계산 데이터 디버깅
      console.log("=== 계산 데이터 디버깅 ===")
      console.log("전체 calculationData:", calculationData)

      // 안전하게 값 추출
      const totalAssets = calculationData?.totalAssets || 0
      const totalDebt = calculationData?.totalDebt || 0
      const finalTax = calculationData?.finalTax || 0
      const netAssets = calculationData?.netAssets || 0
      const taxableAmount = calculationData?.taxableAmount || 0
      const calculatedTax = calculationData?.calculatedTax || 0

      console.log("추출된 값들:")
      console.log("총 재산가액:", totalAssets)
      console.log("총 채무:", totalDebt)
      console.log("최종 상속세:", finalTax)

      // 구글시트에 보낼 데이터 구성
      const submitData = {
        timestamp: new Date().toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        companyName: formData.companyName,
        phone: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
        inquiry: `${formData.inquiry}

=== 상속세 계산 결과 ===
총 재산가액: ${formatNumber(totalAssets).toLocaleString()}원
총 채무: ${formatNumber(totalDebt).toLocaleString()}원
순 재산가액: ${formatNumber(netAssets).toLocaleString()}원
과세표준: ${formatNumber(taxableAmount).toLocaleString()}원
산출세액: ${formatNumber(calculatedTax).toLocaleString()}원
최종 상속세: ${formatNumber(finalTax).toLocaleString()}원

공제 적용:
- 일괄공제: ${calculationData?.basicDeduction ? "적용" : "미적용"}
- 배우자공제: ${calculationData?.spouseDeduction ? "적용" : "미적용"}  
- 동거주택공제: ${calculationData?.housingDeduction ? "적용" : "미적용"}`,
        source: "상속세 계산기",
      }

      console.log("구글시트 전송 데이터:", submitData)

      // 환경변수에서 구글 스크립트 URL 가져오기
      const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        console.log("구글 스크립트 URL이 설정되지 않았습니다.")
        alert("구글 시트 연동이 설정되지 않았습니다. 관리자에게 문의해주세요.")
        return
      }

      console.log("구글 스크립트 URL:", GOOGLE_SCRIPT_URL)

      // 구글 시트에 데이터 전송
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // CORS 문제 해결
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      console.log("구글 시트 전송 완료")

      // 폼 초기화
      setFormData({
        companyName: "",
        phone1: "010",
        phone2: "",
        phone3: "",
        inquiry: "",
        privacyAgreed: false,
      })

      setErrors({
        companyName: false,
        phone2: false,
        phone3: false,
        inquiry: false,
        privacyAgreed: false,
      })

      onClose()

      // 성공 페이지로 이동
      window.location.href = "/consultation-success"
    } catch (error) {
      console.error("상담 신청 중 오류:", error)
      alert("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: false }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">CONTACT</h2>
            <p className="text-sm text-slate-600 mt-1">
              양식을 남겨주시면 전문 세무사들이
              <br />
              무료로 상담 도와드리겠습니다
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 계산 결과 미리보기 */}
        {calculationData && (
          <div className="p-6 bg-slate-50 border-b">
            <h3 className="text-lg font-semibold mb-3">계산 결과 요약</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">총 재산가액:</span>
                <span className="font-medium ml-2">{formatNumber(calculationData.totalAssets).toLocaleString()}원</span>
              </div>
              <div>
                <span className="text-slate-600">최종 상속세:</span>
                <span className="font-medium ml-2 text-red-600">
                  {formatNumber(calculationData.finalTax).toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 회사명 or 고객명 */}
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium">
              <span className="text-red-500">*</span> 회사 or 고객명
            </Label>
            <Input
              id="companyName"
              placeholder="회사명을 입력해주세요"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className={`mt-1 ${errors.companyName ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">회사명 또는 고객명을 입력해주세요.</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <Label className="text-sm font-medium">
              <span className="text-red-500">*</span> 전화번호
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={formData.phone1}
                onChange={(e) => handleInputChange("phone1", e.target.value)}
                className="w-20"
                maxLength={3}
                disabled={isSubmitting}
              />
              <span>-</span>
              <Input
                placeholder="0000"
                value={formData.phone2}
                onChange={(e) => handleInputChange("phone2", e.target.value)}
                className={`flex-1 ${errors.phone2 ? "border-red-500" : ""}`}
                maxLength={4}
                disabled={isSubmitting}
              />
              <span>-</span>
              <Input
                placeholder="0000"
                value={formData.phone3}
                onChange={(e) => handleInputChange("phone3", e.target.value)}
                className={`flex-1 ${errors.phone3 ? "border-red-500" : ""}`}
                maxLength={4}
                disabled={isSubmitting}
              />
            </div>
            {(errors.phone2 || errors.phone3) && (
              <p className="text-red-500 text-xs mt-1">전화번호를 모두 입력해주세요.</p>
            )}
          </div>

          {/* 문의내용 */}
          <div>
            <Label htmlFor="inquiry" className="text-sm font-medium">
              <span className="text-red-500">*</span> 문의내용
            </Label>
            <Textarea
              id="inquiry"
              placeholder="문의내용을 입력해주세요"
              value={formData.inquiry}
              onChange={(e) => handleInputChange("inquiry", e.target.value)}
              className={`mt-1 min-h-[120px] ${errors.inquiry ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {errors.inquiry && <p className="text-red-500 text-xs mt-1">문의내용을 입력해주세요.</p>}
          </div>

          {/* 개인정보 수집 및 이용 동의 */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="privacyAgreed"
              checked={formData.privacyAgreed}
              onChange={(e) => handleInputChange("privacyAgreed", e.target.checked)}
              className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1 ${
                errors.privacyAgreed ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            <div>
              <label htmlFor="privacyAgreed" className="text-sm">
                <span className="text-red-500">*</span> 개인정보 수집 및 이용에 동의합니다
              </label>
              {errors.privacyAgreed && (
                <p className="text-red-500 text-xs mt-1">개인정보 수집 및 이용에 동의해주세요.</p>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
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
            <Button type="submit" className="flex-1 bg-slate-700 hover:bg-slate-800 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  신청 중...
                </>
              ) : (
                "상담 신청하기"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
