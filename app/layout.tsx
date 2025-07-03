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
  description: "2025년 기준 상속세 계산기 - 전문 세무사 검증, 무료 서비스",
  keywords: "상속세, 계산기, 세무법인, 더봄, 상속세율, 공제",
  authors: [{ name: "세무법인 더봄" }],
  openGraph: {
    title: "상속세 계산기 | 세무법인 더봄",
    description: "2025년 기준 상속세 계산기 - 전문 세무사 검증, 무료 서비스",
    type: "website",
    locale: "ko_KR",
  },
  robots: {
    index: true,
    follow: true,
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>

        {/* Kakao SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== "undefined" && window.Kakao) {
              // 카카오 앱 키를 여기에 입력하세요 (JavaScript 키)
              if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "YOUR_KAKAO_APP_KEY")
              }
            }
          }}
        />
      </body>
    </html>
  )
}
