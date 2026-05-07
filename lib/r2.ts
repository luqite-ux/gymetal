import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
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

export async function uploadToR2(file: File, folder: string): Promise<string> {
  const { client, publicUrl, bucket } = getR2()
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
  const contentType = safeContentType(file)

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return `${publicUrl}/${filename}`
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
