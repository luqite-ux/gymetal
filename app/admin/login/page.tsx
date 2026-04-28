"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldCheck, Sparkles, Lock, Globe2 } from "lucide-react"
import { loginAction } from "./actions"

function isNextRedirectError(e: unknown) {
  return (
    e !== null &&
    typeof e === "object" &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string" &&
    String((e as { digest: string }).digest).includes("NEXT_REDIRECT")
  )
}

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const showSessionHelp = reason === "unauthorized"

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAction(formData)
      if (result && "error" in result && result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      // 若未触发 redirect 抛出（理论少见），回退为整页跳转
      window.location.assign("/admin")
    } catch (e) {
      if (isNextRedirectError(e)) {
        return
      }
      setError("登录过程出错，请重试。")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40">
        <section className="hidden w-[46%] flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-black">GY</div>
              <div>
                <p className="text-base font-black tracking-tight">管理中心</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Control Center</p>
              </div>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight">
              欢迎回到
              <br />
              GY 智能管理后台
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              集中处理询盘、产品与内容运营，持续优化站点表现与转化效率。
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              多租户隔离与会话安全校验
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <Globe2 className="h-4 w-4 text-blue-300" />
              站点内容与 SEO 配置一体化管理
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-10">
          <Card className="w-full max-w-md rounded-3xl border-slate-100 shadow-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black tracking-tight text-slate-900">管理后台登录</CardTitle>
                <CardDescription className="mt-2 text-sm font-medium text-slate-500">
                  请输入管理员账号信息以继续
                </CardDescription>
              </div>
              <div className="mx-auto inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-600">
                <Sparkles className="h-3.5 w-3.5" />
                安全访问
              </div>
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
                  <Label htmlFor="email" className="text-slate-700">邮箱地址</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="请输入邮箱"
                    required
                    disabled={isLoading}
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">密码</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="请输入密码"
                    required
                    disabled={isLoading}
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-100"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
                  disabled={isLoading}
                >
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
        </section>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">加载中…</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
