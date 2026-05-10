"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { Link } from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Image } from "@tiptap/extension-image"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  Undo,
  Redo,
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  ChevronDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

const HEADING_SIZES = [
  { label: "Tiêu đề 1", value: "1", icon: Heading1, level: 1 },
  { label: "Tiêu đề 2", value: "2", icon: Heading2, level: 2 },
  { label: "Tiêu đề 3", value: "3", icon: Heading3, level: 3 },
  { label: "Văn bản", value: "0", icon: Type, level: 0 },
] as const

const TEXT_COLORS = [
  { label: "Đen", value: "#000000" },
  { label: "Xám", value: "#6b7280" },
  { label: "Đỏ", value: "#ef4444" },
  { label: "Cam", value: "#f97316" },
  { label: "Vàng", value: "#eab308" },
  { label: "Xanh lá", value: "#22c55e" },
  { label: "Xanh dương", value: "#3b82f6" },
  { label: "Hồng", value: "#ec4899" },
  { label: "Tím", value: "#8b5cf6" },
]

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors",
        "hover:bg-muted",
        "disabled:opacity-40 disabled:pointer-events-none",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-5 bg-border mx-0.5" />
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung email...",
  className,
  minHeight = 320,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Placeholder.configure({ placeholder }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  function setLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Nhập URL:", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const wordCount = editor.getText().split(/\s+/).filter(Boolean).length

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/40">
        {/* Heading dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs font-normal">
              <Type className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {HEADING_SIZES.find((h) => h.value === "0")?.label || "Văn bản"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {HEADING_SIZES.map((h) => (
              <DropdownMenuItem
                key={h.value}
                onClick={() => {
                  if (h.level === 0) {
                    editor.chain().focus().setParagraph().run()
                  } else {
                    editor.chain().focus().setHeading({ level: h.level as 1 | 2 | 3 }).run()
                  }
                }}
                className="gap-2"
              >
                <h.icon className="h-4 w-4" />
                {h.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator />

        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Đậm (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Nghiêng (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Strikethrough */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Gạch ngang"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Separator />

        {/* Bullet list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Danh sách gạch đầu dòng"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Numbered list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Danh sách đánh số"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Separator />

        {/* Align left */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Căn trái"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Align center */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Căn giữa"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Align right */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Căn phải"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Separator />

        {/* Text color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 p-1.5">
              <div
                className="w-4 h-4 rounded border border-black/30"
                style={{ backgroundColor: "#000000" }}
              />
              <Palette className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <div className="grid grid-cols-3 gap-1 p-2">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  className="w-8 h-8 rounded border-2 border-transparent hover:border-foreground transition-colors"
                  style={{ backgroundColor: color.value }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor.chain().focus().setColor(color.value).run()
                  }}
                />
              ))}
            </div>
            <div className="p-2 border-t">
              <Input
                type="color"
                value={editor.getAttributes("textStyle").color || "#000000"}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="h-8 w-full cursor-pointer p-1"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Chèn liên kết"
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Unlink */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Xóa liên kết"
        >
          <Unlink className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Separator />

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Xóa định dạng"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Undo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className=" [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:cursor-text [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/60 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
        style={{ minHeight }}
      />
    </div>
  )
}
