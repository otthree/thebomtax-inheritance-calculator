import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Image src="/logo-deobom-white.png" alt="세무법인 더봄" width={200} height={60} className="h-8 w-auto" />
            </div>
            <p className="text-slate-300 text-sm mb-4">
              세무법인 더봄은 상속세, 증여세 전문 세무법인으로
              <br />
              고객의 세무 문제를 정확하고 신속하게 해결해드립니다.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/@user-deobom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Image src="/icons/youtube-icon.png" alt="YouTube" width={24} height={24} className="w-6 h-6" />
              </a>
              <a
                href="https://blog.naver.com/l77155"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Image
                  src="/icons/naver-blog-icon.png"
                  alt="네이버 블로그"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </a>
              <a
                href="https://www.instagram.com/deobom_tax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Image src="/icons/instagram-icon.png" alt="Instagram" width={24} height={24} className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>📞 02-336-0309</p>
              <p>📧 deobom@deobom.co.kr</p>
              <p>🕒 평일 09:00 - 18:00</p>
              <p className="text-xs text-slate-400">토요일, 일요일, 공휴일 휴무</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">주소</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>서울특별시 강남구</p>
              <p>테헤란로 152</p>
              <p>강남파이낸스센터 17층</p>
              <p className="text-xs text-slate-400 mt-3">
                지하철 2호선 강남역
                <br />
                12번 출구 도보 3분
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-400 mb-4 md:mb-0">
              <p>© 2025 세무법인 더봄. All rights reserved.</p>
              <p className="text-xs mt-1">
                사업자등록번호: 123-45-67890 | 대표: 홍길동 |
                <Link href="/privacy" className="hover:text-white ml-1">
                  개인정보처리방침
                </Link>
              </p>
            </div>
            <div className="text-xs text-slate-400">
              <p>본 사이트의 계산 결과는 참고용이며,</p>
              <p>실제 세액과 다를 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
