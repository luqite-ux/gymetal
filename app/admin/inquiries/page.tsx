import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { InquiriesTable } from "./inquiries-table"

async function getInquiries(tenantId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export default async function InquiriesPage() {
  const session = await requireAdminSession()
  const inquiries = await getInquiries(session.tenant_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">询盘管理</h1>
        <p className="text-muted-foreground">查看和管理客户询盘</p>
      </div>

      <InquiriesTable inquiries={inquiries} />
    </div>
  )
}
