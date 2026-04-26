"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, X, ArrowLeft } from "lucide-react"
import { createProduct, updateProduct } from "./actions"

interface Product {
  id: string
  name: string
  name_en: string | null
  description: string | null
  description_en: string | null
  image_url: string | null
  category: string | null
  is_active: boolean
}

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.set("is_active", isActive.toString())
    if (product?.image_url && !formData.get("image")) {
      formData.set("existing_image", product.image_url)
    }
    
    if (product) {
      await updateProduct(product.id, formData)
    } else {
      await createProduct(formData)
    }
    setIsLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">产品名称（中文） *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_en">产品名称（英文）</Label>
                <Input
                  id="name_en"
                  name="name_en"
                  defaultValue={product?.name_en ?? ""}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description">产品描述（中文）</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_en">产品描述（英文）</Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  defaultValue={product?.description_en ?? ""}
                  rows={4}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">产品分类</Label>
              <Input
                id="category"
                name="category"
                defaultValue={product?.category ?? ""}
                disabled={isLoading}
                placeholder="例如：CNC铣削、CNC车削..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>上架状态</Label>
                <p className="text-sm text-muted-foreground">
                  产品是否在网站上显示
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>产品图片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preview ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">点击上传图片</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 JPG, PNG, WebP 格式
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">取消</Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "保存产品"
          )}
        </Button>
      </div>
    </form>
  )
}
