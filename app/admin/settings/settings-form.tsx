"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save } from "lucide-react"
import { saveSettings, changePassword } from "./actions"

interface Settings {
  id?: string
  site_title: string
  site_title_en: string
  site_description: string
  site_description_en: string
  contact_email: string
  contact_phone: string
  contact_address: string
  contact_address_en: string
  social_wechat: string
  social_twitter: string
  social_linkedin: string
  social_facebook: string
  seo_keywords: string
  seo_keywords_en: string
}

interface SettingsFormProps {
  settings: Settings
}

export function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState(initialSettings)

  const updateField = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    await saveSettings(settings)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
          <TabsTrigger value="seo">SEO 设置</TabsTrigger>
          <TabsTrigger value="security">账号安全</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>网站名称和描述</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_title">网站名称（中文）</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title}
                    onChange={(e) => updateField("site_title", e.target.value)}
                    placeholder="我的网站"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_title_en">网站名称（英文）</Label>
                  <Input
                    id="site_title_en"
                    value={settings.site_title_en}
                    onChange={(e) => updateField("site_title_en", e.target.value)}
                    placeholder="My Website"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_description">网站描述（中文）</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => updateField("site_description", e.target.value)}
                    placeholder="网站简介..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description_en">网站描述（英文）</Label>
                  <Textarea
                    id="site_description_en"
                    value={settings.site_description_en}
                    onChange={(e) => updateField("site_description_en", e.target.value)}
                    placeholder="Website description..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>联系信息</CardTitle>
              <CardDescription>公司联系方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">联系邮箱</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => updateField("contact_email", e.target.value)}
                  placeholder="contact@example.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">联系电话</Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={(e) => updateField("contact_phone", e.target.value)}
                  placeholder="+86 123 4567 8901"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_address">公司地址（中文）</Label>
                  <Textarea
                    id="contact_address"
                    value={settings.contact_address}
                    onChange={(e) => updateField("contact_address", e.target.value)}
                    placeholder="公司详细地址..."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_address_en">公司地址（英文）</Label>
                  <Textarea
                    id="contact_address_en"
                    value={settings.contact_address_en}
                    onChange={(e) => updateField("contact_address_en", e.target.value)}
                    placeholder="Company address..."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>社交媒体</CardTitle>
              <CardDescription>社交媒体账号链接</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="social_wechat">微信公众号</Label>
                  <Input
                    id="social_wechat"
                    value={settings.social_wechat}
                    onChange={(e) => updateField("social_wechat", e.target.value)}
                    placeholder="微信公众号ID"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_twitter">Twitter</Label>
                  <Input
                    id="social_twitter"
                    value={settings.social_twitter}
                    onChange={(e) => updateField("social_twitter", e.target.value)}
                    placeholder="Twitter 链接"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_linkedin">LinkedIn</Label>
                  <Input
                    id="social_linkedin"
                    value={settings.social_linkedin}
                    onChange={(e) => updateField("social_linkedin", e.target.value)}
                    placeholder="LinkedIn 链接"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_facebook">Facebook</Label>
                  <Input
                    id="social_facebook"
                    value={settings.social_facebook}
                    onChange={(e) => updateField("social_facebook", e.target.value)}
                    placeholder="Facebook 链接"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO 设置</CardTitle>
              <CardDescription>搜索引擎优化配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">关键词（中文）</Label>
                  <Input
                    id="seo_keywords"
                    value={settings.seo_keywords}
                    onChange={(e) => updateField("seo_keywords", e.target.value)}
                    placeholder="关键词1, 关键词2, 关键词3"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    多个关键词用逗号分隔
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords_en">关键词（英文）</Label>
                  <Input
                    id="seo_keywords_en"
                    value={settings.seo_keywords_en}
                    onChange={(e) => updateField("seo_keywords_en", e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <PasswordForm />
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
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function PasswordForm() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (next.length < 6) {
      setError("新密码至少 6 位")
      return
    }
    if (next !== confirm) {
      setError("两次输入的新密码不一致")
      return
    }

    setIsLoading(true)
    const result = await changePassword(current, next)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setCurrent("")
      setNext("")
      setConfirm("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
        <CardDescription>修改后需要重新登录</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>密码已修改成功</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="current_password">当前密码</Label>
            <Input
              id="current_password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">新密码</Label>
            <Input
              id="new_password"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">确认新密码</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />修改中...</> : "修改密码"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
