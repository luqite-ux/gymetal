"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import { createAdminSession, verifyPassword } from "@/lib/admin-auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "请填写邮箱和密码" }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY，无法登录" }
  }

  const supabase = await createAdminClient()

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

  const sessionResult = await createAdminSession(tenant.id, tenant.email)
  if (sessionResult.error) {
    return { error: sessionResult.error }
  }

  revalidatePath("/admin")

  return { success: true }
}
