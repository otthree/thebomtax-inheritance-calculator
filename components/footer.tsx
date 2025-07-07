import { Phone, Mail, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image src="/logo-deobom-white.png" alt="세무법인 더봄" width={200} height={60} className="h-8 w-auto" />
            </div>
            <p className="text-gray-300 mb-4">
              정확하고 신뢰할 수 있는 세무 서비스를 제공하는 세무법인 더봄입니다. 상속세, 증여세, 법인세 등 모든 세무
              업무를 전문적으로 처리합니다.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Image src="/icons/youtube-icon.png" alt="YouTube" width={24} height={24} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Image src="/icons/naver-blog-icon.png" alt="Naver Blog" width={24} height={24} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Image src="/icons/instagram-icon.png" alt="Instagram" width={24} height={24} />
              </Link>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="#" className="hover:text-white">
                  상속세 계산
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  증여세 상담
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  법인세 신고
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  종합소득세
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  부가가치세
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@deobom.co.kr</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>
                  서울특별시 강남구
                  <br />
                  테헤란로 123, 더봄빌딩 5층
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">© 2024 세무법인 더봄. All rights reserved.</div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                개인정보처리방침
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                이용약관
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                사이트맵
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
