import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin-auth"

/** 已登录时访问 /admin/login 再跳仪表盘（在服务端校验 DB，不依赖中间件里「有 cookie 就算登录」） */
export default async function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (session) {
    redirect("/admin")
  }
  return <>{children}</>
}
