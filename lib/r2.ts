import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

let _client: S3Client | null = null
let _publicUrl: string | null = null

function getR2(): { client: S3Client; publicUrl: string } {
  if (!_client || !_publicUrl) {
    const endpoint = process.env.R2_S3_ENDPOINT?.trim()
    const publicUrl =
      process.env.R2_PUBLIC_URL?.trim() || process.env.R2_PUBLIC_URL_PREFIX?.trim()

    if (!endpoint || !publicUrl) {
      throw new Error("Missing R2_S3_ENDPOINT or R2_PUBLIC_URL(_PREFIX) in environment")
    }

    _client = new S3Client({
      region: "auto",
      endpoint,
      // AWS SDK v3.200+ enables CRC32 checksums by default; Cloudflare R2
      // rejects these headers — disable them explicitly.
      requestChecksumCalculation: "when_required",
      responseChecksumValidation: "when_required",
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
    _publicUrl = publicUrl
  }
  return { client: _client, publicUrl: _publicUrl }
}

export async function uploadToR2(file: File, folder: string): Promise<string> {
  const { client, publicUrl } = getR2()
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  )

  return `${publicUrl}/${filename}`
}

export async function deleteFromR2(url: string): Promise<void> {
  const { client, publicUrl } = getR2()
  if (!url.startsWith(publicUrl)) return

  const key = url.replace(`${publicUrl}/`, "")

  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  )
}
