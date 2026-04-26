"use server"

import { requireAdminSession } from "@/lib/admin-auth"
import { createAdminClient as createClient } from "@/lib/supabase/server"
import { uploadToR2, deleteFromR2 } from "@/lib/r2"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const name = formData.get("name") as string
  const nameEn = formData.get("name_en") as string
  const description = formData.get("description") as string
  const descriptionEn = formData.get("description_en") as string
  const category = formData.get("category") as string
  const isActive = formData.get("is_active") === "true"
  const image = formData.get("image") as File | null

  let imageUrl: string | null = null
  if (image && image.size > 0) {
    imageUrl = await uploadToR2(image, `products/${session.tenant_id}`)
  }

  // Get max sort order
  const { data: maxOrder } = await supabase
    .from("products")
    .select("sort_order")
    .eq("tenant_id", session.tenant_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  const sortOrder = (maxOrder?.sort_order ?? 0) + 1

  const { error } = await supabase.from("products").insert({
    tenant_id: session.tenant_id,
    name,
    name_en: nameEn || null,
    description: description || null,
    description_en: descriptionEn || null,
    category: category || null,
    image_url: imageUrl,
    is_active: isActive,
    sort_order: sortOrder,
  })

  if (error) throw error
  redirect("/admin/products")
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const name = formData.get("name") as string
  const nameEn = formData.get("name_en") as string
  const description = formData.get("description") as string
  const descriptionEn = formData.get("description_en") as string
  const category = formData.get("category") as string
  const isActive = formData.get("is_active") === "true"
  const image = formData.get("image") as File | null
  const existingImage = formData.get("existing_image") as string

  let imageUrl = existingImage || null
  
  if (image && image.size > 0) {
    // Delete old image if exists
    if (existingImage) {
      try {
        await deleteFromR2(existingImage)
      } catch (e) {
        // Ignore delete errors
      }
    }
    imageUrl = await uploadToR2(image, `products/${session.tenant_id}`)
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      name_en: nameEn || null,
      description: description || null,
      description_en: descriptionEn || null,
      category: category || null,
      image_url: imageUrl,
      is_active: isActive,
    })
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
  redirect("/admin/products")
}

export async function deleteProduct(id: string) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  // Get product to delete image
  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)
    .single()

  if (product?.image_url) {
    try {
      await deleteFromR2(product.image_url)
    } catch (e) {
      // Ignore delete errors
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
}

export async function updateProductOrder(id: string, newOrder: number) {
  const session = await requireAdminSession()
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update({ sort_order: newOrder })
    .eq("id", id)
    .eq("tenant_id", session.tenant_id)

  if (error) throw error
}
