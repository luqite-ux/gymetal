import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductForm } from "../product-form"

async function getProduct(id: string, tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single()

  if (error || !data) return null
  return data
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireAdminSession()
  const product = await getProduct(id, session.tenant_id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">编辑产品</h1>
        <p className="text-muted-foreground">修改产品信息</p>
      </div>

      <ProductForm product={product} />
    </div>
  )
}
