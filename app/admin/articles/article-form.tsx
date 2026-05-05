"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false)
  const [title, setTitle] = useState(article?.title ?? "")
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "")
  const [content, setContent] = useState(article?.content ?? "")
  const [preview, setPreview] = useState<string | null>(article?.featured_image ?? null)
  const [lastSavedAt, setLastSavedAt] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const draftKey = useMemo(
    () => `article-editor-draft:${article?.id ?? "new"}`,
    [article?.id]
  )

  useEffect(() => {
    const raw = localStorage.getItem(draftKey)
    if (!raw) return

    try {
      const draft = JSON.parse(raw) as {
        title?: string
        excerpt?: string
        content?: string
        isPublished?: boolean
      }

      if (draft.title) setTitle(draft.title)
      if (typeof draft.excerpt === "string") setExcerpt(draft.excerpt)
      if (draft.content) setContent(draft.content)
      if (typeof draft.isPublished === "boolean") setIsPublished(draft.isPublished)
      setLastSavedAt("已恢复草稿")
    } catch {
      // ignore broken local draft payload
    }
  }, [draftKey])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          title,
          excerpt,
          content,
          isPublished,
        })
      )
      setLastSavedAt(`草稿自动保存：${new Date().toLocaleTimeString("zh-CN")}`)
    }, 800)

    return () => window.clearTimeout(timer)
  }, [content, draftKey, excerpt, isPublished, title])

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
    formData.set("title", title)
    formData.set("excerpt", excerpt)
    formData.set("content", content)
    formData.set("is_published", isPublished.toString())
    if (article?.featured_image && !formData.get("featured_image")) {
      formData.set("existing_image", article.featured_image)
    }

    try {
      if (article) {
        await updateArticle(article.id, formData)
      } else {
        await createArticle(formData)
      }
      localStorage.removeItem(draftKey)
      router.push("/admin/articles")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存失败，请重试"
      toast.error(msg)
      setIsLoading(false)
    }
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
          {lastSavedAt ? (
            <span className="text-xs text-muted-foreground">{lastSavedAt}</span>
          ) : null}
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
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
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
