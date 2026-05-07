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

  const { data: fallbackTenant } = await supabase
    .from("tenants")
    .select("id")
    .limit(1)
    .maybeSingle()

  return (fallbackTenant?.id as string | undefined) ?? null
})

export const getPublishedNews = cache(async (): Promise<PublishedArticle[]> => {
  const tenantId = await getTenantIdForHost()
  if (!tenantId) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content, featured_image, created_at, published_at")
    .eq("tenant_id", tenantId)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[frontend-news] load articles failed:", error.message)
    return []
  }

  return (data ?? []) as PublishedArticle[]
})

/** 同站点已发布文章（排除当前篇），用于详情页侧栏 */
export const getRelatedPublishedNews = cache(
  async (excludeArticleId: string, limit = 6): Promise<PublishedArticle[]> => {
    const tenantId = await getTenantIdForHost()
    if (!tenantId) return []

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, content, featured_image, created_at, published_at")
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

    return (data ?? []) as PublishedArticle[]
  }
)

export const getNewsBySlug = cache(
  async (slug: string): Promise<PublishedArticle | null> => {
    const tenantId = await getTenantIdForHost()
    if (!tenantId) return null

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, content, featured_image, created_at, published_at")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle()

    if (error) {
      console.error("[frontend-news] load article failed:", error.message)
      return null
    }

    return (data as PublishedArticle | null) ?? null
  }
)
