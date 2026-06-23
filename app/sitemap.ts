import type { MetadataRoute } from "next"
import { getPublishedNews } from "@/lib/frontend-news"

const BASE_URL = "https://www.gymetaltech.com"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/equipment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  let articlePages: MetadataRoute.Sitemap = []
  try {
    const articles = await getPublishedNews()
    articlePages = articles.map((article) => ({
      url: `${BASE_URL}/news/${article.slug}`,
      lastModified: new Date(article.published_at ?? article.created_at),
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  } catch (error) {
    console.error("[sitemap] failed to load articles:", error)
  }

  return [...staticPages, ...articlePages]
}
