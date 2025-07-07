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
  description: "2025년 기준 상속세를 정확하게 계산해보세요. 전문 세무사가 검증한 무료 상속세 계산기입니다.",
  keywords: "상속세, 상속세계산기, 세무법인, 더봄, 상속세율, 상속공제",
  openGraph: {
    title: "상속세 계산기 | 세무법인 더봄",
    description: "2025년 기준 상속세를 정확하게 계산해보세요. 전문 세무사가 검증한 무료 상속세 계산기입니다.",
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
            if (typeof window !== 'undefined' && window.Kakao) {
              try {
                if (!window.Kakao.isInitialized()) {
                  const kakaoKey = '${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}';
                  if (kakaoKey && kakaoKey !== 'undefined') {
                    window.Kakao.init(kakaoKey);
                    console.log('✅ Kakao SDK 초기화 완료:', window.Kakao.isInitialized());
                  } else {
                    console.warn('⚠️ NEXT_PUBLIC_KAKAO_APP_KEY가 설정되지 않았습니다.');
                  }
                } else {
                  console.log('✅ Kakao SDK 이미 초기화됨');
                }
              } catch (error) {
                console.error('❌ Kakao SDK 초기화 실패:', error);
              }
            } else {
              console.warn('⚠️ Kakao SDK를 찾을 수 없습니다.');
            }
          `}
        </Script>
      </body>
    </html>
  )
}
