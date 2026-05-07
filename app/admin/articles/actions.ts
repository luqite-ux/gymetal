"use server"

import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { uploadToR2, deleteFromR2, isTrustedR2PublicUrl } from "@/lib/r2"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

/** 表单 published_at 字段统一解析为 ISO 字符串；空值 / 非法日期返回 null */
function parsePublishedAt(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const ts = Date.parse(trimmed)
  if (Number.isNaN(ts)) return null
  return new Date(ts).toISOString()
}

export async function createArticle(formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await requireAdminSession()
    const supabase = createClient()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const seoTitle = formData.get("seo_title") as string
    const seoDescription = formData.get("seo_description") as string
    const seoKeywords = formData.get("seo_keywords") as string
    const isPublished = formData.get("is_published") === "true"
    const customPublishedAt = parsePublishedAt(formData.get("published_at"))
    const image = formData.get("featured_image") as File | null
    const preUploadedUrl = (formData.get("featured_image_url") as string | null)?.trim() ?? ""

    let featuredImage: string | null = null
    if (image && image.size > 0) {
      const uploaded = await uploadToR2(image, `news/${session.tenant_id}`)
      featuredImage = uploaded.url
    } else if (preUploadedUrl && isTrustedR2PublicUrl(preUploadedUrl)) {
      featuredImage = preUploadedUrl
    }

    const slug = generateSlug(title) + "-" + Date.now()

    const finalPublishedAt = customPublishedAt
      ?? (isPublished ? new Date().toISOString() : null)

    const { error } = await supabase.from("articles").insert({
      tenant_id: session.tenant_id,
      title,
      slug,
      content,
      excerpt: excerpt || null,
      featured_image: featuredImage,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      seo_keywords: seoKeywords || null,
      is_published: isPublished,
      published_at: finalPublishedAt,
    })

    if (error) return { error: `数据库写入失败: ${error.message}` }
    return {}
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[createArticle]", msg)
    return { error: msg }
  }
}

export async function updateArticle(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await requireAdminSession()
    const supabase = createClient()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const seoTitle = formData.get("seo_title") as string
    const seoDescription = formData.get("seo_description") as string
    const seoKeywords = formData.get("seo_keywords") as string
    const isPublished = formData.get("is_published") === "true"
    const customPublishedAt = parsePublishedAt(formData.get("published_at"))
    const publishedAtCleared = formData.get("published_at") === ""
    const removeFeatured = formData.get("remove_featured_image") === "1"
    const image = formData.get("featured_image") as File | null
    const existingImage = (formData.get("existing_image") as string) || ""
    const preUploadedUrl = (formData.get("featured_image_url") as string | null)?.trim() ?? ""

    let featuredImage: string | null = existingImage || null

    if (removeFeatured) {
      if (existingImage) {
        try {
          await deleteFromR2(existingImage)
        } catch {}
      }
      featuredImage = null
    } else if (image && image.size > 0) {
      if (existingImage) {
        try {
          await deleteFromR2(existingImage)
        } catch {}
      }
      const uploaded = await uploadToR2(image, `news/${session.tenant_id}`)
      featuredImage = uploaded.url
    } else if (preUploadedUrl && isTrustedR2PublicUrl(preUploadedUrl)) {
      if (existingImage && existingImage !== preUploadedUrl) {
        try {
          await deleteFromR2(existingImage)
        } catch {}
      }
      featuredImage = preUploadedUrl
    }

    const { data: currentArticle } = await supabase
      .from("articles")
      .select("is_published")
      .eq("id", id)
      .eq("tenant_id", session.tenant_id)
      .single()

    /**
     * published_at 取值优先级：
     *   1. 用户在表单里手填的发布日期 → 写入这个值
     *   2. 用户清空了发布日期且当前为草稿 → 置空
     *   3. 首次从草稿改为已发布 → 取 now()
     *   4. 其余情况不动数据库已有值
     */
    let publishedAtUpdate: { published_at: string | null } | undefined
    if (customPublishedAt) {
      publishedAtUpdate = { published_at: customPublishedAt }
    } else if (publishedAtCleared && !isPublished) {
      publishedAtUpdate = { published_at: null }
    } else if (isPublished && !currentArticle?.is_published) {
      publishedAtUpdate = { published_at: new Date().toISOString() }
    }

    const { error } = await supabase
      .from("articles")
      .update({
        title,
        content,
        excerpt: excerpt || null,
        featured_image: featuredImage,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywords || null,
        is_published: isPublished,
        ...(publishedAtUpdate ?? {}),
      })
      .eq("id", id)
      .eq("tenant_id", session.tenant_id)

    if (error) return { error: `数据库写入失败: ${error.message}` }
    return {}
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[updateArticle]", msg)
    return { error: msg }
  }
}

export async function deleteArticle(id: string) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("articles")
    .select("featured_image")
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)
    .single()

  if (article?.featured_image) {
    try {
      await deleteFromR2(article.featured_image)
    } catch (e) {
      // Ignore delete errors
    }
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
}

export async function toggleArticlePublish(id: string, publish: boolean) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const { error } = await supabase
    .from("articles")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
}
