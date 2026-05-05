"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Highlight } from "@tiptap/extension-highlight"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { TextStyle, FontSize } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { TextAlign } from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Table as TableIcon,
  Rows3,
  Columns3,
  Trash2,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"]
const COLOR_PRESETS = ["#111827", "#dc2626", "#ea580c", "#16a34a", "#2563eb", "#9333ea"]

export function RichTextEditor({
  content,
  onChange,
  placeholder = "开始编写内容...",
  disabled = false,
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [fontSizeValue, setFontSizeValue] = useState("16px")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      transformPastedHTML(html) {
        if (!html) return html
        if (typeof window === "undefined") return html

        const parser = new window.DOMParser()
        const doc = parser.parseFromString(html, "text/html")

        doc.querySelectorAll("style,meta,link,xml").forEach((node) => node.remove())

        doc.querySelectorAll("*").forEach((el) => {
          if (el.tagName.includes(":")) {
            el.replaceWith(...Array.from(el.childNodes))
            return
          }

          Array.from(el.attributes).forEach((attr) => {
            const name = attr.name.toLowerCase()
            if (name === "style") {
              const cleaned = attr.value
                .split(";")
                .map((item) => item.trim())
                .filter(Boolean)
                .filter((item) => !item.toLowerCase().startsWith("mso-"))
                .join("; ")

              if (cleaned) {
                el.setAttribute("style", cleaned)
              } else {
                el.removeAttribute("style")
              }
              return
            }

            if (["class", "lang", "width", "height", "align", "valign"].includes(name) || name.startsWith("data-")) {
              el.removeAttribute(attr.name)
            }
          })
        })

        return doc.body.innerHTML
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])
  
  useEffect(() => {
    if (!editor) return
    const syncFontSize = () => {
      const size = (editor.getAttributes("textStyle").fontSize as string | undefined) || "16px"
      setFontSizeValue(size)
    }
    syncFontSize()
    editor.on("selectionUpdate", syncFontSize)
    editor.on("transaction", syncFontSize)
    return () => {
      editor.off("selectionUpdate", syncFontSize)
      editor.off("transaction", syncFontSize)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt("请输入链接地址:")
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }

  const addImageByUrl = () => {
    const url = window.prompt("请输入图片地址:")
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  const uploadImageToServer = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.set("file", file)

      const response = await fetch("/api/admin/uploads/editor-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("上传失败")
      }

      const data = (await response.json()) as { url?: string }
      if (!data.url) {
        throw new Error("返回地址为空")
      }

      editor.chain().focus().setImage({ src: data.url }).run()
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传图片失败"
      window.alert(message)
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background",
        isFullscreen && "fixed inset-4 z-50 flex flex-col rounded-2xl shadow-2xl"
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
        <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={disabled}>
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled}>
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={disabled}>
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <div className="mx-1 h-6 w-px bg-border" />

        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} disabled={disabled}>
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} disabled={disabled}>
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} disabled={disabled}>
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("code")} onPressedChange={() => editor.chain().focus().toggleCode().run()} disabled={disabled}>
          <Code className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("highlight")} onPressedChange={() => editor.chain().focus().toggleHighlight().run()} disabled={disabled}>
          <Highlighter className="h-4 w-4" />
        </Toggle>

        <select
          className="h-8 rounded border bg-background px-2 text-xs"
          value={fontSizeValue}
          disabled={disabled}
          onChange={(event) => editor.chain().focus().setFontSize(event.target.value).run()}
          title="字号"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded border bg-background px-1 py-1">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              className="h-5 w-5 rounded border"
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
              disabled={disabled}
              title={`颜色 ${color}`}
            />
          ))}
          <button
            type="button"
            className="h-5 rounded border px-1 text-[10px]"
            onClick={() => editor.chain().focus().unsetColor().run()}
            disabled={disabled}
            title="清除颜色"
          >
            清除
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <Toggle size="sm" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()} disabled={disabled}>
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()} disabled={disabled}>
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()} disabled={disabled}>
          <AlignRight className="h-4 w-4" />
        </Toggle>

        <div className="mx-1 h-6 w-px bg-border" />

        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled}>
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled}>
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} disabled={disabled}>
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button type="button" variant="ghost" size="sm" onClick={addLink} disabled={disabled}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addImageByUrl} disabled={disabled} title="通过 URL 插图">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploadingImage}
          title="上传图片到服务器"
        >
          {isUploadingImage ? "上传中..." : "上传图"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void uploadImageToServer(file)
            }
          }}
        />

        <div className="mx-1 h-6 w-px bg-border" />

        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={disabled} title="插入表格">
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={disabled || !editor.isActive("table")} title="新增一行">
          <Rows3 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={disabled || !editor.isActive("table")} title="新增一列">
          <Columns3 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteTable().run()} disabled={disabled || !editor.isActive("table")} title="删除表格">
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen((value) => !value)}
          title={isFullscreen ? "退出全屏" : "全屏编辑"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-[300px] p-4",
          isFullscreen && "flex-1 overflow-auto",
          "[&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:outline-none",
          isFullscreen && "[&_.ProseMirror]:min-h-[calc(100vh-220px)]",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse",
          "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:p-2",
          "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:bg-muted [&_.ProseMirror_th]:p-2",
          "[&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:bg-yellow-200 [&_.ProseMirror_mark]:px-1"
        )}
      />
    </div>
  )
}
