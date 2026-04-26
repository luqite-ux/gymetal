"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield } from "lucide-react"
import { loginAction } from "./actions"

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const showSessionHelp = reason === "unauthorized"

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await loginAction(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      window.location.assign("/admin")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">管理后台登录</CardTitle>
          <CardDescription>
            演示账号见种子 <span className="font-mono text-xs">scripts/002_seed_demo_tenant.sql</span>：邮箱{" "}
            <span className="whitespace-nowrap">admin@gymetall.com</span>，默认密码 <span className="font-mono">admin123</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {showSessionHelp && (
              <Alert variant="default" className="border-amber-500/40 text-sm text-foreground">
                <AlertDescription>
                  当前会话无效或无法校验（<span className="font-mono">?reason=unauthorized</span>）。若你刚提交过登录，请：① 在开发者工具
                  <strong> Network </strong>中查看对 <span className="font-mono">/admin</span> 的请求是否带 Cookie{" "}
                  <span className="font-mono">admin_session</span>；② 在 Supabase 中核对 <span className="font-mono">admin_sessions</span> 是否有对应行、
                  <span className="font-mono">tenants</span> 中是否存在 <span className="font-mono">site_name</span> 等列；③ 终端与服务器日志中的{" "}
                  <span className="font-mono">[getAdminSession]</span> 输出。
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@gymetall.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="（种子默认）admin123"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30 text-muted-foreground text-sm">加载中…</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
