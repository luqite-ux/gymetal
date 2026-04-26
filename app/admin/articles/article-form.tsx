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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, X, ArrowLeft } from "lucide-react"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { createArticle, updateArticle } from "./actions"

interface Article {
  id: string
  title: string
  content: string
  excerpt: string | null
  featured_image: string | null
  is_published: boolean
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
}

interface ArticleFormProps {
  article?: Article
}

export function ArticleForm({ article }: ArticleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false)
  const [content, setContent] = useState(article?.content ?? "")
  const [preview, setPreview] = useState<string | null>(article?.featured_image ?? null)
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
    formData.set("content", content)
    formData.set("is_published", isPublished.toString())
    if (article?.featured_image && !formData.get("featured_image")) {
      formData.set("existing_image", article.featured_image)
    }

    if (article) {
      await updateArticle(article.id, formData)
    } else {
      await createArticle(formData)
    }
    setIsLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/articles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Switch
            checked={isPublished}
            onCheckedChange={setIsPublished}
            disabled={isLoading}
          />
          <Label>{isPublished ? "已发布" : "草稿"}</Label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文章内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={article?.title}
                  required
                  disabled={isLoading}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  defaultValue={article?.excerpt ?? ""}
                  rows={2}
                  disabled={isLoading}
                  placeholder="文章简短描述..."
                />
              </div>

              <div className="space-y-2">
                <Label>正文 *</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>特色图片</CardTitle>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
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
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">上传图片</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                name="featured_image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO 设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO 标题</Label>
                <Input
                  id="seo_title"
                  name="seo_title"
                  defaultValue={article?.seo_title ?? ""}
                  disabled={isLoading}
                  placeholder="页面标题..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO 描述</Label>
                <Textarea
                  id="seo_description"
                  name="seo_description"
                  defaultValue={article?.seo_description ?? ""}
                  rows={3}
                  disabled={isLoading}
                  placeholder="页面描述..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_keywords">关键词</Label>
                <Input
                  id="seo_keywords"
                  name="seo_keywords"
                  defaultValue={article?.seo_keywords ?? ""}
                  disabled={isLoading}
                  placeholder="关键词1, 关键词2..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/articles">取消</Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "保存文章"
          )}
        </Button>
      </div>
    </form>
  )
}
