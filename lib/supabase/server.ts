import { createClient as createSupabaseServiceClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripHeaderUnsafeEnv } from '@/lib/env-strip'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? '',
    stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
          }
        },
      },
    },
  )
}

/** 前台公开数据专用：使用 anon key，并由 Supabase RLS 限制为公开可读内容。 */
export function createPublicClient(): SupabaseClient {
  const url = stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createSupabaseServiceClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

function decodeJwtRole(key: string): string | null {
  try {
    const part = key.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(
      typeof Buffer !== 'undefined'
        ? Buffer.from(b64, 'base64').toString('utf8')
        : atob(b64)
    ) as { role?: string }
    return json.role ?? null
  } catch {
    return null
  }
}

/**
 * 后台专用：用 service role 直连 PostgREST，不绑 SSR Cookie。
 * 若误把 anon 公钥填进 SUPABASE_SERVICE_ROLE_KEY，会在这里打印警告，插入会按 RLS 失败。
 */
export function createAdminClient(): SupabaseClient {
  const url = stripHeaderUnsafeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = stripHeaderUnsafeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  if (key.length < 32) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY looks too short; paste the full service_role value from Supabase')
  }
  const role = decodeJwtRole(key)
  if (role && role !== 'service_role') {
    console.error(
      `[supabase] SUPABASE_SERVICE_ROLE_KEY 的 JWT role 是 "${role}"，应为 "service_role"。` +
        ' 请使用 Supabase → Project Settings → API → service_role（secret），不要用 anon 公钥。'
    )
  }
  return createSupabaseServiceClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
