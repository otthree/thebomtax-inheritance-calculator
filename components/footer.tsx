import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/logo-deobom-white.png"
                alt="세무법인 더봄"
                width={200}
                height={60}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-slate-300 mb-4">
              전문적이고 신뢰할 수 있는 세무 서비스를 제공합니다.
              <br />
              상속세, 증여세, 법인세 등 모든 세무 업무를 책임집니다.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.youtube.com/@user-deobom" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/icons/youtube-icon.png"
                  alt="YouTube"
                  width={24}
                  height={24}
                  className="w-6 h-6 opacity-70 hover:opacity-100 transition-opacity"
                />
              </Link>\
