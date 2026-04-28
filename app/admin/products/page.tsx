import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { ProductsList } from "./products-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getProducts(tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export default async function ProductsPage() {
  const session = await requireAdminSession()
  const products = await getProducts(session.tenant_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">产品管理</h1>
          <p className="text-sm font-medium text-slate-500">管理您的产品目录与展示顺序</p>
        </div>
        <Button asChild className="rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            添加产品
          </Link>
        </Button>
      </div>

      <ProductsList products={products} />
    </div>
  )
}
