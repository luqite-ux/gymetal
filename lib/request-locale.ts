import { headers } from 'next/headers'
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from './locales'

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers()
  const value = requestHeaders.get('x-site-locale')
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE
}

