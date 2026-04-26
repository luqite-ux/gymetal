import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { PagesEditor } from "./pages-editor"

async function getPages(tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("tenant_id", tenantId)

  if (error) throw error
  return data ?? []
}

export default async function PagesPage() {
  const session = await requireAdminSession()
  const pages = await getPages(session.tenant_id)

  // Find or create default pages
  const homePage = pages.find((p) => p.page_key === "home") ?? {
    page_key: "home",
    content: {
      hero_title: "",
      hero_subtitle: "",
      hero_cta: "",
      about_title: "",
      about_text: "",
      services_title: "",
      services_text: "",
      cta_title: "",
      cta_text: "",
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">页面编辑</h1>
        <p className="text-muted-foreground">编辑网站各页面的内容</p>
      </div>

      <PagesEditor homePage={homePage} />
    </div>
  )
}
