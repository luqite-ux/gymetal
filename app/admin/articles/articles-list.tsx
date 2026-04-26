"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { deleteArticle, toggleArticlePublish } from "./actions"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  is_published: boolean
  seo_title: string | null
  created_at: string
  published_at: string | null
}

interface ArticlesListProps {
  articles: Article[]
}

export function ArticlesList({ articles }: ArticlesListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return
    setIsLoading(true)
    await deleteArticle(id)
    router.refresh()
    setIsLoading(false)
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    await toggleArticlePublish(id, !currentStatus)
    router.refresh()
    setIsLoading(false)
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">暂无文章</p>
          <p className="text-muted-foreground mb-4">开始创作您的第一篇文章</p>
          <Button asChild>
            <Link href="/admin/articles/new">新建文章</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">图片</TableHead>
            <TableHead>标题</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {article.excerpt || article.slug}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={article.is_published ? "default" : "secondary"}>
                  {article.is_published ? "已发布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(article.created_at).toLocaleDateString("zh-CN")}
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
                      <Link href={`/admin/articles/${article.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTogglePublish(article.id, article.is_published)}
                    >
                      {article.is_published ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          取消发布
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          发布
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(article.id)}
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
