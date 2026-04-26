import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArticleForm } from "../article-form"

async function getArticle(id: string, tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single()

  if (error || !data) return null
  return data
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireAdminSession()
  const article = await getArticle(id, session.tenant_id)

  if (!article) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">编辑文章</h1>
        <p className="text-muted-foreground">修改文章内容</p>
      </div>

      <ArticleForm article={article} />
    </div>
  )
}
