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
      <div className="px-6 pb-8 pt-7">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white shadow-lg shadow-slate-200">
            GY
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-900">GY 管理后台</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/70">Control Center</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.4]" : "stroke-[2]")} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white/80" />}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4">
        <div className="rounded-3xl bg-slate-900 p-5">
          <div className="mb-4 min-w-0">
            <p className="truncate text-sm font-semibold text-white">{session.tenant_name}</p>
            <p className="truncate text-xs text-slate-400">{session.email}</p>
          </div>
          <form action={logoutAction}>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              type="submit"
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
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
        <span className="ml-3 text-sm font-black tracking-tight text-slate-900">GY 管理后台</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-100 bg-white lg:block">
        <SidebarContent session={session} />
      </aside>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
