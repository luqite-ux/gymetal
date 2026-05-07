import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { stripHeaderUnsafeEnv } from "@/lib/env-strip"

let _client: S3Client | null = null
let _publicUrl: string | null = null
let _bucketName: string | null = null

function getR2(): { client: S3Client; publicUrl: string; bucket: string } {
  if (!_client || !_publicUrl || !_bucketName) {
    const endpoint = stripHeaderUnsafeEnv(process.env.R2_S3_ENDPOINT)
    const publicUrl =
      stripHeaderUnsafeEnv(process.env.R2_PUBLIC_URL) ||
      stripHeaderUnsafeEnv(process.env.R2_PUBLIC_URL_PREFIX)
    const accessKeyId = stripHeaderUnsafeEnv(process.env.R2_ACCESS_KEY_ID)
    const secretAccessKey = stripHeaderUnsafeEnv(process.env.R2_SECRET_ACCESS_KEY)
    const bucket = stripHeaderUnsafeEnv(process.env.R2_BUCKET_NAME)

    if (!endpoint || !publicUrl) {
      throw new Error("Missing R2_S3_ENDPOINT or R2_PUBLIC_URL(_PREFIX) in environment")
    }
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing or empty R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY after trimming; check .env for line breaks or quotes around keys"
      )
    }
    if (!bucket) {
      throw new Error("Missing or empty R2_BUCKET_NAME after trimming")
    }

    _client = new S3Client({
      region: "auto",
      endpoint,
      // AWS SDK v3.200+ enables CRC32 checksums by default; Cloudflare R2
      // rejects these headers — disable them explicitly.
      requestChecksumCalculation: "when_required",
      responseChecksumValidation: "when_required",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
    _publicUrl = publicUrl
    _bucketName = bucket
  }
  return { client: _client, publicUrl: _publicUrl, bucket: _bucketName }
}

function guessImageContentType(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".gif")) return "image/gif"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".svg")) return "image/svg+xml"
  if (lower.endsWith(".avif")) return "image/avif"
  if (lower.endsWith(".bmp")) return "image/bmp"
  if (lower.endsWith(".ico")) return "image/x-icon"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  return "application/octet-stream"
}

function safeContentType(file: File): string {
  const raw =
    file.type && file.type !== "application/octet-stream"
      ? file.type
      : guessImageContentType(file.name)
  const token = raw.split(/[\r\n;]/)[0]?.trim() || "application/octet-stream"
  if (!/^[\w.+\-]+\/[\w.+\-]+$/.test(token)) {
    return guessImageContentType(file.name)
  }
  return token
}

export interface UploadResult {
  /** 公网可见 URL（写入数据库 / 前台展示），需要在 Cloudflare R2 启用 r2.dev 公开访问或自定义域名才能匿名访问 */
  url: string
  /** R2 对象 Key，用于后台代理流式访问，不依赖公开访问设置 */
  key: string
}

export async function uploadToR2(file: File, folder: string): Promise<UploadResult> {
  const { client, publicUrl, bucket } = getR2()
  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
  const contentType = safeContentType(file)

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return { url: `${publicUrl}/${key}`, key }
}

/** 把已经存在的公网 URL 还原成 R2 Key（不在公网前缀范围内则返回 null） */
export function r2KeyFromPublicUrl(url: string): string | null {
  if (!url) return null
  try {
    const { publicUrl } = getR2()
    const base = publicUrl.replace(/\/$/, "")
    if (!url.startsWith(`${base}/`)) return null
    return url.slice(base.length + 1)
  } catch {
    return null
  }
}

/**
 * 通过 S3 凭证读取 R2 对象。
 *
 * 在 Node runtime 下 GetObject.Body 是 Node `Readable`，并非 Web `ReadableStream`，
 * 直接传给 Web `Response` 既不兼容也容易报错。这里用 AWS SDK 自带的 `transformToByteArray`
 * 缓冲为 Uint8Array（封面/插图体积通常不大），路由层直接交给 `Response` 即可。
 */
export async function fetchR2ObjectBytes(
  key: string
): Promise<{ bytes: Uint8Array; contentType: string; contentLength: number; etag?: string }> {
  const { client, bucket } = getR2()
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
  const body = result.Body as
    | { transformToByteArray?: () => Promise<Uint8Array> }
    | undefined
  if (!body || typeof body.transformToByteArray !== "function") {
    throw new Error("R2 object body has no transformToByteArray helper")
  }
  const bytes = await body.transformToByteArray()
  return {
    bytes,
    contentType: result.ContentType || "application/octet-stream",
    contentLength:
      typeof result.ContentLength === "number" ? result.ContentLength : bytes.byteLength,
    etag: result.ETag,
  }
}

/** 仅允许本站已上传的 R2 地址写入数据库，防止通过表单伪造外链 */
export function isTrustedR2PublicUrl(url: string): boolean {
  const u = url.trim()
  if (!u) return false
  try {
    const { publicUrl } = getR2()
    const base = publicUrl.replace(/\/$/, "")
    return u.startsWith(`${base}/`)
  } catch {
    return false
  }
}

export async function deleteFromR2(url: string): Promise<void> {
  const { client, publicUrl, bucket } = getR2()
  if (!url.startsWith(publicUrl)) return

  const key = url.replace(`${publicUrl}/`, "")

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}
