import { NextResponse, type NextRequest } from "next/server"
import { requestHeadersWithPathname, updateSession } from "@/lib/supabase/proxy"

/**
 * 注意：不能在「仅存在 admin_session」时把 /admin/login 重定向到 /admin。
 * 若 cookie 与 DB 会话不一致，RSC 会 redirect 回登录，中间件再拉回 /admin，形成
 * 无限重定向 + 白屏闪烁（线上 Vercel 比本地更容易触发）。
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 后台只校验自定义 admin_session，不经由 Supabase Auth 刷新，减少 Edge
  // 一次网络、Cookie 被反复改写，也避免与 admin 自管 session 相互干扰
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next({
        request: { headers: requestHeadersWithPathname(request) },
      })
    }
    if (!request.cookies.get("admin_session")?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    return NextResponse.next({
      request: { headers: requestHeadersWithPathname(request) },
    })
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
