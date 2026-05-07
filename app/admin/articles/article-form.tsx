"use client"

import { useEffect, useMemo, useState } from "react"
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
  /** 当前特色图（已有 R2 地址或上传成功后写入），用于展示与提交 */
  const [coverUrl, setCoverUrl] = useState<string | null>(article?.featured_image ?? null)
  /** 用户点击删除后，更新文章时需清空数据库中的特色图 */
  const [coverExplicitlyRemoved, setCoverExplicitlyRemoved] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string>("")
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
        coverUrl?: string | null
        coverExplicitlyRemoved?: boolean
      }

      if (draft.title) setTitle(draft.title)
      if (typeof draft.excerpt === "string") setExcerpt(draft.excerpt)
      if (draft.content) setContent(draft.content)
      if (typeof draft.isPublished === "boolean") setIsPublished(draft.isPublished)
      if ("coverUrl" in draft) setCoverUrl(draft.coverUrl ?? null)
      if (typeof draft.coverExplicitlyRemoved === "boolean") {
        setCoverExplicitlyRemoved(draft.coverExplicitlyRemoved)
      }
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
          coverUrl,
          coverExplicitlyRemoved,
        })
      )
      setLastSavedAt(`草稿自动保存：${new Date().toLocaleTimeString("zh-CN")}`)
    }, 800)

    return () => window.clearTimeout(timer)
  }, [content, coverExplicitlyRemoved, coverUrl, draftKey, excerpt, isPublished, title])

  const uploadCoverFile = async (file: File) => {
    setCoverUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("purpose", "cover")
      const response = await fetch("/api/admin/uploads/editor-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      const data = (await response.json()) as { url?: string; error?: string }
      if (!response.ok) {
        throw new Error(data.error || "上传失败")
      }
      if (!data.url) {
        throw new Error("返回地址为空")
      }
      setCoverUrl(data.url)
      setCoverExplicitlyRemoved(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传图片失败"
      toast.error(message)
    } finally {
      setCoverUploading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void uploadCoverFile(file)
    }
    e.target.value = ""
  }

  const removeImage = () => {
    setCoverUrl(null)
    setCoverExplicitlyRemoved(true)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.set("title", title)
    formData.set("excerpt", excerpt)
    formData.set("content", content)
    formData.set("is_published", isPublished.toString())

    if (coverExplicitlyRemoved) {
      formData.set("remove_featured_image", "1")
    } else if (coverUrl) {
      formData.set("featured_image_url", coverUrl)
      if (article?.featured_image) {
        formData.set("existing_image", article.featured_image)
      }
    } else if (article?.featured_image) {
      formData.set("existing_image", article.featured_image)
    }

    const result = article
      ? await updateArticle(article.id, formData)
      : await createArticle(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    localStorage.removeItem(draftKey)
    router.push("/admin/articles")
  }

  return (
    <form action={handleSubmit} className="space-y-6 pb-24">
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
              {coverUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={coverUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={removeImage}
                    disabled={isLoading || coverUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => document.getElementById("article-cover-file")?.click()}
                  disabled={isLoading || coverUploading}
                >
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {coverUploading ? "正在上传…" : "上传图片"}
                  </p>
                </button>
              )}
              <input
                id="article-cover-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading || coverUploading}
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
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="fixed right-5 top-1/2 z-40 min-w-[104px] -translate-y-1/2 shadow-lg max-md:right-3 max-md:min-w-[88px]"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            保存中…
          </>
        ) : (
          "保存文章"
        )}
      </Button>
    </form>
  )
}
