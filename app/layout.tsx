import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "상속세 계산기 | 세무법인 더봄",
  description: "정확한 상속세 계산과 전문가 상담을 제공하는 세무법인 더봄의 상속세 계산기입니다.",
  keywords: "상속세, 계산기, 세무법인, 더봄, 상속세계산, 세무상담",
  authors: [{ name: "세무법인 더봄" }],
  creator: "세무법인 더봄",
  publisher: "세무법인 더봄",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://thebomtax-inheritance-calculator.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "상속세 계산기 | 세무법인 더봄",
    description: "정확한 상속세 계산과 전문가 상담을 제공하는 세무법인 더봄의 상속세 계산기입니다.",
    url: "https://thebomtax-inheritance-calculator.vercel.app",
    siteName: "세무법인 더봄",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "상속세 계산기 | 세무법인 더봄",
    description: "정확한 상속세 계산과 전문가 상담을 제공하는 세무법인 더봄의 상속세 계산기입니다.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
