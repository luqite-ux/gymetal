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
      error: `无法写入会话：${reason || "未知错误"}。请确认 ① 同一项目 ② 未误填 anon 为 service_role。若提示找不到 token 列，请在 Supabase SQL 执行 scripts/003_align_admin_sessions_token_column.sql（将旧列名 session_token 改为 token）`,
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
  } catch (e) {
    console.error("[getAdminSession] createAdminClient failed:", e)
    return null
  }

  const { data: session, error: sessionErr } = await supabase
    .from("admin_sessions")
    .select("tenant_id, expires_at")
    .eq("token", sessionToken)
    .single()

  if (sessionErr) {
    console.error(
      "[getAdminSession] admin_sessions select:",
      sessionErr.message,
      sessionErr.code ?? "",
    )
  }
  if (!session) return null

  if (new Date(session.expires_at) < new Date()) {
    await supabase.from("admin_sessions").delete().eq("token", sessionToken)
    return null
  }

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, name, domain, email")
    .eq("id", session.tenant_id)
    .single()

  if (tenantErr) {
    console.error(
      "[getAdminSession] tenants select:",
      tenantErr.message,
      tenantErr.code ?? "",
    )
  }
  if (!tenant) return null

  return {
    tenant_id: tenant.id,
    tenant_name: tenant.name,
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
    redirect("/admin/login?reason=unauthorized")
  }
  return session
}
