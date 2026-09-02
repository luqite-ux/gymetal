export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', shortLabel: 'EN', dir: 'ltr' },
  { code: 'zh', label: '中文', shortLabel: '中文', dir: 'ltr' },
  { code: 'es', label: 'Español', shortLabel: 'ES', dir: 'ltr' },
  { code: 'pt', label: 'Português', shortLabel: 'PT', dir: 'ltr' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', dir: 'ltr' },
  { code: 'ar', label: 'العربية', shortLabel: 'AR', dir: 'rtl' },
  { code: 'el', label: 'Ελληνικά', shortLabel: 'EL', dir: 'ltr' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE', dir: 'ltr' },
  { code: 'nl', label: 'Nederlands', shortLabel: 'NL', dir: 'ltr' },
  { code: 'it', label: 'Italiano', shortLabel: 'IT', dir: 'ltr' },
] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]['code']

export const DEFAULT_LOCALE: Locale = 'en'
export const RTL_LOCALES: readonly Locale[] = ['ar']

const localeCodes = new Set<string>(SUPPORTED_LOCALES.map((locale) => locale.code))

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && localeCodes.has(value))
}

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

export function stripLocalePrefix(pathname: string): { locale: Locale; pathname: string; hadPrefix: boolean } {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  const [first, ...rest] = normalized.split('/').filter(Boolean)
  if (!isSupportedLocale(first) || first === DEFAULT_LOCALE) {
    return { locale: DEFAULT_LOCALE, pathname: normalized || '/', hadPrefix: false }
  }
  return {
    locale: first,
    pathname: rest.length ? `/${rest.join('/')}` : '/',
    hadPrefix: true,
  }
}

export function localizePath(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname).pathname
  if (locale === DEFAULT_LOCALE) return stripped
  return stripped === '/' ? `/${locale}` : `/${locale}${stripped}`
}

export function isLocalizablePath(pathname: string): boolean {
  return !(
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  )
}
