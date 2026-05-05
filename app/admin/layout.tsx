import { getAdminSession } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {session && !isLoginRoute ? (
        <div className="flex min-h-screen">
          <AdminSidebar session={session} />
          <main className="relative flex-1 overflow-auto">
            <div className="sticky top-0 z-20 h-1.5 w-full bg-gradient-to-r from-blue-600 via-violet-600 to-rose-500" />
            <div className="p-4 md:p-6 lg:p-8">
              <div className="mb-4 flex justify-end">
                <Button asChild variant="outline" className="rounded-xl bg-white">
                  <Link href="/" target="_blank" rel="noopener noreferrer">
                    查看 Home
                  </Link>
                </Button>
              </div>
              <div className="min-h-[calc(100vh-5rem)] rounded-3xl border border-slate-100 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
