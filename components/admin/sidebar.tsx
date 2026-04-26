"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  FileText,
  Layout,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react"
import { logoutAction } from "@/app/admin/logout/actions"
import type { TenantSession } from "@/lib/admin-auth"
import { useState } from "react"

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "询盘管理", icon: MessageSquare },
  { href: "/admin/products", label: "产品管理", icon: Package },
  { href: "/admin/articles", label: "文章管理", icon: FileText },
  { href: "/admin/pages", label: "页面编辑", icon: Layout },
  { href: "/admin/settings", label: "网站设置", icon: Settings },
]

interface AdminSidebarProps {
  session: TenantSession
}

function SidebarContent({ session }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            A
          </div>
          <span className="font-semibold">管理后台</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium truncate">{session.tenant_name}</p>
          <p className="text-xs text-muted-foreground truncate">{session.email}</p>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" className="w-full justify-start" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </form>
      </div>
    </div>
  )
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent session={session} />
          </SheetContent>
        </Sheet>
        <span className="ml-3 font-semibold">管理后台</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <SidebarContent session={session} />
      </aside>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
