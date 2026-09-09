import { cache } from 'react'
import { headers } from 'next/headers'
import { createPublicClient } from '@/lib/supabase/server'
import type { Locale } from '@/lib/locales'

export interface PublishedProduct {
  id: string
  name: string
  description: string | null
  category: string | null
  image_url: string | null
}

type PublishedProductRow = {
  id: string
  name: string | null
  name_en: string | null
  description: string | null
  description_en: string | null
  category: string | null
  image_url: string | null
}

function normalizeHost(host: string): string {
  const withoutPort = host.split(':')[0]?.trim().toLowerCase() ?? ''
  return withoutPort.startsWith('www.') ? withoutPort.slice(4) : withoutPort
}

function getPublicProductsClient() {
  try {
    return createPublicClient()
  } catch (error) {
    console.error('[frontend-products] public Supabase configuration unavailable:', error instanceof Error ? error.message : error)
    return null
  }
}

const getTenantIdForHost = cache(async (): Promise<string | null> => {
  const configuredTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim()
  if (configuredTenantId) return configuredTenantId

  const requestHeaders = await headers()
  const rawHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || process.env.NEXT_PUBLIC_SITE_HOST || 'www.gymetaltech.com'
  const host = normalizeHost(rawHost)
  const candidates = Array.from(new Set([host, `www.${host}`]))
  const supabase = getPublicProductsClient()
  if (!supabase) return null

  for (const domain of candidates) {
    const { data } = await supabase.from('tenants').select('id').eq('domain', domain).maybeSingle()
    if (data?.id) return data.id as string
  }
  return null
})

function resolveLocalizedText(primary: string | null, english: string | null, locale: Locale) {
  if (locale === 'zh') return primary?.trim() || english?.trim() || ''
  return english?.trim() || primary?.trim() || ''
}

export const getPublishedProducts = cache(async (locale: Locale = 'en'): Promise<PublishedProduct[]> => {
  const tenantId = await getTenantIdForHost()
  if (!tenantId) return []

  const supabase = getPublicProductsClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("products")
    .select('id, name, name_en, description, description_en, category, image_url')
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[frontend-products] load products failed:', error.message)
    return []
  }

  return ((data ?? []) as PublishedProductRow[]).map((row) => ({
    id: row.id,
    name: resolveLocalizedText(row.name, row.name_en, locale),
    description: resolveLocalizedText(row.description, row.description_en, locale) || null,
    category: row.category?.trim() || null,
    image_url: row.image_url,
  }))
})
