import { cache } from "react"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"

export interface PublishedArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  featured_image: string | null
  created_at: string
  published_at: string | null
}

type LocalizedArticleText = Record<string, unknown> | null

type PublishedArticleRow = PublishedArticle & {
  title_i18n: LocalizedArticleText
  excerpt_i18n: LocalizedArticleText
  content_i18n: LocalizedArticleText
}

const articleSelect =
  "id, slug, title, excerpt, content, title_i18n, excerpt_i18n, content_i18n, featured_image, created_at, published_at"

function resolveLocalizedText(localized: LocalizedArticleText, legacy: string | null) {
  const legacyText = legacy?.trim() ?? ""
  if (legacyText && legacyText !== "<p></p>") return legacyText

  const english = typeof localized?.en === "string" ? localized.en.trim() : ""
  if (english) return english

  for (const value of Object.values(localized ?? {})) {
    if (typeof value === "string" && value.trim() && value.trim() !== "<p></p>") {
      return value.trim()
    }
  }
  return ""
}

function normalizeArticle(row: PublishedArticleRow): PublishedArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: resolveLocalizedText(row.title_i18n, row.title),
    excerpt: resolveLocalizedText(row.excerpt_i18n, row.excerpt) || null,
    content: resolveLocalizedText(row.content_i18n, row.content) || null,
    featured_image: row.featured_image,
    created_at: row.created_at,
    published_at: row.published_at,
  }
}

function normalizeHost(host: string): string {
  const withoutPort = host.split(":")[0]?.trim().toLowerCase() ?? ""
  return withoutPort.startsWith("www.") ? withoutPort.slice(4) : withoutPort
}

const getTenantIdForHost = cache(async (): Promise<string | null> => {
  const requestHeaders = await headers()
  const rawHost =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    process.env.NEXT_PUBLIC_SITE_HOST ||
    "www.gymetaltech.com"
  const host = normalizeHost(rawHost)
  const candidates = Array.from(new Set([host, `www.${host}`]))
  const supabase = createAdminClient()

  for (const domain of candidates) {
    const { data } = await supabase
      .from("tenants")
      .select("id")
      .eq("domain", domain)
      .maybeSingle()

    if (data?.id) {
      return data.id as string
    }
  }

  return process.env.NEXT_PUBLIC_TENANT_ID?.trim() || null
})

export const getPublishedNews = cache(async (): Promise<PublishedArticle[]> => {
  const tenantId = await getTenantIdForHost()
  if (!tenantId) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("tenant_id", tenantId)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[frontend-news] load articles failed:", error.message)
    return []
  }

  return ((data ?? []) as PublishedArticleRow[]).map(normalizeArticle)
})

/** 同站点已发布文章（排除当前篇），用于详情页侧栏 */
export const getRelatedPublishedNews = cache(
  async (excludeArticleId: string, limit = 6): Promise<PublishedArticle[]> => {
    const tenantId = await getTenantIdForHost()
    if (!tenantId) return []

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("articles")
      .select(articleSelect)
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .neq("id", excludeArticleId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[frontend-news] related articles failed:", error.message)
      return []
    }

    return ((data ?? []) as PublishedArticleRow[]).map(normalizeArticle)
  }
)

export const getNewsBySlug = cache(
  async (slug: string): Promise<PublishedArticle | null> => {
    const tenantId = await getTenantIdForHost()
    if (!tenantId) return null

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("articles")
      .select(articleSelect)
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle()

    if (error) {
      console.error("[frontend-news] load article failed:", error.message)
      return null
    }

    return data ? normalizeArticle(data as PublishedArticleRow) : null
  }
)
