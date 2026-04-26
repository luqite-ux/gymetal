import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export interface TenantSession {
  tenant_id: string
  tenant_name: string
  tenant_domain: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/** 用 service role 绕过 RLS。线上常开 RLS 时，anon 对 admin_sessions/tenants 的读写会失败，表现为「一登录就回登录页」。 */
export async function createAdminSession(
  tenantId: string,
  _email: string
): Promise<{ error: string | null }> {
  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    return { error: `环境变量问题：${m}` }
  }
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const { error: insertError } = await supabase.from("admin_sessions").insert({
    tenant_id: tenantId,
    token: sessionToken,
    expires_at: expiresAt.toISOString(),
  })

  if (insertError) {
    console.error("[admin-auth] admin_sessions insert failed:", insertError)
    const reason = [insertError.message, insertError.hint, insertError.code]
      .filter(Boolean)
      .join(" — ")
    return {
      error: `无法写入会话：${reason || "未知错误"}。请确认 ① .env 里 service_role 与 URL 为同一项目 ② 已在 SQL 中创建 admin_sessions 表（scripts/001_create_tables.sql）③ 未把 anon 公钥错填成 SUPABASE_SERVICE_ROLE_KEY`,
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return { error: null }
}

export async function getAdminSession(): Promise<TenantSession | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value

  if (!sessionToken) return null

  let supabase
  try {
    supabase = createAdminClient()
  } catch {
    return null
  }

  const { data: session } = await supabase
    .from("admin_sessions")
    .select("tenant_id, expires_at")
    .eq("token", sessionToken)
    .single()

  if (!session) return null

  if (new Date(session.expires_at) < new Date()) {
    await supabase.from("admin_sessions").delete().eq("token", sessionToken)
    return null
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, site_name, domain, email")
    .eq("id", session.tenant_id)
    .single()

  if (!tenant) return null

  return {
    tenant_id: tenant.id,
    tenant_name: tenant.site_name,
    tenant_domain: tenant.domain,
    email: tenant.email,
  }
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value

  if (sessionToken) {
    try {
      const supabase = createAdminClient()
      await supabase.from("admin_sessions").delete().eq("token", sessionToken)
    } catch {
      // ignore
    }
  }

  cookieStore.set("admin_session", "", { path: "/", maxAge: 0 })
  cookieStore.set("admin_session", "", { path: "/admin", maxAge: 0 })
}

export async function requireAdminSession(): Promise<TenantSession> {
  const session = await getAdminSession()
  if (!session) {
    redirect("/admin/login")
  }
  return session
}
