import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "상속세 계산기 | 정확한 상속세 계산 서비스",
  description:
    "한국의 상속세를 정확하게 계산해보세요. 부동산, 금융자산, 채무 등을 고려한 정밀한 상속세 계산 서비스입니다.",
  keywords: "상속세, 상속세계산기, 상속세율, 상속공제, 상속세신고",
  authors: [{ name: "상속세 계산기" }],
  openGraph: {
    title: "상속세 계산기 | 정확한 상속세 계산 서비스",
    description:
      "한국의 상속세를 정확하게 계산해보세요. 부동산, 금융자산, 채무 등을 고려한 정밀한 상속세 계산 서비스입니다.",
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
