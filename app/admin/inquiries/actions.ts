"use server"

import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"

export async function updateInquiryStatus(id: string, status: "read" | "replied") {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
}

export async function deleteInquiry(id: string) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const { error } = await supabase
    .from("inquiries")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
}
