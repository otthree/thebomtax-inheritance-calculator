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
              <Image src="/logo-deobom-white.png" alt="세무법인 더봄" width={180} height={54} className="h-8 w-auto" />
            </div>
            <p className="text-slate-300 text-sm mb-4">
              전문적이고 신뢰할 수 있는 세무 서비스를 제공하는 세무법인 더봄입니다. 상속세, 증여세, 법인세 등 모든 세무
              업무를 전문적으로 처리해드립니다.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>📞 02-336-0309</p>
              <p>📧 info@deobom.co.kr</p>
              <p>📍 서울특별시 강남구 테헤란로 123길 45, 더봄빌딩 5층</p>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">주요 서비스</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  상속세 신고
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  증여세 신고
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  법인세 신고
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  종합소득세 신고
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  부가가치세 신고
                </Link>
              </li>
            </ul>
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
              >
                <Image src="/icons/youtube-icon.png" alt="YouTube" width={32} height={32} className="w-8 h-8" />
              </a>
              <a
                href="https://blog.naver.com/deobom"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/icons/naver-blog-icon.png"
                  alt="네이버 블로그"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </a>
              <a
                href="https://www.instagram.com/deobom_tax"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image src="/icons/instagram-icon.png" alt="Instagram" width={32} height={32} className="w-8 h-8" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">© 2025 세무법인 더봄. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                이용약관
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                사업자정보
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
