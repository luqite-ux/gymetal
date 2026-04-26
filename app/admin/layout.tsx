import { getAdminSession } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { headers } from "next/headers"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  const path = (await headers()).get("x-pathname") ?? ""
  const isLoginRoute =
    path === "/admin/login" || path.startsWith("/admin/login/")

  return (
    <div className="min-h-screen bg-background">
      {session && !isLoginRoute ? (
        <div className="flex min-h-screen">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
