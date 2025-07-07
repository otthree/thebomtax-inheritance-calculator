import Link from "next/link"
import Image from "next/image"

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
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">
              세무법인 더봄은 상속세, 증여세 전문 세무법인으로
              <br />
              투명한 수수료와 전문적인 서비스를 제공합니다.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>📍 서울특별시 강남구 테헤란로 123길 45, 6층</p>
              <p>📞 02-336-0309</p>
              <p>📧 deobom@naver.com</p>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="font-semibold text-white mb-4">서비스</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  상속세 계산기
                </Link>
              </li>
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
                  세무 상담
                </Link>
              </li>
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="font-semibold text-white mb-4">소셜 미디어</h3>
            <div className="flex space-x-4">
              <a
                href="https://blog.naver.com/l77155"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
              >
                <Image src="/icons/naver-blog-icon.png" alt="네이버 블로그" width={16} height={16} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
              >
                <Image src="/icons/youtube-icon.png" alt="유튜브" width={16} height={16} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
              >
                <Image src="/icons/instagram-icon.png" alt="인스타그램" width={16} height={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2025 세무법인 더봄. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                개인정보처리방침
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
