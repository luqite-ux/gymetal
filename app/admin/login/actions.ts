"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminSession, verifyPassword } from "@/lib/admin-auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "请填写邮箱和密码" }
  }

  const supabase = await createClient()

  // Find tenant by email
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, email, password_hash")
    .eq("email", email)
    .single()

  // 调试日志：检查数据库连接和查询结果
  console.log("[v0] Login attempt for email:", email)
  console.log("[v0] Supabase query error:", error)
  console.log("[v0] Tenant found:", tenant ? { id: tenant.id, email: tenant.email } : null)

  if (error || !tenant) {
    return { error: "邮箱或密码错误" }
  }

  // Verify password
  const isValid = await verifyPassword(password, tenant.password_hash)
  if (!isValid) {
    return { error: "邮箱或密码错误" }
  }

  // Create session
  await createAdminSession(tenant.id, tenant.email)
  revalidatePath("/admin")

  return { success: true }
}
