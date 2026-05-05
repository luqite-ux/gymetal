import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin-auth"
import { uploadToR2 } from "@/lib/r2"

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession()
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "无效文件" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "仅支持图片文件" }, { status: 400 })
    }

    const url = await uploadToR2(file, `news/${session.tenant_id}/content`)
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
