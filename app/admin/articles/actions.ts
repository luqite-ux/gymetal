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
    const image = formData.get("featured_image") as File | null
    const preUploadedUrl = (formData.get("featured_image_url") as string | null)?.trim() ?? ""

    let featuredImage: string | null = null
    if (image && image.size > 0) {
      featuredImage = await uploadToR2(image, `news/${session.tenant_id}`)
    } else if (preUploadedUrl && isTrustedR2PublicUrl(preUploadedUrl)) {
      featuredImage = preUploadedUrl
    }

    const slug = generateSlug(title) + "-" + Date.now()

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
      published_at: isPublished ? new Date().toISOString() : null,
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
      featuredImage = await uploadToR2(image, `news/${session.tenant_id}`)
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

    const publishedAt = isPublished && !currentArticle?.is_published
      ? new Date().toISOString()
      : undefined

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
        ...(publishedAt && { published_at: publishedAt }),
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
