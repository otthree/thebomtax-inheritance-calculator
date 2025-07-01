"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Calculator, FileText, Plus, X } from "lucide-react"
import { Footer } from "@/components/footer"
import ConsultationModal from "@/components/consultation-modal"
import Image from "next/image"

interface FormData {
  // 기본 정보
  totalAssets: number
  debt: number

  // 상속인 정보
  spouse: boolean
  children: number
  parents: number
  siblings: number

  // 증여 정보 (배열로 변경)
  gifts: Array<{
    amount: number
    isSpouse: boolean
  }>
}

interface GiftTaxBracket {
  min: number
  max: number
  rate: number
  deduction: number
}

const giftTaxBrackets: GiftTaxBracket[] = [
  { min: 0, max: 100000000, rate: 0.1, deduction: 0 },
  { min: 100000000, max: 500000000, rate: 0.2, deduction: 10000000 },
  { min: 500000000, max: 1000000000, rate: 0.3, deduction: 60000000 },
  { min: 1000000000, max: 3000000000, rate: 0.4, deduction: 160000000 },
  { min: 3000000000, max: Number.POSITIVE_INFINITY, rate: 0.5, deduction: 460000000 },
]

export default function InheritanceTaxCalculator() {
  const [formData, setFormData] = useState<FormData>({
    totalAssets: 0,
    debt: 0,
    spouse: false,
    children: 0,
    parents: 0,
    siblings: 0,
    gifts: [{ amount: 0, isSpouse: false }],
  })

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)

  // 증여 항목 추가
  const addGift = () => {
    setFormData((prev) => ({
      ...prev,
      gifts: [...prev.gifts, { amount: 0, isSpouse: false }],
    }))
  }

  // 증여 항목 삭제
  const removeGift = (index: number) => {
    if (formData.gifts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        gifts: prev.gifts.filter((_, i) => i !== index),
      }))
    }
  }

  // 증여 항목 업데이트
  const updateGift = (index: number, field: "amount" | "isSpouse", value: number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      gifts: prev.gifts.map((gift, i) => (i === index ? { ...gift, [field]: value } : gift)),
    }))
  }

  // 증여세액공제 계산 함수
  const calculateGiftTaxDeduction = (amount: number, isSpouse: boolean): number => {
    if (amount <= 0) return 0

    const exemption = isSpouse ? 600000000 : 50000000 // 배우자 6억, 자녀 5천만원
    const taxableAmount = Math.max(0, amount - exemption)

    if (taxableAmount <= 0) return 0

    // 세율 구간 찾기
    const bracket = giftTaxBrackets.find((b) => taxableAmount > b.min && taxableAmount <= b.max)
    if (!bracket) return 0

    return Math.max(0, taxableAmount * bracket.rate - bracket.deduction)
  }

  // 계산된 값들
  const netAssets = Math.max(0, formData.totalAssets - formData.debt)

  // 사전증여자산 (모든 증여 항목의 합)
  const giftProperty = formData.gifts.reduce((sum, gift) => sum + gift.amount, 0)

  // 증여세액공제 (각 항목별로 계산해서 합산)
  const giftTaxDeduction = formData.gifts.reduce(
    (sum, gift) => sum + calculateGiftTaxDeduction(gift.amount, gift.isSpouse),
    0,
  )

  const totalTaxableAssets = netAssets + giftProperty

  // 기초공제 계산
  let basicDeduction = 200000000 // 기본 2억
  if (formData.spouse) basicDeduction += 500000000 // 배우자 5억 추가
  if (formData.children > 0) basicDeduction += formData.children * 50000000 // 자녀 1인당 5천만원
  if (formData.parents > 0) basicDeduction += formData.parents * 50000000 // 직계존속 1인당 5천만원
  if (formData.siblings > 0) basicDeduction += formData.siblings * 10000000 // 형제자매 1인당 1천만원

  const taxableAssets = Math.max(0, totalTaxableAssets - basicDeduction)

  // 상속세 계산 (간단한 누진세율 적용)
  let inheritanceTax = 0
  if (taxableAssets > 0) {
    if (taxableAssets <= 100000000) {
      inheritanceTax = taxableAssets * 0.1
    } else if (taxableAssets <= 500000000) {
      inheritanceTax = taxableAssets * 0.2 - 10000000
    } else if (taxableAssets <= 1000000000) {
      inheritanceTax = taxableAssets * 0.3 - 60000000
    } else if (taxableAssets <= 3000000000) {
      inheritanceTax = taxableAssets * 0.4 - 160000000
    } else {
      inheritanceTax = taxableAssets * 0.5 - 460000000
    }
  }

  const finalTax = Math.max(0, inheritanceTax - giftTaxDeduction)

  // 구글시트 연동을 위한 기존 변수들 (호환성 유지)
  const isSpouse = formData.gifts.some((gift) => gift.isSpouse) // 배우자 증여가 하나라도 있으면 true

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(Math.round(num))
  }

  const formatWon = (num: number) => {
    const formatted = formatNumber(num)
    return `${formatted}만원`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo-deobom.png" alt="세무법인 더봄" width={150} height={45} className="h-8 w-auto" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">상속세 계산기</h1>
                <p className="text-sm text-gray-600">정확한 상속세 계산을 위한 전문 도구</p>
              </div>
            </div>
            <Button onClick={() => setIsConsultationModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              전문가 상담 신청
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 입력 폼 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  상속세 계산 정보 입력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">기본 정보</TabsTrigger>
                    <TabsTrigger value="heirs">상속인</TabsTrigger>
                    <TabsTrigger value="gifts">증여</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="totalAssets">
                          총 상속재산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <Input
                          id="totalAssets"
                          type="number"
                          placeholder="예: 100000"
                          value={formData.totalAssets || ""}
                          onChange={(e) => setFormData({ ...formData, totalAssets: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="debt">
                          부채 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                        </Label>
                        <Input
                          id="debt"
                          type="number"
                          placeholder="예: 20000"
                          value={formData.debt || ""}
                          onChange={(e) => setFormData({ ...formData, debt: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="heirs" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="spouse"
                          checked={formData.spouse}
                          onChange={(e) => setFormData({ ...formData, spouse: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="spouse">배우자가 있습니다</Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="children">자녀 수</Label>
                          <Input
                            id="children"
                            type="number"
                            min="0"
                            value={formData.children || ""}
                            onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parents">직계존속 수</Label>
                          <Input
                            id="parents"
                            type="number"
                            min="0"
                            value={formData.parents || ""}
                            onChange={(e) => setFormData({ ...formData, parents: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siblings">형제자매 수</Label>
                          <Input
                            id="siblings"
                            type="number"
                            min="0"
                            value={formData.siblings || ""}
                            onChange={(e) => setFormData({ ...formData, siblings: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="gifts" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">증여 정보</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addGift}
                          className="flex items-center bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          증여 추가
                        </Button>
                      </div>

                      {formData.gifts.map((gift, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">증여 {index + 1}</h4>
                            {formData.gifts.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGift(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>
                                증여받은 재산 <span className="text-xs text-gray-500">(단위 : 만원)</span>
                              </Label>
                              <Input
                                type="number"
                                placeholder="예: 50000"
                                value={gift.amount || ""}
                                onChange={(e) => updateGift(index, "amount", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>증여자 관계</Label>
                              <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`giftType-${index}`}
                                    checked={gift.isSpouse}
                                    onChange={() => updateGift(index, "isSpouse", true)}
                                  />
                                  <span>배우자</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`giftType-${index}`}
                                    checked={!gift.isSpouse}
                                    onChange={() => updateGift(index, "isSpouse", false)}
                                  />
                                  <span>자녀</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 실시간 계산 결과 */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  실시간 계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">총 상속재산</span>
                    <span className="font-medium">{formatWon(formData.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">부채</span>
                    <span className="font-medium text-red-600">-{formatWon(formData.debt)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">순상속재산</span>
                    <span className="font-semibold">{formatWon(netAssets)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">사전증여자산</span>
                    <span className="font-medium">{formatWon(giftProperty)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">상속세 과세가액</span>
                    <span className="font-semibold">{formatWon(totalTaxableAssets)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">기초공제</span>
                    <span className="font-medium text-green-600">-{formatWon(basicDeduction)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">상속세 과세표준</span>
                    <span className="font-semibold">{formatWon(taxableAssets)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">산출세액</span>
                    <span className="font-medium">{formatWon(inheritanceTax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">증여세액공제</span>
                    <span className="font-medium text-green-600">-{formatWon(giftTaxDeduction)}</span>
                  </div>
                  <Separator className="border-2" />
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                    <span className="font-bold text-blue-900">최종 상속세</span>
                    <span className="text-xl font-bold text-blue-600">{formatWon(finalTax)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => setIsConsultationModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    전문가 상담 신청
                  </Button>
                </div>

                {/* 상세보기 섹션 */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">상세보기</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">기초공제 상세:</span>
                    </div>
                    <div className="ml-4 space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>• 기본공제</span>
                        <span>{formatWon(200000000)}</span>
                      </div>
                      {formData.spouse && (
                        <div className="flex justify-between">
                          <span>• 배우자공제</span>
                          <span>{formatWon(500000000)}</span>
                        </div>
                      )}
                      {formData.children > 0 && (
                        <div className="flex justify-between">
                          <span>• 자녀공제 ({formData.children}명)</span>
                          <span>{formatWon(formData.children * 50000000)}</span>
                        </div>
                      )}
                      {formData.parents > 0 && (
                        <div className="flex justify-between">
                          <span>• 직계존속공제 ({formData.parents}명)</span>
                          <span>{formatWon(formData.parents * 50000000)}</span>
                        </div>
                      )}
                      {formData.siblings > 0 && (
                        <div className="flex justify-between">
                          <span>• 형제자매공제 ({formData.siblings}명)</span>
                          <span>{formatWon(formData.siblings * 10000000)}</span>
                        </div>
                      )}
                    </div>

                    {giftProperty > 0 && (
                      <>
                        <div className="flex justify-between pt-2">
                          <span className="text-gray-600">증여 상세:</span>
                        </div>
                        <div className="ml-4 space-y-1 text-xs text-gray-500">
                          {formData.gifts.map(
                            (gift, index) =>
                              gift.amount > 0 && (
                                <div key={index} className="flex justify-between">
                                  <span>
                                    • 증여 {index + 1} ({gift.isSpouse ? "배우자" : "자녀"})
                                  </span>
                                  <span>{formatWon(gift.amount)}</span>
                                </div>
                              ),
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={{
          totalAssets: formData.totalAssets,
          debt: formData.debt,
          netAssets,
          spouse: formData.spouse,
          children: formData.children,
          parents: formData.parents,
          siblings: formData.siblings,
          giftProperty,
          isSpouse,
          totalTaxableAssets,
          basicDeduction,
          taxableAssets,
          inheritanceTax,
          giftTaxDeduction,
          finalTax,
        }}
      />
    </div>
  )
}
