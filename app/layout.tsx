import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "상속세 계산기 | 세무법인 더봄",
  description: "2025년 기준 상속세 계산기. 전문 세무사 검증, 실시간 계산, 무료 상담 서비스 제공",
  keywords: "상속세, 상속세계산기, 세무법인더봄, 상속세신고, 절세, 세무상담",
  authors: [{ name: "세무법인 더봄" }],
  creator: "세무법인 더봄",
  publisher: "세무법인 더봄",
  robots: "index, follow",
  openGraph: {
    title: "상속세 계산기 | 세무법인 더봄",
    description: "2025년 기준 상속세 계산기. 전문 세무사 검증, 실시간 계산, 무료 상담 서비스 제공",
    type: "website",
    locale: "ko_KR",
    siteName: "세무법인 더봄",
  },
  twitter: {
    card: "summary_large_image",
    title: "상속세 계산기 | 세무법인 더봄",
    description: "2025년 기준 상속세 계산기. 전문 세무사 검증, 실시간 계산, 무료 상담 서비스 제공",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#334155",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#334155" />
      </head>
      <body>{children}</body>
    </html>
  )
}
