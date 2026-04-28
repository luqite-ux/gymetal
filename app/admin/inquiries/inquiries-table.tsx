"use client"

import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, MoreHorizontal, Mail, CheckCircle, Trash2 } from "lucide-react"
import { updateInquiryStatus, deleteInquiry } from "./actions"
import { useRouter } from "next/navigation"

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  subject: string | null
  message: string
  status: "unread" | "read" | "replied"
  created_at: string
}

interface InquiriesTableProps {
  inquiries: Inquiry[]
}

export function InquiriesTable({ inquiries }: InquiriesTableProps) {
  const router = useRouter()
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleView = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    if (inquiry.status === "unread") {
      await updateInquiryStatus(inquiry.id, "read")
      router.refresh()
    }
  }

  const handleStatusChange = async (id: string, status: "read" | "replied") => {
    setIsLoading(true)
    await updateInquiryStatus(id, status)
    router.refresh()
    setIsLoading(false)
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条询盘吗？")) return
    setIsLoading(true)
    await deleteInquiry(id)
    router.refresh()
    setIsLoading(false)
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive">未读</Badge>
      case "read":
        return <Badge variant="secondary">已读</Badge>
      case "replied":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">已回复</Badge>
      default:
        return null
    }
  }

  if (inquiries.length === 0) {
    return (
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Mail className="mb-4 h-12 w-12 text-slate-400" />
          <p className="text-lg font-semibold text-slate-900">暂无询盘</p>
          <p className="text-slate-500">当有客户提交询盘时，会在这里显示</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden rounded-3xl border-slate-100 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>主题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow
                key={inquiry.id}
                className={inquiry.status === "unread" ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-slate-50/70"}
              >
                <TableCell className="font-semibold text-slate-900">{inquiry.name}</TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell className="max-w-[200px] truncate">{inquiry.subject || "-"}</TableCell>
                <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                <TableCell className="text-slate-500">
                  {new Date(inquiry.created_at).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(inquiry)}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(inquiry.id, "replied")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        标记已回复
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(inquiry.id)}
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

      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>询盘详情</DialogTitle>
            <DialogDescription>
              来自 {selectedInquiry?.name} 的询盘
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">姓名</p>
                  <p>{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                  <p>{selectedInquiry.email}</p>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">电话</p>
                    <p>{selectedInquiry.phone}</p>
                  </div>
                )}
                {selectedInquiry.company && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">公司</p>
                    <p>{selectedInquiry.company}</p>
                  </div>
                )}
              </div>
              {selectedInquiry.subject && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">主题</p>
                  <p>{selectedInquiry.subject}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">内容</p>
                <p className="whitespace-pre-wrap bg-muted p-4 rounded-lg mt-1">
                  {selectedInquiry.message}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedInquiry.status)}
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedInquiry.created_at).toLocaleString("zh-CN")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedInquiry.id, "replied")}
                    disabled={isLoading || selectedInquiry.status === "replied"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    标记已回复
                  </Button>
                  <Button asChild>
                    <a href={`mailto:${selectedInquiry.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      回复邮件
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
