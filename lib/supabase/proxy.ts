import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // TODO: 临时硬编码用于测试，测试完需要改回环境变量
  const supabaseUrl = 'https://kznqbvcyehtjcsgkurso.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bnFidmN5ZWh0amNzZ2t1cnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTAxNjEsImV4cCI6MjA5MDUyNjE2MX0.Agcw-V6k4wxyfcn4jrzuYlft0lVpBSSbIltyRLXd5e0'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
