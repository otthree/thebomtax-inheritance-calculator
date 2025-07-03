import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "상속세 계산기 - 더봄 세무법인",
  description: "정확한 상속세 계산과 전문 상담 서비스를 제공합니다.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== "undefined" && window.Kakao) {
              if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY)
              }
            }
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
