"use client"

import { useState } from "react"
import Link from "next/link"
import { buildAdminPreviewUrl } from "@/lib/admin-image"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { deleteProduct, updateProductOrder } from "./actions"

interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

interface ProductsListProps {
  products: Product[]
}

export function ProductsList({ products }: ProductsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个产品吗？")) return
    setIsLoading(true)
    await deleteProduct(id)
    router.refresh()
    setIsLoading(false)
  }

  const handleOrder = async (id: string, order: number) => {
    if (!Number.isInteger(order) || order < 0 || order > 100000) {
      setError("排序请填写 0 至 100000 的整数")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      await updateProductOrder(id, order)
      router.refresh()
    } catch {
      setError("排序保存失败，请刷新后重试")
    } finally { setIsLoading(false) }
  }

  if (products.length === 0) {
    return (
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="mb-4 h-12 w-12 text-slate-400" />
          <p className="text-lg font-semibold text-slate-900">暂无产品</p>
          <p className="mb-4 text-slate-500">开始添加您的第一个产品</p>
          <Button asChild className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
            <Link href="/admin/products/new">添加产品</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-100 shadow-sm">
      <p className="px-6 py-3 text-sm text-slate-600">排序数字越小越靠前；修改后离开输入框即保存。请使用不同数字区分先后。</p>
      {error && <p role="alert" className="px-6 text-sm text-red-700">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="w-[80px] text-[11px] uppercase tracking-wide text-slate-400">图片</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>排序</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="transition-colors hover:bg-slate-50/70">
              <TableCell>
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  {product.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={buildAdminPreviewUrl(product.image_url) ?? product.image_url}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold text-slate-900">{product.name}</TableCell>
              <TableCell>
                {product.category || "-"}
              </TableCell>
              <TableCell>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "上架" : "下架"}
                </Badge>
              </TableCell>
              <TableCell>
                <Input key={`${product.id}:${product.sort_order}`} type="number" min={0} max={100000}
                  aria-label={`${product.name} 排序`} className="w-24" defaultValue={product.sort_order}
                  disabled={isLoading} onBlur={event=>{
                    const value=event.currentTarget.value
                    if(value.trim() && Number(value)!==product.sort_order) return handleOrder(product.id,Number(value))
                  }}/>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(product.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
