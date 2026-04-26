"use server"

import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"

interface Settings {
  site_title: string
  site_title_en: string
  site_description: string
  site_description_en: string
  contact_email: string
  contact_phone: string
  contact_address: string
  contact_address_en: string
  social_wechat: string
  social_twitter: string
  social_linkedin: string
  social_facebook: string
  seo_keywords: string
  seo_keywords_en: string
}

export async function saveSettings(settings: Settings) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  // Check if settings exist
  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .eq("tenant_id", session.tenant_id)
    .single()

  const settingsData = {
    site_title: settings.site_title || null,
    site_title_en: settings.site_title_en || null,
    site_description: settings.site_description || null,
    site_description_en: settings.site_description_en || null,
    contact_email: settings.contact_email || null,
    contact_phone: settings.contact_phone || null,
    contact_address: settings.contact_address || null,
    contact_address_en: settings.contact_address_en || null,
    social_wechat: settings.social_wechat || null,
    social_twitter: settings.social_twitter || null,
    social_linkedin: settings.social_linkedin || null,
    social_facebook: settings.social_facebook || null,
    seo_keywords: settings.seo_keywords || null,
    seo_keywords_en: settings.seo_keywords_en || null,
  }

  if (existing) {
    // Update existing settings
    const { error } = await supabase
      .from("settings")
      .update(settingsData)
      .eq("id", existing.id)
      .eq("tenant_id", session.tenant_id)

    if (error) throw error
  } else {
    // Create new settings
    const { error } = await supabase.from("settings").insert({
      tenant_id: session.tenant_id,
      ...settingsData,
    })

    if (error) throw error
  }
}
