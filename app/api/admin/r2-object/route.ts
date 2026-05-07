import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { fetchR2ObjectStream } from "@/lib/r2"

/**
 * 后台专用的 R2 对象代理：浏览器直连 r2.dev 公网 URL 返回 401（未启用 r2.dev
 * 公开访问）时，仍能在后台正常预览。前台 /news 页面仍走公网 URL。
 *
 * 仅允许读取 `news/<tenant_id>/...` 与 `products/<tenant_id>/...` 下的对象。
 */
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 })
  }

  const url = new URL(request.url)
  const rawKey = url.searchParams.get("key") || ""
  const key = rawKey.replace(/^\/+/, "").trim()

  if (!key) {
    return NextResponse.json({ error: "缺少 key 参数" }, { status: 400 })
  }
  if (key.includes("..") || key.includes("\\")) {
    return NextResponse.json({ error: "非法 key" }, { status: 400 })
  }

  const allowedPrefixes = [
    `news/${session.tenant_id}/`,
    `products/${session.tenant_id}/`,
  ]
  if (!allowedPrefixes.some((p) => key.startsWith(p))) {
    return NextResponse.json({ error: "无权访问此对象" }, { status: 403 })
  }

  try {
    const { body, contentType, contentLength, etag } = await fetchR2ObjectStream(key)

    const headers = new Headers({
      "Content-Type": contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=300, must-revalidate",
    })
    if (typeof contentLength === "number") {
      headers.set("Content-Length", String(contentLength))
    }
    if (etag) {
      headers.set("ETag", etag)
    }

    return new Response(body, { status: 200, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取对象失败"
    const isMissing = /NoSuchKey|NotFound|404/i.test(message)
    return NextResponse.json(
      { error: isMissing ? "对象不存在" : message },
      { status: isMissing ? 404 : 500 }
    )
  }
}
