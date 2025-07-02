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
              전문적이고 신뢰할 수 있는 세무 서비스를 제공합니다.
              <br />
              상속세, 증여세, 법인세, 소득세 등 모든 세무 업무를 처리해드립니다.
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
                href="https://blog.naver.com/deobom_tax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Image src="/icons/naver-blog-icon.png" alt="Naver Blog" width={24} height={24} className="w-6 h-6" />
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
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  상속세 계산
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  증여세 계산
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  법인세 신고
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  소득세 신고
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>02-336-0309</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>info@deobom.co.kr</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 세무법인 더봄. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
