"use server"

import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"

export async function savePage(pageKey: string, content: Record<string, unknown>) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  // Check if page exists
  const { data: existing } = await supabase
    .from("pages")
    .select("id")
    .eq("tenant_id", session.tenant_id)
    .eq("page_key", pageKey)
    .single()

  if (existing) {
    // Update existing page
    const { error } = await supabase
      .from("pages")
      .update({ content })
      .eq("id", existing.id)
      .eq("tenant_id", session.tenant_id)

    if (error) throw error
  } else {
    // Create new page
    const { error } = await supabase.from("pages").insert({
      tenant_id: session.tenant_id,
      page_key: pageKey,
      content,
    })

    if (error) throw error
  }
}
