import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { SettingsForm } from "./settings-form"

async function getSettings(tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single()

  if (error && error.code !== "PGRST116") throw error
  
  return data ?? {
    site_title: "",
    site_title_en: "",
    site_description: "",
    site_description_en: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_address_en: "",
    social_wechat: "",
    social_twitter: "",
    social_linkedin: "",
    social_facebook: "",
    seo_keywords: "",
    seo_keywords_en: "",
  }
}

export default async function SettingsPage() {
  const session = await requireAdminSession()
  const settings = await getSettings(session.tenant_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">网站设置</h1>
        <p className="text-muted-foreground">管理网站的基本配置</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
