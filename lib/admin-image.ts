/**
 * 把已存的公网 URL 还原成 R2 对象 Key，再拼成后台代理地址。
 * 这样不需要在 Cloudflare 启用 r2.dev 公共访问也能让后台预览出图。
 *
 * 通过 NEXT_PUBLIC_R2_PUBLIC_URL_PREFIX / NEXT_PUBLIC_R2_PUBLIC_URL 暴露给浏览器；
 * 当未配置时，会启发式识别 r2.dev / r2.cloudflarestorage.com 主机。
 */

const PUBLIC_PREFIXES: ReadonlyArray<string> = (() => {
  const list: string[] = []
  const a = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "")
  const b = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_PREFIX?.replace(/\/$/, "")
  if (a) list.push(a)
  if (b && b !== a) list.push(b)
  return list
})()

function looksLikeR2PublicHost(hostname: string): boolean {
  if (!hostname) return false
  const lower = hostname.toLowerCase()
  return (
    lower.endsWith(".r2.dev") ||
    lower.endsWith(".r2.cloudflarestorage.com")
  )
}

/** 输入任意已上传的公网 URL，返回 `/api/admin/r2-object?key=...`；无法解析时返回原 URL。 */
export function buildAdminPreviewUrl(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null
  const url = String(publicUrl).trim()
  if (!url) return null

  for (const prefix of PUBLIC_PREFIXES) {
    if (url.startsWith(`${prefix}/`)) {
      const key = url.slice(prefix.length + 1)
      if (key) return `/api/admin/r2-object?key=${encodeURIComponent(key)}`
    }
  }

  try {
    const parsed = new URL(url)
    if (looksLikeR2PublicHost(parsed.hostname)) {
      const key = parsed.pathname.replace(/^\/+/, "")
      if (key) return `/api/admin/r2-object?key=${encodeURIComponent(key)}`
    }
  } catch {
    // 解析失败时使用原 URL
  }

  return url
}
