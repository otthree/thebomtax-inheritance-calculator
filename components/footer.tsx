import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Image src="/logo-deobom-white.png" alt="세무법인 더봄" width={200} height={60} className="h-8 w-auto" />
            </div>
            <p className="text-slate-300 mb-4">상속세 전문 세무법인으로 투명하고 정확한 세무 서비스를 제공합니다.</p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>대표: 김세무</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>주소: 서울특별시 강남구 테헤란로 123</p>
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>전화: 02-336-0309</p>
              <p>팩스: 02-336-0310</p>
              <p>이메일: info@deobom.co.kr</p>
              <p>운영시간: 평일 09:00-18:00</p>
            </div>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">소셜 미디어</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/@deobom"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="유튜브"
              >
                <Image src="/icons/youtube-icon.png" alt="YouTube" width={32} height={32} className="w-8 h-8" />
              </a>
              <a
                href="https://www.instagram.com/deobom_tax"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="인스타그램"
              >
                <Image src="/icons/instagram-icon.png" alt="Instagram" width={32} height={32} className="w-8 h-8" />
              </a>
              <a
                href="https://blog.naver.com/deobom_blog"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="네이버 블로그"
              >
                <Image
                  src="/icons/naver-blog-icon.png"
                  alt="네이버 블로그"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">© 2025 세무법인 더봄. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
