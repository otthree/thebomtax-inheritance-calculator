import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">상속세 계산기</h3>
            <p className="text-sm text-gray-600">정확하고 신뢰할 수 있는 상속세 계산 서비스를 제공합니다.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">주요 기능</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 상속재산 계산</li>
              <li>• 상속공제 적용</li>
              <li>• 세액공제 계산</li>
              <li>• 전문가 상담</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">안내사항</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 참고용 계산기입니다</li>
              <li>• 전문가 상담 권장</li>
              <li>• 신고기한 준수 필요</li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 상속세 계산기. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  )
}
