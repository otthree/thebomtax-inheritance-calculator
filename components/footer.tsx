import { Phone, MessageCircle, MapPin, Youtube, Instagram, FileText } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3">
                <div className="text-slate-800 font-bold text-lg">더봄</div>
              </div>
              <div>
                <div className="text-lg font-bold">세무법인 더봄</div>
                <div className="text-sm text-slate-300">Tax Accounting Corporation The BOM</div>
              </div>
            </div>

            {/* SNS Links */}
            <div className="flex space-x-4">
              <Link
                href="https://www.youtube.com/@택스퀸"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                aria-label="유튜브"
              >
                <Youtube className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.instagram.com/hong_taxqueen/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
                aria-label="인스타그램"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://blog.naver.com/l77155"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="네이버 블로그"
              >
                <FileText className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              영업시간
              <span className="block text-sm font-normal text-slate-300 mt-1">OPERATING TIME</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="font-medium">월 - 금</div>
                <div className="text-slate-300">AM 09:30 ~ PM 18:00</div>
              </div>
              <div>
                <div className="font-medium">점심 시간</div>
                <div className="text-slate-300">PM 12:00 ~ PM 13:00</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              기본 정보
              <span className="block text-sm font-normal text-slate-300 mt-1">INFO</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-300" />
                <Link href="tel:02-336-0309" className="hover:text-blue-300 transition-colors">
                  02-336-0309
                </Link>
              </div>
              <div className="flex items-start">
                <MessageCircle className="w-4 h-4 mr-2 mt-0.5 text-slate-300" />
                <div>
                  <div className="text-slate-300 text-xs mb-1">카톡 아이디에 다음을 검색하세요</div>
                  <div className="font-medium">@세무법인 더봄 홍대점</div>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-300" />
                <Link
                  href="https://naver.me/5tJAV6ej"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 transition-colors"
                >
                  서울특별시 마포구 월드컵북로 4길 47 1층
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-6">
          {/* Copyright */}
          <div className="text-xs text-slate-400 leading-relaxed">
            <p>
              세무법인 더봄(홍대점) | 사업자등록번호 : 611-85-07488 | 대표 : 홍지영 | 사업장소재지 : 서울특별시 마포구
              월드컵북로 4길 47 1층 | 고객센터 : 02-336-0309
            </p>
            <p className="mt-2">Copyright 2024. 더봄 세무법인 All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
