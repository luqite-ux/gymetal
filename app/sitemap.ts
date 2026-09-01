import type { MetadataRoute } from "next"
import { getPublishedNews } from "@/lib/frontend-news"
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, localizePath } from "@/lib/locales"

const BASE_URL = "https://www.gymetaltech.com"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticDefinitions = [
    { pathname: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { pathname: '/products', changeFrequency: 'weekly' as const, priority: 0.9 },
    { pathname: '/news', changeFrequency: 'weekly' as const, priority: 0.8 },
    { pathname: '/services', changeFrequency: 'monthly' as const, priority: 0.8 },
    { pathname: '/equipment', changeFrequency: 'monthly' as const, priority: 0.7 },
    { pathname: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
    { pathname: '/faq', changeFrequency: 'monthly' as const, priority: 0.5 },
    { pathname: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
  ]
  const languageAlternates = (pathname: string) => ({
    ...Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale.code, `${BASE_URL}${localizePath(pathname, locale.code)}`])),
    'x-default': `${BASE_URL}${localizePath(pathname, DEFAULT_LOCALE)}`,
  })
  const staticPages: MetadataRoute.Sitemap = staticDefinitions.flatMap((definition) =>
    SUPPORTED_LOCALES.map((locale) => ({
      url: `${BASE_URL}${localizePath(definition.pathname, locale.code)}`,
      lastModified: now,
      changeFrequency: definition.changeFrequency,
      priority: locale.code === DEFAULT_LOCALE ? definition.priority : Math.max(0.3, definition.priority - 0.1),
      alternates: { languages: languageAlternates(definition.pathname) },
    })),
  )

  let articlePages: MetadataRoute.Sitemap = []
  try {
    const articles = await getPublishedNews(DEFAULT_LOCALE)
    articlePages = articles.flatMap((article) => {
      const pathname = `/news/${article.slug}`
      return SUPPORTED_LOCALES.map((locale) => ({
        url: `${BASE_URL}${localizePath(pathname, locale.code)}`,
        lastModified: new Date(article.published_at ?? article.created_at),
        changeFrequency: "monthly" as const,
        priority: locale.code === DEFAULT_LOCALE ? 0.6 : 0.5,
        alternates: { languages: languageAlternates(pathname) },
      }))
    })
  } catch (error) {
    console.error("[sitemap] failed to load articles:", error)
  }

  return [...staticPages, ...articlePages]
}
