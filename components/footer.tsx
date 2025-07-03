import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image src="/logo-deobom-white.png" alt="세무법인 더봄" width={200} height={60} className="h-8 w-auto" />
            </div>
            <p className="text-slate-300 text-sm mb-4">
              세무법인 더봄은 상속세, 증여세 전문 세무법인으로 고객의 세무 부담을 최소화하고 최적의 세무 서비스를
              제공합니다.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white">
                <Image src="/icons/youtube-icon.png" alt="YouTube" width={24} height={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <Image src="/icons/naver-blog-icon.png" alt="Naver Blog" width={24} height={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <Image src="/icons/instagram-icon.png" alt="Instagram" width={24} height={24} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="#" className="hover:text-white">
                  상속세 계산
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  증여세 계산
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  세무 상담
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  세무 신고
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>📞 02-336-0309</p>
              <p>📧 info@deobom.co.kr</p>
              <p>🏢 서울시 강남구 테헤란로 123</p>
              <p>⏰ 평일 09:00 - 18:00</p>
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
