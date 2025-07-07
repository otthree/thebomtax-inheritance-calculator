import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "상속세 계산기 | 세무법인 더봄",
  description: "정확하고 빠른 상속세 계산 서비스를 제공합니다. 세무법인 더봄의 전문적인 상속세 계산기를 이용해보세요.",
  keywords: "상속세, 계산기, 세무, 세무법인, 더봄, 상속, 세금",
  authors: [{ name: "세무법인 더봄" }],
  creator: "세무법인 더봄",
  publisher: "세무법인 더봄",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://inheritance-tax-calculator.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "상속세 계산기 | 세무법인 더봄",
    description: "정확하고 빠른 상속세 계산 서비스를 제공합니다.",
    url: "https://inheritance-tax-calculator.vercel.app",
    siteName: "세무법인 더봄 상속세 계산기",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "상속세 계산기 | 세무법인 더봄",
    description: "정확하고 빠른 상속세 계산 서비스를 제공합니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
