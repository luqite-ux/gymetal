import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { LanguageProvider } from '@/lib/language-context'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'GY Metal Tech - Precision Metal Manufacturing',
  description: 'Wuxi Guangyue Metal Technology Co., Ltd. - ISO9001 certified manufacturer specializing in high-precision CNC machining for medical, aerospace, automotive, and semiconductor industries.',
  keywords: 'CNC machining, precision manufacturing, metal parts, castings, forgings, aerospace parts, medical parts, semiconductor parts',
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
