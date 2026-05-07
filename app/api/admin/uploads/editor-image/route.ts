import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { uploadToR2 } from "@/lib/r2"

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i

function looksLikeImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true
  const name = file.name || ""
  return IMAGE_EXT.test(name)
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const purpose = String(formData.get("purpose") ?? "editor")

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "无效文件" }, { status: 400 })
    }

    if (!looksLikeImageFile(file)) {
      return NextResponse.json({ error: "仅支持图片文件" }, { status: 400 })
    }

    const folder =
      purpose === "cover"
        ? `news/${session.tenant_id}`
        : `news/${session.tenant_id}/content`

    const { url, key } = await uploadToR2(file, folder)
    return NextResponse.json({ url, key })
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
