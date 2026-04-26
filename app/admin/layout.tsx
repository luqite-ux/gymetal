import { getAdminSession } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()

  return (
    <div className="min-h-screen bg-background">
      {session ? (
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
