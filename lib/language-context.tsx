'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { type Locale, defaultLocale, getTranslations } from './i18n'
import { isRtlLocale, localizePath } from './locales'
import { useSiteContent } from './site-content-context'
import { overlayTranslations } from './site-content-model'

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children, initialLocale = defaultLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    document.cookie = `site_locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    const nextPath = localizePath(window.location.pathname, newLocale)
    window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`)
  }, [])

  const t = getTranslations(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  const content = useSiteContent()
  const t = useMemo(()=>context && content ? overlayTranslations(context.t,content.texts,context.locale) : context?.t,[context,content])
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return { ...context, t:t! }
}
