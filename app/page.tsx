"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Calculator, Users, Building, Banknote, FileText, Phone, MessageCircle } from "lucide-react"
import { ConsultationModal } from "@/components/consultation-modal"
import { Footer } from "@/components/footer"
import Image from "next/image"

// 한국어 숫자 변환 함수
function formatKoreanNumber(num: number): string {
  if (num === 0) return "0원"

  const units = ["", "만", "억", "조"]
  const result = []
  let unitIndex = 0

  while (num > 0 && unitIndex < units.length) {
    const currentUnit = num % 10000
    if (currentUnit > 0) {
      result.unshift(`${currentUnit.toLocaleString()}${units[unitIndex]}`)
    }
    num = Math.floor(num / 10000)
    unitIndex++
  }

  return result.join(" ") + "원"
}

// 만원 단위로 변환하는 함수
function formatToTenThousand(value: number): string {
  if (value === 0) return "0"
  const tenThousand = Math.round(value / 10000)
  return tenThousand.toLocaleString()
}

export default function InheritanceTaxCalculator() {
  // 기본 정보
  const [totalAssets, setTotalAssets] = useState<number>(0)
  const [totalDebts, setTotalDebts] = useState<number>(0)
  const [funeralExpenses, setFuneralExpenses] = useState<number>(0)

  // 상속인 정보
  const [hasSpouse, setHasSpouse] = useState<boolean>(false)
  const [childrenCount, setChildrenCount] = useState<number>(0)
  const [parentsCount, setParentsCount] = useState<number>(0)
  const [spouseExpectedInheritance, setSpouseExpectedInheritance] = useState<number>(0)
  const [directDescendants, setDirectDescendants] = useState<number>(0)
  const [directAscendants, setDirectAscendants] = useState<number>(0)
  const [siblings, setSiblings] = useState<number>(0)

  // 공제 항목
  const [hasMinorChildren, setHasMinorChildren] = useState<boolean>(false)
  const [minorChildrenCount, setMinorChildrenCount] = useState<number>(0)
  const [hasDisabledHeir, setHasDisabledHeir] = useState<boolean>(false)
  const [disabledHeirCount, setDisabledHeirCount] = useState<number>(0)
  const [hasElderlyParent, setHasElderlyParent] = useState<boolean>(false)
  const [elderlyParentCount, setElderlyParentCount] = useState<number>(0)
  const [hasDonationDeduction, setHasDonationDeduction] = useState<boolean>(false)
  const [donationAmount, setDonationAmount] = useState<number>(0)

  // 계산 결과
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false)

  // 배우자 공제액 계산 함수
  const calculateSpouseDeduction = (
    childrenCount: number,
    parentsCount: number,
    spouseExpectedInheritance: number,
  ): number => {
    let a = childrenCount
    const b = parentsCount
    const c = spouseExpectedInheritance * 10000 // 만원을 원으로 변환

    if (a === 0) {
      a = b // 자녀수가 0이면 부모수를 자녀수로 설정
    }

    const calculatedDeduction = (1.5 * c) / (1.5 + a)
    const spouseDeduction = Math.max(500000000, Math.min(3000000000, calculatedDeduction))

    // 만원 단위로 반올림
    return Math.round(spouseDeduction / 10000) * 10000
  }

  // 실시간 계산
  useEffect(() => {
    const calculate = () => {
      // 1. 상속재산가액 계산
      const inheritanceAssets = totalAssets - totalDebts - funeralExpenses

      // 2. 기초공제 계산 (2억원 + 상속인 수 × 5천만원, 최대 5억원)
      const totalHeirs = (hasSpouse ? 1 : 0) + directDescendants + directAscendants + siblings
      const basicDeduction = Math.min(500000000, 200000000 + totalHeirs * 50000000)

      // 3. 배우자 공제 계산
      const spouseDeduction = hasSpouse
        ? calculateSpouseDeduction(childrenCount, parentsCount, spouseExpectedInheritance)
        : 0

      // 4. 기타 공제 계산
      const minorChildDeduction = hasMinorChildren ? minorChildrenCount * 50000000 : 0
      const disabledHeirDeduction = hasDisabledHeir ? disabledHeirCount * 100000000 : 0
      const elderlyParentDeduction = hasElderlyParent ? elderlyParentCount * 50000000 : 0
      const donationDeduction = hasDonationDeduction ? donationAmount * 10000 : 0

      // 5. 총 공제액
      const totalDeductions =
        basicDeduction +
        spouseDeduction +
        minorChildDeduction +
        disabledHeirDeduction +
        elderlyParentDeduction +
        donationDeduction

      // 6. 과세표준
      const taxableAmount = Math.max(0, inheritanceAssets - totalDeductions)

      // 7. 상속세 계산 (누진세율)
      let inheritanceTax = 0
      if (taxableAmount <= 100000000) {
        inheritanceTax = taxableAmount * 0.1
      } else if (taxableAmount <= 500000000) {
        inheritanceTax = 10000000 + (taxableAmount - 100000000) * 0.2
      } else if (taxableAmount <= 1000000000) {
        inheritanceTax = 90000000 + (taxableAmount - 500000000) * 0.3
      } else if (taxableAmount <= 3000000000) {
        inheritanceTax = 240000000 + (taxableAmount - 1000000000) * 0.4
      } else {
        inheritanceTax = 1040000000 + (taxableAmount - 3000000000) * 0.5
      }

      // 8. 세액공제 (10% 또는 500만원 중 큰 금액)
      const taxCredit = Math.max(inheritanceTax * 0.1, 5000000)
      const finalTax = Math.max(0, inheritanceTax - taxCredit)

      setCalculationResult({
        inheritanceAssets,
        basicDeduction,
        spouseDeduction,
        minorChildDeduction,
        disabledHeirDeduction,
        elderlyParentDeduction,
        donationDeduction,
        totalDeductions,
        taxableAmount,
        inheritanceTax,
        taxCredit,
        finalTax,
        totalHeirs,
      })
    }

    calculate()
  }, [
    totalAssets,
    totalDebts,
    funeralExpenses,
    hasSpouse,
    childrenCount,
    parentsCount,
    spouseExpectedInheritance,
    directDescendants,
    directAscendants,
    siblings,
    hasMinorChildren,
    minorChildrenCount,
    hasDisabledHeir,
    disabledHeirCount,
    hasElderlyParent,
    elderlyParentCount,
    hasDonationDeduction,
    donationAmount,
  ])

  const handleConsultationClick = () => {
    setIsConsultationModalOpen(true)
  }

  const handleResultPageClick = () => {
    // 계산 결과를 localStorage에 저장
    if (calculationResult) {
      const resultData = {
        inputs: {
          totalAssets,
          totalDebts,
          funeralExpenses,
          hasSpouse,
          childrenCount,
          parentsCount,
          spouseExpectedInheritance,
          directDescendants,
          directAscendants,
          siblings,
          hasMinorChildren,
          minorChildrenCount,
          hasDisabledHeir,
          disabledHeirCount,
          hasElderlyParent,
          elderlyParentCount,
          hasDonationDeduction,
          donationAmount,
        },
        result: calculationResult,
      }
      localStorage.setItem("inheritanceTaxResult", JSON.stringify(resultData))
      window.open("/result", "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo-deobom.png" alt="세무법인 더봄" width={120} height={40} className="h-8 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">상속세 계산기</h1>
                <p className="text-sm text-gray-600">정확한 상속세 계산과 전문가 상담</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleConsultationClick} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Phone className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">무료상담</span>
                <span className="sm:hidden">상담</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 입력 폼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="totalAssets">총 상속재산 (만원)</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    value={totalAssets || ""}
                    onChange={(e) => setTotalAssets(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="text-left"
                  />
                  {totalAssets > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{formatKoreanNumber(totalAssets * 10000)}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="totalDebts">총 채무 (만원)</Label>
                  <Input
                    id="totalDebts"
                    type="number"
                    value={totalDebts || ""}
                    onChange={(e) => setTotalDebts(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="text-left"
                  />
                  {totalDebts > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{formatKoreanNumber(totalDebts * 10000)}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="funeralExpenses">장례비용 (만원)</Label>
                  <Input
                    id="funeralExpenses"
                    type="number"
                    value={funeralExpenses || ""}
                    onChange={(e) => setFuneralExpenses(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="text-left"
                  />
                  {funeralExpenses > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{formatKoreanNumber(funeralExpenses * 10000)}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 상속인 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  상속인 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSpouse"
                    checked={hasSpouse}
                    onCheckedChange={(checked) => setHasSpouse(checked as boolean)}
                  />
                  <Label htmlFor="hasSpouse">배우자</Label>
                </div>

                {hasSpouse && (
                  <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="childrenCount">자녀 수</Label>
                        <Input
                          id="childrenCount"
                          type="number"
                          min="0"
                          value={childrenCount || ""}
                          onChange={(e) => setChildrenCount(Number(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentsCount">부모 수</Label>
                        <Input
                          id="parentsCount"
                          type="number"
                          min="0"
                          value={parentsCount || ""}
                          onChange={(e) => setParentsCount(Number(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="spouseExpectedInheritance">배우자 예상 실제 상속재산 (만원)</Label>
                      <Input
                        id="spouseExpectedInheritance"
                        type="number"
                        min="0"
                        value={spouseExpectedInheritance || ""}
                        onChange={(e) => setSpouseExpectedInheritance(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="text-left"
                      />
                      {spouseExpectedInheritance > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatKoreanNumber(spouseExpectedInheritance * 10000)}
                        </p>
                      )}
                    </div>
                    {childrenCount === 0 && (
                      <p className="text-xs text-blue-600">* 자녀수가 0인 경우, 부모수가 자녀수로 적용됩니다.</p>
                    )}
                    {hasSpouse && calculationResult && (
                      <div className="text-sm text-blue-700 font-medium">
                        계산된 배우자 공제액: {formatToTenThousand(calculationResult.spouseDeduction)}만원 (
                        {formatKoreanNumber(calculationResult.spouseDeduction)})
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="directDescendants">직계비속 (자녀, 손자녀 등)</Label>
                  <Input
                    id="directDescendants"
                    type="number"
                    min="0"
                    value={directDescendants || ""}
                    onChange={(e) => setDirectDescendants(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="directAscendants">직계존속 (부모, 조부모 등)</Label>
                  <Input
                    id="directAscendants"
                    type="number"
                    min="0"
                    value={directAscendants || ""}
                    onChange={(e) => setDirectAscendants(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="siblings">형제자매</Label>
                  <Input
                    id="siblings"
                    type="number"
                    min="0"
                    value={siblings || ""}
                    onChange={(e) => setSiblings(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 공제 항목 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  추가 공제 항목
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMinorChildren"
                    checked={hasMinorChildren}
                    onCheckedChange={(checked) => setHasMinorChildren(checked as boolean)}
                  />
                  <Label htmlFor="hasMinorChildren">미성년자 공제 (19세 미만)</Label>
                </div>
                {hasMinorChildren && (
                  <div className="ml-6">
                    <Label htmlFor="minorChildrenCount">미성년자 수</Label>
                    <Input
                      id="minorChildrenCount"
                      type="number"
                      min="0"
                      value={minorChildrenCount || ""}
                      onChange={(e) => setMinorChildrenCount(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">미성년자 1인당 5천만원 공제</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDisabledHeir"
                    checked={hasDisabledHeir}
                    onCheckedChange={(checked) => setHasDisabledHeir(checked as boolean)}
                  />
                  <Label htmlFor="hasDisabledHeir">장애인 공제</Label>
                </div>
                {hasDisabledHeir && (
                  <div className="ml-6">
                    <Label htmlFor="disabledHeirCount">장애인 수</Label>
                    <Input
                      id="disabledHeirCount"
                      type="number"
                      min="0"
                      value={disabledHeirCount || ""}
                      onChange={(e) => setDisabledHeirCount(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">장애인 1인당 1억원 공제</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasElderlyParent"
                    checked={hasElderlyParent}
                    onCheckedChange={(checked) => setHasElderlyParent(checked as boolean)}
                  />
                  <Label htmlFor="hasElderlyParent">연로자 공제 (65세 이상)</Label>
                </div>
                {hasElderlyParent && (
                  <div className="ml-6">
                    <Label htmlFor="elderlyParentCount">연로자 수</Label>
                    <Input
                      id="elderlyParentCount"
                      type="number"
                      min="0"
                      value={elderlyParentCount || ""}
                      onChange={(e) => setElderlyParentCount(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">연로자 1인당 5천만원 공제</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDonationDeduction"
                    checked={hasDonationDeduction}
                    onCheckedChange={(checked) => setHasDonationDeduction(checked as boolean)}
                  />
                  <Label htmlFor="hasDonationDeduction">공익법인 출연재산 공제</Label>
                </div>
                {hasDonationDeduction && (
                  <div className="ml-6">
                    <Label htmlFor="donationAmount">출연재산 가액 (만원)</Label>
                    <Input
                      id="donationAmount"
                      type="number"
                      min="0"
                      value={donationAmount || ""}
                      onChange={(e) => setDonationAmount(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="text-left"
                    />
                    {donationAmount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">{formatKoreanNumber(donationAmount * 10000)}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 계산 결과 */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calculationResult ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">예상 상속세</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatToTenThousand(calculationResult.finalTax)}만원
                      </p>
                      <p className="text-xs text-gray-500 mt-1">({formatKoreanNumber(calculationResult.finalTax)})</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>상속재산가액:</span>
                        <span>{formatToTenThousand(calculationResult.inheritanceAssets)}만원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 공제액:</span>
                        <span>{formatToTenThousand(calculationResult.totalDeductions)}만원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>과세표준:</span>
                        <span>{formatToTenThousand(calculationResult.taxableAmount)}만원</span>
                      </div>
                    </div>

                    <Button onClick={() => setShowDetails(!showDetails)} variant="outline" className="w-full">
                      {showDetails ? "간단히 보기" : "상세보기"}
                    </Button>

                    {showDetails && (
                      <div className="space-y-2 text-xs border-t pt-4">
                        <h4 className="font-semibold">공제 내역</h4>
                        <div className="flex justify-between">
                          <span>• 기초공제:</span>
                          <span>{formatToTenThousand(calculationResult.basicDeduction)}만원</span>
                        </div>
                        {calculationResult.spouseDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>• 배우자공제:</span>
                            <span>{formatToTenThousand(calculationResult.spouseDeduction)}만원</span>
                          </div>
                        )}
                        {calculationResult.minorChildDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>• 미성년자공제:</span>
                            <span>{formatToTenThousand(calculationResult.minorChildDeduction)}만원</span>
                          </div>
                        )}
                        {calculationResult.disabledHeirDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>• 장애인공제:</span>
                            <span>{formatToTenThousand(calculationResult.disabledHeirDeduction)}만원</span>
                          </div>
                        )}
                        {calculationResult.elderlyParentDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>• 연로자공제:</span>
                            <span>{formatToTenThousand(calculationResult.elderlyParentDeduction)}만원</span>
                          </div>
                        )}
                        {calculationResult.donationDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>• 공익법인출연:</span>
                            <span>{formatToTenThousand(calculationResult.donationDeduction)}만원</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between">
                          <span>산출세액:</span>
                          <span>{formatToTenThousand(calculationResult.inheritanceTax)}만원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>세액공제:</span>
                          <span>{formatToTenThousand(calculationResult.taxCredit)}만원</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4">
                      <Button onClick={handleResultPageClick} className="w-full bg-green-600 hover:bg-green-700">
                        <FileText className="w-4 h-4 mr-2" />
                        상세 결과 보기
                      </Button>
                      <Button onClick={handleConsultationClick} className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        전문가 상담 신청
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      정보를 입력하시면
                      <br />
                      계산 결과가 표시됩니다
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 안내사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">계산 안내사항</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <p>• 본 계산기는 일반적인 상속세 계산 방법을 기준으로 합니다.</p>
                <p>• 실제 상속세는 개별 상황에 따라 달라질 수 있습니다.</p>
                <p>• 정확한 세액 계산을 위해서는 전문가 상담을 받으시기 바랍니다.</p>
                <p>• 모든 금액은 만원 단위로 입력해주세요.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        calculationData={calculationResult}
      />
    </div>
  )
}
