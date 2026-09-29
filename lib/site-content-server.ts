import 'server-only'
import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import { stripHeaderUnsafeEnv } from '@/lib/env-strip'
import { CONTENT_KEY, validateSnapshot, overlayTranslations } from '@/lib/site-content-model'
import { getTranslations, type Locale } from '@/lib/i18n'
import defaults from '@/lib/site-content-defaults.json'

export const defaultSiteContent = validateSnapshot(defaults)

// A self-hosted site must not use an arbitrary request Host to select a tenant.
export const getContentTenantId = cache(async () => {
  const db = createAdminClient()
  const { data, error } = await db.from('tenants').select('id').eq('domain','gymetaltech.com').single()
  if (error || !data) throw new Error('无法确认广跃站点租户')
  const configured = stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_TENANT_ID)
  if (configured && configured !== data.id) throw new Error('站点租户配置与域名不一致')
  return data.id as string
})

export const getPublishedSiteContent = cache(async () => {
  const tenantId = await getContentTenantId()
  const {data,error} = await createAdminClient().from('content_entries')
    .select('published_data,published_at,status').eq('tenant_id',tenantId).eq('kind','page_section').eq('content_key',CONTENT_KEY).maybeSingle()
  // Never resurrect removed equipment on a database error.
  if(error) throw new Error('网站内容暂时无法读取，请稍后重试')
  if(!data?.published_at) return defaultSiteContent
  if(data.status !== 'published') throw new Error('网站内容未处于发布状态，请联系管理员')
  const snapshot = validateSnapshot(data.published_data)
  return { ...snapshot, equipment:snapshot.equipment.filter(item => item.active) }
})

export async function getSiteTranslations(locale:Locale) {
  const content = await getPublishedSiteContent()
  return overlayTranslations(getTranslations(locale),content.texts,locale)
}
