import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { ArticlesList } from "./articles-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getArticles(tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export default async function ArticlesPage() {
  const session = await requireAdminSession()
  const articles = await getArticles(session.tenant_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
          <p className="text-muted-foreground">管理您的博客文章</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Link>
        </Button>
      </div>

      <ArticlesList articles={articles} />
    </div>
  )
}
