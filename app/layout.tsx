import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { LanguageProvider } from '@/lib/language-context'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gymetaltech.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'GY Metal Tech - Precision Metal Manufacturing',
  description: 'Wuxi Guangyue Metal Technology Co., Ltd. - ISO9001 certified manufacturer specializing in high-precision CNC machining for medical, aerospace, automotive, and semiconductor industries.',
  keywords: 'CNC machining, precision manufacturing, metal parts, castings, forgings, aerospace parts, medical parts, semiconductor parts',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider>
          {children}
          <Toaster richColors position="top-center" />
        </LanguageProvider>
      </body>
    </html>
  )
}
