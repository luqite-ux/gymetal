"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save } from "lucide-react"
import { savePage } from "./actions"

interface HomePageContent {
  hero_title: string
  hero_subtitle: string
  hero_cta: string
  about_title: string
  about_text: string
  services_title: string
  services_text: string
  cta_title: string
  cta_text: string
}

interface Page {
  id?: string
  page_key: string
  content: HomePageContent
}

interface PagesEditorProps {
  homePage: Page
}

export function PagesEditor({ homePage }: PagesEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState<HomePageContent>(homePage.content)

  const updateField = (field: keyof HomePageContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    await savePage("home", content)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">首页横幅</TabsTrigger>
          <TabsTrigger value="about">关于我们</TabsTrigger>
          <TabsTrigger value="services">服务介绍</TabsTrigger>
          <TabsTrigger value="cta">行动召唤</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>首页横幅</CardTitle>
              <CardDescription>网站首页的主要展示区域</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_title">主标题</Label>
                <Input
                  id="hero_title"
                  value={content.hero_title}
                  onChange={(e) => updateField("hero_title", e.target.value)}
                  placeholder="欢迎来到我们的网站"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">副标题</Label>
                <Textarea
                  id="hero_subtitle"
                  value={content.hero_subtitle}
                  onChange={(e) => updateField("hero_subtitle", e.target.value)}
                  placeholder="专业的产品和服务..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_cta">按钮文字</Label>
                <Input
                  id="hero_cta"
                  value={content.hero_cta}
                  onChange={(e) => updateField("hero_cta", e.target.value)}
                  placeholder="了解更多"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>关于我们</CardTitle>
              <CardDescription>公司简介和背景信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about_title">标题</Label>
                <Input
                  id="about_title"
                  value={content.about_title}
                  onChange={(e) => updateField("about_title", e.target.value)}
                  placeholder="关于我们"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about_text">内容</Label>
                <Textarea
                  id="about_text"
                  value={content.about_text}
                  onChange={(e) => updateField("about_text", e.target.value)}
                  placeholder="公司简介..."
                  rows={6}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>服务介绍</CardTitle>
              <CardDescription>主要服务和业务范围</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="services_title">标题</Label>
                <Input
                  id="services_title"
                  value={content.services_title}
                  onChange={(e) => updateField("services_title", e.target.value)}
                  placeholder="我们的服务"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="services_text">内容</Label>
                <Textarea
                  id="services_text"
                  value={content.services_text}
                  onChange={(e) => updateField("services_text", e.target.value)}
                  placeholder="服务介绍..."
                  rows={6}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>行动召唤</CardTitle>
              <CardDescription>引导用户采取行动的区域</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cta_title">标题</Label>
                <Input
                  id="cta_title"
                  value={content.cta_title}
                  onChange={(e) => updateField("cta_title", e.target.value)}
                  placeholder="联系我们"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_text">内容</Label>
                <Textarea
                  id="cta_text"
                  value={content.cta_text}
                  onChange={(e) => updateField("cta_text", e.target.value)}
                  placeholder="准备好开始了吗？..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存更改
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
