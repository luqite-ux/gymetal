import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const r2Endpoint = process.env.R2_S3_ENDPOINT?.trim()
const r2PublicUrl =
  process.env.R2_PUBLIC_URL?.trim() || process.env.R2_PUBLIC_URL_PREFIX?.trim()

if (!r2Endpoint || !r2PublicUrl) {
  throw new Error("Missing R2_S3_ENDPOINT or R2_PUBLIC_URL(_PREFIX) in environment")
}

const R2 = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  file: File,
  folder: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  )

  return `${r2PublicUrl}/${filename}`
}

export async function deleteFromR2(url: string): Promise<void> {
  if (!url.startsWith(r2PublicUrl)) return

  const key = url.replace(`${r2PublicUrl}/`, "")

  await R2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  )
}
