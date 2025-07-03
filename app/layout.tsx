import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "상속세 계산기 | 세무법인 더봄",
  description:
    "2025년 기준 상속세 계산기. 전문 세무사 검증, 무료 서비스. 정확한 상속세 계산과 전문가 상담을 받아보세요.",
  keywords: "상속세, 상속세계산기, 세무법인, 더봄, 상속세율, 상속공제",
  openGraph: {
    title: "상속세 계산기 | 세무법인 더봄",
    description: "2025년 기준 상속세 계산기. 전문 세무사 검증, 무료 서비스.",
    type: "website",
    locale: "ko_KR",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        <Script id="kakao-init" strategy="afterInteractive">
          {`
            function initKakao() {
              if (typeof window !== 'undefined' && window.Kakao) {
                if (!window.Kakao.isInitialized()) {
                  try {
                    window.Kakao.init('${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}');
                    console.log('Kakao SDK 초기화 성공');
                  } catch (error) {
                    console.error('Kakao SDK 초기화 실패:', error);
                  }
                }
              } else {
                console.log('Kakao SDK 로딩 대기 중...');
                setTimeout(initKakao, 100);
              }
            }
            initKakao();
          `}
        </Script>
      </body>
    </html>
  )
}
