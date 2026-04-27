import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** 供 Layout 判断当前路径，避免登录页套一层带侧栏的壳 */
export function requestHeadersWithPathname(request: NextRequest) {
  const h = new Headers(request.headers)
  h.set("x-pathname", request.nextUrl.pathname)
  return h
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeadersWithPathname(request) },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            request: { headers: requestHeadersWithPathname(request) },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  try {
    await supabase.auth.getUser()
  } catch {
    // 避免 Edge 上 auth 服务偶发错误导致整站中间件 500/白屏
  }

  return supabaseResponse
}
