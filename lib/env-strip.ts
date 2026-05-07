/**
 * 从面板复制进 .env 时常见：尾随换行、BOM、NBSP、零宽字符、成对引号。
 * 进入 HTTP Authorization 等头时，Node 会抛出 Invalid character in header content。
 */
export function stripHeaderUnsafeEnv(value: string | undefined): string | undefined {
  if (value === undefined || value === null) return undefined
  let v = String(value).trim()
  if (v.charCodeAt(0) === 0xfeff) {
    v = v.slice(1).trim()
  }
  v = v.replace(/[\r\n\t\u00a0\u200b-\u200d\ufeff]/g, "")
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }
  return v.length > 0 ? v : undefined
}
