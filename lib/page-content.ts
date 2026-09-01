import generatedPageTranslations from './generated-page-translations.json'
import type { Locale } from './locales'

const localized = generatedPageTranslations as Record<string, Record<string, string>>

export function pageText(locale: Locale, english: string, chinese?: string): string {
  if (locale === 'en') return english
  if (locale === 'zh') return chinese || english
  return localized[locale]?.[english] || english
}
