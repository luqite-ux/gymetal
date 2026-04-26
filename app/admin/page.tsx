import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MessageSquare, FileText, Layout, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"

async function getDashboardStats(tenantId: string) {
  const supabase = await createClient()

  const [products, inquiries, articles] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
  ])

  return {
    products: products.count ?? 0,
    inquiries: inquiries.count ?? 0,
    articles: articles.count ?? 0,
  }
}

export default async function DashboardPage() {
  const session = await requireAdminSession()
  const stats = await getDashboardStats(session.tenant_id)

  const statCards = [
    { title: "产品", value: stats.products, icon: Package, href: "/admin/products", color: "text-blue-600" },
    { title: "询盘", value: stats.inquiries, icon: MessageSquare, href: "/admin/inquiries", color: "text-green-600" },
    { title: "文章", value: stats.articles, icon: FileText, href: "/admin/articles", color: "text-purple-600" },
  ]

  const quickLinks = [
    { label: "页面编辑", icon: Layout, href: "/admin/pages" },
    { label: "网站设置", icon: Settings, href: "/admin/settings" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">欢迎回来，{session.tenant_name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.href} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <Button variant="link" asChild className="mt-2 h-auto p-0 text-sm text-muted-foreground">
                <Link href={card.href}>
                  查看详情 <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">快捷入口</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Button key={link.href} variant="outline" asChild>
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
