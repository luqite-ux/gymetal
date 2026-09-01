import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'

import './globals.css'
import { LanguageProvider } from '@/lib/language-context'
import { Toaster } from '@/components/ui/sonner'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isRtlLocale, isSupportedLocale, localizePath, stripLocalePrefix } from '@/lib/locales'
import { getTranslations } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gymetaltech.com'

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-site-locale')
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE
  const pathname = stripLocalePrefix(requestHeaders.get('x-site-pathname') || '/').pathname
  const t = getTranslations(locale)
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((item) => [item.code, localizePath(pathname, item.code)]),
  )
  languages['x-default'] = localizePath(pathname, DEFAULT_LOCALE)
  return {
    metadataBase: new URL(SITE_URL),
    title: `GY Metal Tech - ${t.hero.title}`,
    description: t.about.description,
    keywords: 'CNC machining, precision manufacturing, metal parts, castings, forgings, aerospace parts, medical parts, semiconductor parts',
    alternates: { canonical: localizePath(pathname, locale), languages },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '' },
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-site-locale')
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE
  return (
    <html lang={locale} dir={isRtlLocale(locale) ? 'rtl' : 'ltr'}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider initialLocale={locale}>
          {children}
          <Toaster richColors position="top-center" />
        </LanguageProvider>
      </body>
    </html>
  )
}
