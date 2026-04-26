import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // TODO: 临时硬编码用于测试，测试完需要改回环境变量
  const supabaseUrl = 'https://kznqbvcyehtjcsgkurso.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bnFidmN5ZWh0amNzZ2t1cnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTAxNjEsImV4cCI6MjA5MDUyNjE2MX0.Agcw-V6k4wxyfcn4jrzuYlft0lVpBSSbIltyRLXd5e0'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

// Create admin client with service role for bypassing RLS
export async function createAdminClient() {
  const cookieStore = await cookies()

  // TODO: 临时硬编码用于测试，测试完需要改回环境变量
  const supabaseUrl = 'https://kznqbvcyehtjcsgkurso.supabase.co'
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bnFidmN5ZWh0amNzZ2t1cnNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MDE2MSwiZXhwIjoyMDkwNTI2MTYxfQ.LERIAxBkOi7-QgjRksmTrIjIU2uzCENKyoEPOlfQnzc'

  return createServerClient(
    supabaseUrl,
    serviceRoleKey,
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
