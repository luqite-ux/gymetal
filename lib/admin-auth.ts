import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

export async function createAdminSession(tenantId: string, email: string): Promise<string> {
  const supabase = await createClient()
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await supabase.from("admin_sessions").insert({
    tenant_id: tenantId,
    token: sessionToken,
    expires_at: expiresAt.toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/admin",
  })

  return sessionToken
}

export async function getAdminSession(): Promise<TenantSession | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value

  if (!sessionToken) return null

  const supabase = await createClient()
  
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
    const supabase = await createClient()
    await supabase.from("admin_sessions").delete().eq("token", sessionToken)
  }

  cookieStore.delete("admin_session")
}

export async function requireAdminSession(): Promise<TenantSession> {
  const session = await getAdminSession()
  if (!session) {
    redirect("/admin/login")
  }
  return session
}
