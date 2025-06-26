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
  calculationData?: {
    totalAssets: number
    totalDebt: number
    basicDeduction: boolean
    spouseDeduction: boolean
    housingDeduction: boolean
    financialDeduction: number
    finalTax: number
    realEstateTotal: number
    financialAssetsTotal: number
    insuranceTotal: number
    businessAssetsTotal: number
    movableAssetsTotal: number
    otherAssetsTotal: number
    financialDebtTotal: number
    funeralExpenseTotal: number
    taxArrearsTotal: number
    otherDebtTotal: number
    netAssets: number
    totalDeductions: number
    taxableAmount: number
    taxRate: number
    progressiveDeduction: number
  }
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

  const formatNumber = (num: number) => {
    // 10원 단위까지 반올림
    const rounded = Math.round(num / 10) * 10
    return rounded.toLocaleString("ko-KR")
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

    // 에러가 있으면 제출 중단
    if (Object.values(newErrors).some((error) => error)) {
      return
    }

    setIsSubmitting(true)

    try {
      // Google Apps Script 웹앱 URL - 환경변수 또는 기본값 사용
      const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "YOUR_GOOGLE_SCRIPT_URL_HERE"

      console.log("Google Script URL:", GOOGLE_SCRIPT_URL) // 디버깅용

      // 계산 데이터 포함한 상세 정보 구성
      let detailedInquiry = formData.inquiry

      if (calculationData) {
        // 0원이 아닌 항목들만 필터링하여 표시
        const assetItems = [
          { name: "부동산", value: calculationData.realEstateTotal },
          { name: "금융자산", value: calculationData.financialAssetsTotal },
          { name: "보험", value: calculationData.insuranceTotal },
          { name: "사업자산", value: calculationData.businessAssetsTotal },
          { name: "동산", value: calculationData.movableAssetsTotal },
          { name: "기타자산", value: calculationData.otherAssetsTotal },
        ].filter((item) => item.value > 0)

        const debtItems = [
          { name: "장례비", value: calculationData.funeralExpenseTotal },
          { name: "금융채무", value: calculationData.financialDebtTotal },
          { name: "세금미납", value: calculationData.taxArrearsTotal },
          { name: "기타채무", value: calculationData.otherDebtTotal },
        ].filter((item) => item.value > 0)

        detailedInquiry += `

=== 상속세 계산 결과 상세 ===

1단계: 총 재산가액 계산`

        // 0원이 아닌 자산 항목들만 표시
        assetItems.forEach((item) => {
          detailedInquiry += `
${item.name}: ${formatNumber(item.value)}원`
        })

        detailedInquiry += `
총 재산가액: ${formatNumber(calculationData.totalAssets)}원

2단계: 총 채무 계산`

        // 0원이 아닌 채무 항목들만 표시
        if (debtItems.length > 0) {
          debtItems.forEach((item) => {
            detailedInquiry += `
${item.name}: ${formatNumber(item.value)}원`
          })
        } else {
          detailedInquiry += `
채무 없음`
        }

        detailedInquiry += `
총 채무: ${formatNumber(calculationData.totalDebt)}원

3단계: 순 재산가액 계산
총 재산가액 - 총 채무: ${formatNumber(calculationData.netAssets)}원
${formatNumber(calculationData.totalAssets)} - ${formatNumber(calculationData.totalDebt)} = ${formatNumber(calculationData.netAssets)}

4단계: 공제 계산
일괄공제: ${calculationData.basicDeduction ? "O" : "X"} (${calculationData.basicDeduction ? "500,000,000" : "0"}원)
배우자공제: ${calculationData.spouseDeduction ? "O" : "X"} (${calculationData.spouseDeduction ? "500,000,000" : "0"}원)
동거주택공제: ${calculationData.housingDeduction ? "O" : "X"} (${calculationData.housingDeduction ? "600,000,000" : "0"}원)
금융자산공제: ${formatNumber(calculationData.financialDeduction)}원
총 공제액: ${formatNumber(calculationData.totalDeductions)}원

5단계: 과세표준 계산
총 재산가액 - 총 공제액: ${formatNumber(calculationData.taxableAmount)}원
${formatNumber(calculationData.totalAssets)} - ${formatNumber(calculationData.totalDeductions)} = ${formatNumber(calculationData.taxableAmount)}

6단계: 세율 적용
과세표준: ${formatNumber(calculationData.taxableAmount)}원
적용 세율: ${calculationData.taxRate.toFixed(1)}%
누진공제: ${formatNumber(calculationData.progressiveDeduction)}원
최종 상속세: ${formatNumber(calculationData.finalTax)}원`
      }

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
        inquiry: detailedInquiry,
        source: "상속세 계산기", // 출처 추가
      }

      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        console.log("Sending data to Google Sheets:", submitData) // 디버깅용

        // Google Sheets에 데이터 저장
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        })

        console.log("상담 신청 데이터가 Google Sheets에 저장되었습니다:", submitData)
      } else {
        console.log("Google Script URL이 설정되지 않았습니다. 로컬 로그:", submitData)
        alert("Google Sheets 연동이 설정되지 않았습니다. 관리자에게 문의해주세요.")
      }

      // 폼 초기화 및 모달 닫기
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
      console.error("상담 신청 중 오류가 발생했습니다:", error)
      alert("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 입력 시 에러 상태 초기화
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
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
